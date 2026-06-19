import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";

// In-memory databases for sessions and shared files
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Increase request size limit for base64 file transfers (up to 50MB files)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

interface TempSharedFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  senderId: string;
  senderName: string;
  buffer: Buffer;
  timestamp: string;
}

const sharedFilesDb = new Map<string, TempSharedFile>();

// API routes for file sharing P2P/Server
app.post("/api/upload", (req, res) => {
  try {
    const { fileId, name, size, mimeType, senderId, senderName, base64Data } = req.body;
    
    if (!fileId || !name || !base64Data) {
      return res.status(400).json({ error: "Eksik parametreler (Id, Name, Data gerekli)" });
    }

    // Convert base64 back to buffer
    const buffer = Buffer.from(base64Data, 'base64');
    
    sharedFilesDb.set(fileId, {
      id: fileId,
      name,
      size,
      mimeType: mimeType || 'application/octet-stream',
      senderId,
      senderName,
      buffer,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, downloadUrl: `/api/download/${fileId}` });
  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Dosya yüklenirken hata oluştu: " + error.message });
  }
});

app.get("/api/download/:fileId", (req, res) => {
  const { fileId } = req.params;
  const file = sharedFilesDb.get(fileId);

  if (!file) {
    return res.status(404).send("Dosya bulunamadı veya süresi doldu.");
  }

  res.setHeader("Content-Type", file.mimeType);
  res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(file.name)}"${file.name.match(/^[\x00-\x7F]*$/) ? '' : `; filename*=UTF-8''${encodeURIComponent(file.name)}`}`);
  res.setHeader("Content-Length", file.buffer.length);
  res.send(file.buffer);
});

// Websocket Signaling & Connection State
interface ConnectedClient {
  id: string; // 9-digit string "123 456 789"
  name: string;
  ws: WebSocket;
  activeSessionWith: string | null; // peer ID
}

const clients = new Map<string, ConnectedClient>();

// Helper to generate a unique 9-digit desktop ID (formatted as "xxx xxx xxx")
function generateDesktopId(): string {
  let attempts = 0;
  while (attempts < 100) {
    const digits = Math.floor(100000000 + Math.random() * 900000000).toString();
    const formatted = `${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6, 9)}`;
    if (!clients.has(formatted)) {
      return formatted;
    }
    attempts++;
  }
  return "000 000 000";
}

const wss = new WebSocketServer({ noServer: true });

// Handle WebSocket HTTP upgrades
server.on("upgrade", (request, socket, head) => {
  const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
  if (pathname === "/ws") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on("connection", (ws: WebSocket) => {
  let clientCabinet: ConnectedClient | null = null;

  ws.on("message", (rawMessageString: string) => {
    try {
      const payload = JSON.parse(rawMessageString);
      const { type, data } = payload;

      switch (type) {
        case "client:register": {
          const { clientName } = data;
          const assignedId = generateDesktopId();
          
          clientCabinet = {
            id: assignedId,
            name: clientName || "Anonim Cihaz",
            ws,
            activeSessionWith: null
          };
          
          clients.set(assignedId, clientCabinet);
          
          ws.send(JSON.stringify({
            type: "client:id",
            data: { id: assignedId, name: clientCabinet.name }
          }));

          console.log(`Registered client: ${clientCabinet.name} (${assignedId})`);
          break;
        }

        case "session:connect": {
          // A controller is requesting connection to a host
          if (!clientCabinet) return;
          const { targetId } = data;
          console.log(`Connection request: ${clientCabinet.id} -> ${targetId}`);

          const hostClient = clients.get(targetId);
          if (!hostClient) {
            ws.send(JSON.stringify({
              type: "session:error",
              data: { message: "Girdiğiniz bağlantı koduna sahip aktif bir cihaz bulunamadı!" }
            }));
            return;
          }

          if (hostClient.activeSessionWith) {
            ws.send(JSON.stringify({
              type: "session:error",
              data: { message: "Bu cihaz şu anda başka bir aktif uzak oturumda." }
            }));
            return;
          }

          // Relay connection proposal to the target host client
          hostClient.ws.send(JSON.stringify({
            type: "session:request",
            data: {
              controllerId: clientCabinet.id,
              controllerName: clientCabinet.name
            }
          }));
          break;
        }

        case "session:accept": {
          // Host accepted the connection proposal
          if (!clientCabinet) return;
          const { controllerId } = data;
          const controllerClient = clients.get(controllerId);

          if (!controllerClient) {
            ws.send(JSON.stringify({
              type: "session:error",
              data: { message: "Uzak istemci bağlantıyı kuramadan çevrimdışı oldu." }
            }));
            return;
          }

          // Link both clients together
          clientCabinet.activeSessionWith = controllerId;
          controllerClient.activeSessionWith = clientCabinet.id;

          console.log(`Session established: ${controllerId} <--> ${clientCabinet.id}`);

          // Notify the controller that they are in!
          controllerClient.ws.send(JSON.stringify({
            type: "session:established",
            data: {
              peerId: clientCabinet.id,
              peerName: clientCabinet.name,
              role: "controller"
            }
          }));

          // Notify the host too
          ws.send(JSON.stringify({
            type: "session:established",
            data: {
              peerId: controllerClient.id,
              peerName: controllerClient.name,
              role: "host"
            }
          }));
          break;
        }

        case "session:reject": {
          // Host rejected
          if (!clientCabinet) return;
          const { controllerId } = data;
          const controllerClient = clients.get(controllerId);
          
          if (controllerClient) {
            controllerClient.ws.send(JSON.stringify({
              type: "session:rejected",
              data: { message: "Bağlantı isteğiniz uzak cihaz tarafından reddedildi." }
            }));
          }
          break;
        }

        case "session:terminate": {
          // Either client terminated the active session
          if (!clientCabinet || !clientCabinet.activeSessionWith) return;
          const peerId = clientCabinet.activeSessionWith;
          const peerClient = clients.get(peerId);

          // Clear associations
          clientCabinet.activeSessionWith = null;
          if (peerClient) {
            peerClient.activeSessionWith = null;
            // Inform peer
            peerClient.ws.send(JSON.stringify({
              type: "session:closed",
              data: { message: "Uzak masaüstü bağlantısı karşı tarafça sonlandırıldı." }
            }));
          }

          // Inform self
          ws.send(JSON.stringify({
            type: "session:closed",
            data: { message: "Oturum sonlandırıldı." }
          }));

          console.log(`Session terminated between: ${clientCabinet.id} and ${peerId}`);
          break;
        }

        // Real-Time signaling payloads to relay to peer in active session
        case "desktop:update":
        case "mouse:move":
        case "mouse:click":
        case "desktop:action":
        case "canvas:draw":
        case "editor:change":
        case "chat:msg":
        case "file:meta": {
          if (!clientCabinet || !clientCabinet.activeSessionWith) return;
          const peerId = clientCabinet.activeSessionWith;
          const peerClient = clients.get(peerId);
          
          if (peerClient) {
            peerClient.ws.send(JSON.stringify({
              type,
              data
            }));
          }
          break;
        }

        case "heartbeat": {
          ws.send(JSON.stringify({ type: "heartbeat:pong" }));
          break;
        }

        default:
          console.warn(`Unknown WebSocket message type: ${type}`);
      }
    } catch (e) {
      console.error("WS Message processing error:", e);
    }
  });

  ws.on("close", () => {
    if (clientCabinet) {
      console.log(`Client disconnected: ${clientCabinet.name} (${clientCabinet.id})`);
      const peerId = clientCabinet.activeSessionWith;
      if (peerId) {
        const peerClient = clients.get(peerId);
        if (peerClient) {
          peerClient.activeSessionWith = null;
          peerClient.ws.send(JSON.stringify({
            type: "session:closed",
            data: { message: "Uzak terminal bağlantısı beklenmedik şekilde koptu (Cihaz Kapandı)." }
          }));
        }
      }
      clients.delete(clientCabinet.id);
    }
  });
});

// Serve frontend assets
if (process.env.NODE_ENV !== "production") {
  createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  }).then((vite) => {
    app.use(vite.middlewares);
    
    // Fallback client route
    app.use("*", (req, res, next) => {
      vite.middlewares(req, res, next);
    });
  });
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Start HTTP server on port 3000
server.listen(PORT, "0.0.0.0", () => {
  console.log(`AnyDesk simulator listening on http://localhost:${PORT}`);
});

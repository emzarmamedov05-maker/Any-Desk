const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const http = require('http');
const express = require('express');
const { WebSocketServer, WebSocket } = require('ws');

const PORT = 3000;

// ── Express + WebSocket Server (server.ts logic, CommonJS) ──────────────────

function startServer() {
  const expressApp = express();
  const server = http.createServer(expressApp);

  expressApp.use(express.json({ limit: '50mb' }));
  expressApp.use(express.urlencoded({ limit: '50mb', extended: true }));

  const sharedFilesDb = new Map();

  expressApp.post('/api/upload', (req, res) => {
    try {
      const { fileId, name, size, mimeType, senderId, senderName, base64Data } = req.body;
      if (!fileId || !name || !base64Data)
        return res.status(400).json({ error: 'Eksik parametreler' });
      const buffer = Buffer.from(base64Data, 'base64');
      sharedFilesDb.set(fileId, { id: fileId, name, size, mimeType: mimeType || 'application/octet-stream', senderId, senderName, buffer, timestamp: new Date().toISOString() });
      res.json({ success: true, downloadUrl: `/api/download/${fileId}` });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  expressApp.get('/api/download/:fileId', (req, res) => {
    const file = sharedFilesDb.get(req.params.fileId);
    if (!file) return res.status(404).send('Dosya bulunamadı.');
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.name)}"`);
    res.setHeader('Content-Length', file.buffer.length);
    res.send(file.buffer);
  });

  // Serve built React frontend
  const distPath = path.join(__dirname, '..', 'dist');
  expressApp.use(express.static(distPath));
  expressApp.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));

  // ── WebSocket Signaling ──────────────────────────────────────────────────
  const clients = new Map();

  function generateDesktopId() {
    for (let i = 0; i < 100; i++) {
      const d = Math.floor(100000000 + Math.random() * 900000000).toString();
      const id = `${d.slice(0,3)} ${d.slice(3,6)} ${d.slice(6,9)}`;
      if (!clients.has(id)) return id;
    }
    return '000 000 000';
  }

  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;
    if (pathname === '/ws') wss.handleUpgrade(req, socket, head, ws => wss.emit('connection', ws, req));
    else socket.destroy();
  });

  wss.on('connection', (ws) => {
    let cabinet = null;

    ws.on('message', (raw) => {
      try {
        const { type, data } = JSON.parse(raw);
        switch (type) {
          case 'client:register': {
            const id = generateDesktopId();
            cabinet = { id, name: data.clientName || 'Anonim Cihaz', ws, activeSessionWith: null };
            clients.set(id, cabinet);
            ws.send(JSON.stringify({ type: 'client:id', data: { id, name: cabinet.name } }));
            break;
          }
          case 'session:connect': {
            if (!cabinet) return;
            const host = clients.get(data.targetId);
            if (!host) { ws.send(JSON.stringify({ type: 'session:error', data: { message: 'Aktif cihaz bulunamadı!' } })); return; }
            if (host.activeSessionWith) { ws.send(JSON.stringify({ type: 'session:error', data: { message: 'Cihaz başka bir oturumda.' } })); return; }
            host.ws.send(JSON.stringify({ type: 'session:request', data: { controllerId: cabinet.id, controllerName: cabinet.name } }));
            break;
          }
          case 'session:accept': {
            if (!cabinet) return;
            const ctrl = clients.get(data.controllerId);
            if (!ctrl) { ws.send(JSON.stringify({ type: 'session:error', data: { message: 'İstemci çevrimdışı.' } })); return; }
            cabinet.activeSessionWith = data.controllerId;
            ctrl.activeSessionWith = cabinet.id;
            ctrl.ws.send(JSON.stringify({ type: 'session:established', data: { peerId: cabinet.id, peerName: cabinet.name, role: 'controller' } }));
            ws.send(JSON.stringify({ type: 'session:established', data: { peerId: ctrl.id, peerName: ctrl.name, role: 'host' } }));
            break;
          }
          case 'session:reject': {
            if (!cabinet) return;
            const ctrl = clients.get(data.controllerId);
            if (ctrl) ctrl.ws.send(JSON.stringify({ type: 'session:rejected', data: { message: 'Bağlantı reddedildi.' } }));
            break;
          }
          case 'session:terminate': {
            if (!cabinet || !cabinet.activeSessionWith) return;
            const peer = clients.get(cabinet.activeSessionWith);
            cabinet.activeSessionWith = null;
            if (peer) {
              peer.activeSessionWith = null;
              peer.ws.send(JSON.stringify({ type: 'session:closed', data: { message: 'Bağlantı karşı tarafça kesildi.' } }));
            }
            ws.send(JSON.stringify({ type: 'session:closed', data: { message: 'Oturum sonlandırıldı.' } }));
            break;
          }
          case 'desktop:update': case 'mouse:move': case 'mouse:click':
          case 'desktop:action': case 'canvas:draw': case 'editor:change':
          case 'chat:msg': case 'file:meta': {
            if (!cabinet || !cabinet.activeSessionWith) return;
            const peer = clients.get(cabinet.activeSessionWith);
            if (peer) peer.ws.send(JSON.stringify({ type, data }));
            break;
          }
          case 'heartbeat':
            ws.send(JSON.stringify({ type: 'heartbeat:pong' }));
            break;
        }
      } catch (e) { console.error('WS error:', e); }
    });

    ws.on('close', () => {
      if (cabinet) {
        if (cabinet.activeSessionWith) {
          const peer = clients.get(cabinet.activeSessionWith);
          if (peer) { peer.activeSessionWith = null; peer.ws.send(JSON.stringify({ type: 'session:closed', data: { message: 'Bağlantı koptu.' } })); }
        }
        clients.delete(cabinet.id);
      }
    });
  });

  server.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://localhost:${PORT}`));
  return server;
}

// ── Electron Window ──────────────────────────────────────────────────────────

let mainWindow;
let serverInstance;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'Uzak Masaüstü Bağlantısı',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: { nodeIntegration: false, contextIsolation: true },
    backgroundColor: '#0c0c0c',
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadURL(`http://localhost:${PORT}`);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  serverInstance = startServer();
  // Give server 800ms to bind before loading the window
  setTimeout(createWindow, 800);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (serverInstance) serverInstance.close();
    app.quit();
  }
});

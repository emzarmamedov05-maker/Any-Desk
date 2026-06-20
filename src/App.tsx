import { useState, useEffect, useRef } from 'react';
import { 
  Monitor, ShieldAlert, Wifi, Link2, Copy, Check, LogOut, 
  Settings, UserCheck, HelpCircle, HardDrive, RefreshCw, Volume2, VolumeX, ShieldCheck
} from 'lucide-react';
import { ChatMessage, DesktopState, SharedFile, SessionStatus, ConnectionRole } from './types';
import ChatPanel from './components/ChatPanel';
import FileTransfer from './components/FileTransfer';
import VirtualDesktop from './components/VirtualDesktop';
import { playBeep, playSuccess, playError } from './components/AudioEffects';

export default function App() {
  // Client general metadata
  const [myId, setMyId] = useState<string>('000 000 000');
  const [myName, setMyName] = useState<string>('');
  const [isNameSet, setIsNameSet] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  // Connection control flow states
  const [remoteIdInput, setRemoteIdInput] = useState<string>('');
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('idle');
  const [role, setRole] = useState<ConnectionRole>('none');
  const [peerId, setPeerId] = useState<string | null>(null);
  const [peerName, setPeerName] = useState<string | null>(null);
  const [hasControlPermission, setHasControlPermission] = useState<boolean>(true);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);

  // Incoming session proposal details
  const [incomingProposal, setIncomingProposal] = useState<{ controllerId: string; controllerName: string } | null>(null);

  // Sync contents
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
  const [desktopState, setDesktopState] = useState<DesktopState>({
    windows: [
      { id: 'files', title: 'Paylaşılan Klasör', isOpen: false, isMinimized: false, isMaximized: false, position: { x: 190, y: 90 }, size: { width: 380, height: 220 }, zIndex: 1, icon: 'FolderOpen' }
    ],
    activeWindowId: null,
    cursorPosition: { x: 50, y: 50 },
    isDrawingActive: false,
    notesContent: '',
    canvasLines: [],
    terminalHistory: [
      'AnyOS Kernel v4.9 (init boot: micro-sandbox active)',
      'Ağ adaptörleri kuruluyor...',
      'Masaüstü başlatıldı. Uzak kontrolcü bağlantısı bekleniyor.'
    ]
  });

  // Client references
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatIntervalRef = useRef<any>(null);

  // Automatic PC names naming algorithm
  useEffect(() => {
    const defaultMockNames = [
      "Ofis_Bilgisayari_A", "Tasarim_PC_Pro", "Yonetici_MacBook",
      "Siber_Guvenlik_Nodu", "Uzaktan_Destek_Terminali", "Developer_Workspace"
    ];
    const pickedName = defaultMockNames[Math.floor(Math.random() * defaultMockNames.length)] + '_' + Math.floor(100 + Math.random() * 900);
    setMyName(localStorage.getItem('anydesk_client_name') || pickedName);
  }, []);

  // Web socket core state pipeline setup
  const initWebSocketConnection = (clientName: string) => {
    const isElectron = navigator.userAgent.toLowerCase().includes('electron');
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = isElectron ? 'any-desk-1.onrender.com' : window.location.host;
    const wsUrl = isElectron ? `wss://${wsHost}/ws` : `${wsProtocol}//${wsHost}/ws`;

    console.log("Connecting to AnyDesk signaler:", wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to signaler socket!");
      // Identify self
      ws.send(JSON.stringify({
        type: "client:register",
        data: { clientName }
      }));

      // Setup Heartbeat to prevent inactive timeouts (20 seconds lock)
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "heartbeat" }));
        }
      }, 20000);
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { type, data } = payload;

        switch (type) {
          case "client:id": {
            setMyId(data.id);
            console.log("My assigned connection ID:", data.id);
            break;
          }

          case "session:request": {
            // Received remote controller connection proposal
            if (isSoundEnabled) playBeep();
            setIncomingProposal({
              controllerId: data.controllerId,
              controllerName: data.controllerName
            });
            break;
          }

          case "session:established": {
            // Successfully connected to peer
            setSessionStatus('connected');
            setPeerId(data.peerId);
            setPeerName(data.peerName);
            setRole(data.role);
            setIncomingProposal(null);
            
            if (isSoundEnabled) playSuccess();

            // Insert system message indicating session started status
            const initialNotice: ChatMessage = {
              id: 'sys_' + Math.random().toString(36).substr(2, 9),
              senderId: 'sys',
              senderName: 'SİSTEM',
              text: `Uzak Bağlantı Başlatıldı! Oynatıcı: ${data.peerName} (${data.peerId})`,
              timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
              isSystem: true
            };
            setChatMessages([initialNotice]);
            break;
          }

          case "session:rejected": {
            // Connection rejected
            setSessionStatus('rejected');
            if (isSoundEnabled) playError();
            alert(data.message || "Uzak bilgisayar bağlantı talebinizi reddetti.");
            setSessionStatus('idle');
            break;
          }

          case "session:closed": {
            // Remote peer terminated connection
            setSessionStatus('disconnected');
            if (isSoundEnabled) playError();
            alert(data.message || "Bağlantı koptu.");
            resetSessionLocalState();
            break;
          }

          case "session:error": {
            // Validation or routing host error
            if (isSoundEnabled) playError();
            alert(data.message || "Bağlantı hatası oluştu.");
            setSessionStatus('idle');
            break;
          }

          // Dynamic remote control states syncing relays
          case "desktop:update": {
            setDesktopState((prev) => ({
              ...prev,
              ...data
            }));
            break;
          }

          case "mouse:move": {
            // Set sync cursor
            setDesktopState((prev) => ({
              ...prev,
              cursorPosition: data.cursorPosition
            }));
            break;
          }

          case "canvas:draw": {
            setDesktopState((prev) => ({
              ...prev,
              canvasLines: [...prev.canvasLines, data]
            }));
            break;
          }

          case "editor:change": {
            setDesktopState((prev) => ({
              ...prev,
              notesContent: data
            }));
            break;
          }

          case "chat:msg": {
            if (isSoundEnabled) playBeep();
            setChatMessages((prev) => [...prev, data]);
            break;
          }

          case "file:meta": {
            if (isSoundEnabled) playBeep();
            setSharedFiles((prev) => [...prev, data]);
            break;
          }

          case "heartbeat:pong":
            // Keep alive confirmed
            break;
        }
      } catch (err) {
        console.error("Decoding packet error:", err);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected.");
      clearInterval(heartbeatIntervalRef.current);
    };
  };

  const handleSaveNameAndConnect = () => {
    if (!myName.trim()) return;
    localStorage.setItem('anydesk_client_name', myName.trim());
    setIsNameSet(true);
    initWebSocketConnection(myName.trim());
  };

  // Trigger outbound connection to a host
  const handleConnectToRemoteHost = () => {
    if (!remoteIdInput.trim()) {
      alert("Lütfen bağlanmak için 9 haneli bir Alıcı ID'si giriniz.");
      return;
    }
    
    // Clean formatted spaces
    const targetId = remoteIdInput.trim();
    if (targetId === myId) {
      alert("Kendi kendinize uzak masaüstü bağlantısı kuramazsınız.");
      return;
    }

    setSessionStatus('connecting');
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "session:connect",
        data: { targetId }
      }));
    } else {
      setSessionStatus('idle');
      alert("Bağlantı tünel sunucusu çevrimdışı!");
    }
  };

  // Host confirms proposal
  const handleAcceptProposal = () => {
    if (!incomingProposal) return;
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "session:accept",
        data: { controllerId: incomingProposal.controllerId }
      }));
    }
    setIncomingProposal(null);
  };

  // Host rejects proposal
  const handleRejectProposal = () => {
    if (!incomingProposal) return;
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "session:reject",
        data: { controllerId: incomingProposal.controllerId }
      }));
    }
    setIncomingProposal(null);
  };

  // Close active connection
  const handleTerminateSession = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "session:terminate"
      }));
    }
    resetSessionLocalState();
  };

  const resetSessionLocalState = () => {
    setSessionStatus('idle');
    setPeerId(null);
    setPeerName(null);
    setRole('none');
    setChatMessages([]);
    setSharedFiles([]);
  };

  // Real-time synchronization event publishers
  const sendStateUpdate = (updatedChunk: Partial<DesktopState>) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && peerId) {
      wsRef.current.send(JSON.stringify({
        type: "desktop:update",
        data: updatedChunk
      }));
    }
  };

  const sendCanvasDraw = (newLine: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && peerId) {
      wsRef.current.send(JSON.stringify({
        type: "canvas:draw",
        data: newLine
      }));
    }
  };

  const sendEditorChange = (content: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && peerId) {
      wsRef.current.send(JSON.stringify({
        type: "editor:change",
        data: content
      }));
    }
  };

  const handleSendChatMessage = (text: string) => {
    const message: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      senderId: myId,
      senderName: myName,
      text,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, message]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && peerId) {
      wsRef.current.send(JSON.stringify({
        type: "chat:msg",
        data: message
      }));
    }
  };

  const handleUploadSuccess = (sharedFile: SharedFile) => {
    setSharedFiles((prev) => [...prev, sharedFile]);

    // Send file meta payload via WebSockets immediately to sync peer list
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && peerId) {
      wsRef.current.send(JSON.stringify({
        type: "file:meta",
        data: sharedFile
      }));
    }

    // Append beautiful event log block to Chat
    const infoChat: ChatMessage = {
      id: 'file_notice_' + Math.random().toString(36).substr(2, 9),
      senderId: 'sys',
      senderName: 'SİSTEM',
      text: `📂 ${sharedFile.senderName} adlı kullanıcı bir dosya gönderdi: ${sharedFile.name}`,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    };
    setChatMessages((prev) => [...prev, infoChat]);
  };

  // Helper copy connection code clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(myId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen text-neutral-100 font-sans flex flex-col selection:bg-red-500/20 selection:text-red-200">
      
      {/* Background radial glow */}
      <div className="absolute top-0 left-0 right-0 h-[430px] bg-gradient-to-b from-red-500/5 to-transparent pointer-events-none select-none" />

      {/* Header bar */}
      <header className="relative z-10 border-b border-neutral-900/80 bg-[#0c0c0c]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-heading font-bold text-white text-sm shadow-[0_0_15px_rgba(239,68,68,0.25)]">
            AD
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-white/95 flex items-center gap-2 font-heading">
              AnyDesk Remote Desktop Control
            </h1>
            <p className="text-[9px] text-neutral-400 font-mono uppercase tracking-widest leading-none mt-1">Siber-Simülasyon Ağ Tüneli</p>
          </div>
        </div>

        {isNameSet && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-neutral-400 bg-neutral-900/80 px-3 py-1.5 rounded-xl border border-neutral-800/80">
              <Wifi className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>Ağ Durumu: <strong className="text-emerald-400 font-semibold font-mono">Tünel Aktif (Port: 3000)</strong></span>
            </div>

            <button
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className="p-2 rounded-xl border border-neutral-800/80 hover:border-neutral-700 bg-neutral-900/60 hover:bg-neutral-800 text-neutral-305 hover:text-white transition-all cursor-pointer"
              title={isSoundEnabled ? "Sesli uyarıları kapat" : "Sesli uyarıları aç"}
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
            </button>
          </div>
        )}
      </header>

      {/* Main container */}
      <main className="flex-1 relative z-10 p-4 lg:p-6 flex flex-col">
        {!isNameSet ? (
          /* USER REGISTER NAME SCREEN */
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="w-full max-w-md bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-xl rounded-2xl p-6 lg:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-600 via-red-500 to-amber-500" />

              <div className="text-center mb-6">
                <div id="launcher-badge" className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-950/30 border border-red-900/60 text-red-500 mb-4 shadow-inner">
                  <Monitor className="w-5.5 h-5.5" />
                </div>
                <h2 className="text-lg font-semibold text-white font-heading tracking-tight">Uzak Bağlantı İstemcisini Başlat</h2>
                <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">Uzak bilgisayarlara bağlanmak ve kendi bilgisayarınızı uzaktan paylaştırmak için takma isim girin.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label id="pc-name-lbl" className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5 font-mono">Cihaz İsmi (Bilgisayar Adı)</label>
                  <input
                    type="text"
                    value={myName}
                    onChange={(e) => setMyName(e.target.value)}
                    placeholder="Ör: Ofis_PC_Kaan"
                    className="w-full bg-neutral-950/60 border border-neutral-800 text-neutral-100 placeholder-neutral-500 text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-red-500/50 hover:border-neutral-700 transition-all font-sans"
                  />
                </div>

                <button
                  onClick={handleSaveNameAndConnect}
                  disabled={!myName.trim()}
                  className="w-full py-3.5 bg-red-650 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl font-medium shadow-[0_4px_20px_rgba(239,68,68,0.15)] hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 animate-spin-slow" />
                  Uzak Yönetim Merkezine Bağlan
                </button>
              </div>

              <div className="mt-6 border-t border-neutral-800/80 pt-4 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-[10px] text-neutral-400 leading-relaxed">
                  Bu simülasyon sisteminde bağlantılar **WebSockets** ile gerçek zamanlı koordine edilir. Gerçek dosyalarınız in-memory tampon bellek üzerinden RAM'de taşınır, sunucuda kalıcı depolanmaz.
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* CONFIGURE DESKTOP WORKSPACE SCREEN */
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
            
            {/* LEFT PROFILE CONTROLS PANEL */}
            <div className="lg:col-span-4 flex flex-col gap-5 lg:gap-6 min-h-[380px]">
              
              {/* This Device Connection Codes Card */}
              <div className="bg-neutral-900/40 backdrop-blur-md rounded-2xl border border-neutral-800/60 p-5 shadow-xl transition-all duration-300 hover:border-neutral-700/40">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                    <UserCheck className="w-4 h-4 text-red-500" />
                    Bu Masaüstü (Özellikleriniz)
                  </h3>
                  <span className="text-[9px] bg-red-950/40 text-red-400 px-2 py-0.5 rounded border border-red-900/30 font-semibold font-mono">
                    SAHİBİ
                  </span>
                </div>

                <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-900 hover:border-neutral-800 transition-all">
                  <div className="text-[9px] text-neutral-500 font-semibold uppercase tracking-wider mb-1 font-mono">Cihaz İsmi: <strong className="text-neutral-300 font-bold">{myName}</strong></div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <p className="text-[10px] text-neutral-500 leading-none mb-1.5 font-mono">Uzak Bağlantı Adresiniz:</p>
                      <h4 id="my-assigned-id" className="text-xl md:text-2xl font-bold text-neutral-50 font-mono tracking-wider">
                        {myId}
                      </h4>
                    </div>

                    <button
                      onClick={handleCopyCode}
                      className="p-3 bg-neutral-900/80 hover:bg-neutral-800 hover:text-red-400 text-neutral-300 border border-neutral-800 rounded-xl transition-all shadow-md flex items-center justify-center cursor-pointer"
                      title="Adresi panoya kopyala"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-neutral-500 mt-3.5 leading-relaxed">
                  Karşı tarafın sizin bilgisayarınızı izleyip kontrol edebilmesi veya dosya gönderebilmesi için yukarıdaki <strong className="text-red-500 font-medium font-mono">{myId}</strong> kodunu kendisiyle paylaşın.
                </p>
              </div>

              {/* Establish Remote Control Card */}
              <div className="bg-neutral-900/40 backdrop-blur-md rounded-2xl border border-neutral-800/60 p-5 shadow-xl transition-all duration-300 hover:border-neutral-700/40">
                <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5 mb-3.5 font-mono">
                  <Link2 className="w-4 h-4 text-red-500" />
                  Alıcı Bağlantısı Kur (Uzak Masaüstü)
                </h3>

                {sessionStatus === 'idle' ? (
                  <div className="space-y-3.5">
                    <div>
                      <input
                        type="text"
                        value={remoteIdInput}
                        onChange={(e) => setRemoteIdInput(e.target.value)}
                        placeholder="Uzak adresi girin (örn: 482 194 921)"
                        className="w-full bg-neutral-950/60 border border-neutral-800 hover:border-neutral-700 text-neutral-200 placeholder-neutral-500 text-xs px-3.5 py-3 rounded-xl focus:outline-none focus:border-red-500/50 font-mono tracking-widest text-center transition-all"
                      />
                    </div>

                    <button
                      onClick={handleConnectToRemoteHost}
                      className="w-full py-3 bg-red-650 hover:bg-red-600 font-semibold text-white text-xs rounded-xl transition-all shadow-lg hover:shadow-red-950/10 border border-red-500 active:scale-[0.99] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      Uzak Bilgisayara Bağlan
                    </button>
                  </div>
                ) : (
                  /* SESSION RUNNING ACTIVE CONTROLS PANEL */
                  <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-xl p-3.5 space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-850 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-neutral-300 font-mono">ÖZEL OTURUM AKTİF</span>
                      </div>
                      <span className="text-[9px] font-semibold text-neutral-500 font-mono">
                        {role === 'host' ? 'Ana Makine' : 'Kontrolör'}
                      </span>
                    </div>

                    <div className="text-xs">
                      <p className="text-[10px] text-neutral-500 font-mono">Bağlantı Kurulan Makine:</p>
                      <p className="font-bold text-neutral-200 truncate mt-0.5">{peerName} ({peerId})</p>
                    </div>

                    {/* Operator Permission parameters */}
                    {role === 'host' && (
                      <div className="flex items-center justify-between bg-neutral-900 border border-neutral-850 p-2.5 rounded-lg">
                        <div>
                          <p className="text-[10px] font-bold text-neutral-300">Kontrol Yetkisi</p>
                          <p className="text-[9px] text-neutral-500">Bağlantı fare/klavye kısıtı</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={hasControlPermission}
                          onChange={(e) => {
                              setHasControlPermission(e.target.checked);
                              // Inform controller of permission modification
                              sendStateUpdate({ isDrawingActive: e.target.checked }); // trick: use a slot to sync
                          }}
                          className="accent-red-500 w-4 h-4 rounded cursor-pointer"
                        />
                      </div>
                    )}

                    <button
                      onClick={handleTerminateSession}
                      className="w-full py-2.5 bg-red-950 hover:bg-red-900 text-red-150 border border-red-900/40 hover:border-red-800 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Masaüstü Bağlantısını Kes
                    </button>
                  </div>
                )}
              </div>

              {/* Dynamic File Drag Panel inside Connection */}
              <div className="flex-1 min-h-[300px]">
                <FileTransfer
                  sharedFiles={sharedFiles}
                  myId={myId}
                  myName={myName}
                  peerId={peerId}
                  onUploadSuccess={handleUploadSuccess}
                />
              </div>

            </div>

            {/* RIGHT SIDEBAR SCREEN VIEWER WORKSPACE AND LIVE CHAT */}
            <div className="lg:col-span-8 flex flex-col gap-5 lg:gap-6 min-h-[500px]">
              
              {/* Real-time remote desktop monitor frame */}
              <div className="flex flex-col min-h-[200px] lg:min-h-[260px]">
                <VirtualDesktop
                  role={role === 'none' ? 'host' : role}
                  desktopState={desktopState}
                  setDesktopState={setDesktopState}
                  onSendStateUpdate={sendStateUpdate}
                  onSendCanvasDraw={sendCanvasDraw}
                  onSendEditorChange={sendEditorChange}
                  sharedFiles={sharedFiles}
                  hasControlPermission={role === 'controller' ? hasControlPermission : true}
                />
              </div>

              {/* Chat log element beneath Remote Screen */}
              <div className="h-[300px]">
                <ChatPanel
                  messages={chatMessages}
                  myId={myId}
                  peerId={peerId}
                  peerName={peerName}
                  onSendMessage={handleSendChatMessage}
                />
              </div>

            </div>

          </div>
        )}
      </main>

      {/* POPUP PROPOSAL CONNECT MODAL RECEIVED AS A HOST */}
      {incomingProposal && (
        <div id="incoming-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 backdrop-blur-sm p-4 font-sans">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-650" />
            
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-red-950/40 border border-red-900/30 rounded-xl text-red-500 flex-shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white/95 font-heading">Uzak Masaüstü Giriş Talebi</h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">Bilgisayarınıza uzaktan erişim talebi geldi. Lütfen onaylamadan önce kimliği doğrulayın.</p>
              </div>
            </div>

            <div className="my-5 bg-neutral-950/60 border border-neutral-850 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500 font-mono">Bağlantıyı İsteyen Cihaz:</span>
                <span className="font-semibold text-neutral-200">{incomingProposal.controllerName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500 font-mono">Giriş Adresi / ID:</span>
                <span className="font-mono font-bold text-red-500 bg-red-950/20 px-2 py-0.5 rounded border border-red-900/40">{incomingProposal.controllerId}</span>
              </div>
            </div>

            {/* Checkbox settings permission layout for host protection */}
            <div className="flex items-center gap-3 mb-6 bg-neutral-950/40 border border-neutral-850 p-3 rounded-xl hover:border-neutral-800 transition-colors">
              <input
                type="checkbox"
                id="modal-control-perm"
                checked={hasControlPermission}
                onChange={(e) => setHasControlPermission(e.target.checked)}
                className="accent-red-500 w-4.5 h-4.5 rounded cursor-pointer animate-pulse"
              />
              <label htmlFor="modal-control-perm" className="text-xs text-neutral-300 font-medium cursor-pointer leading-relaxed">
                Bağlanan cihaz fare ve klavye girdileriyle masaüstümü <strong className="text-red-500 font-medium">aktif kontrol edebilsin.</strong>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleRejectProposal}
                className="py-3 bg-neutral-805 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                BAĞLANTIYI REDDET
              </button>
              <button
                onClick={handleAcceptProposal}
                className="py-3 bg-red-650 hover:bg-red-600 text-white font-semibold text-xs rounded-xl shadow-[0_4px_16px_rgba(239,68,68,0.2)] border border-red-500/40 transition-all transform active:scale-95 cursor-pointer"
              >
                İZİN VER (BAĞLAN)
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

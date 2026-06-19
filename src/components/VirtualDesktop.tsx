import { useState, useRef, useEffect, MouseEvent } from 'react';
import { 
  Monitor, Play, Trash2, Maximize2, Minimize2, X, Terminal as TerminalIcon, 
  FileText, Palette, FolderOpen, Send, User, Check, RefreshCw, Download
} from 'lucide-react';
import { DesktopState, VirtualWindow, Vector2D, CanvasLine, SharedFile } from '../types';
import { playClick } from './AudioEffects';

interface VirtualDesktopProps {
  role: 'host' | 'controller';
  desktopState: DesktopState;
  setDesktopState: (state: DesktopState) => void;
  onSendStateUpdate: (state: Partial<DesktopState>) => void;
  onSendCanvasDraw: (line: CanvasLine) => void;
  onSendEditorChange: (content: string) => void;
  onSendTerminalCommand?: (cmd: string) => void;
  sharedFiles: SharedFile[];
  hasControlPermission: boolean;
}

export default function VirtualDesktop({
  role,
  desktopState,
  setDesktopState,
  onSendStateUpdate,
  onSendCanvasDraw,
  onSendEditorChange,
  sharedFiles,
  hasControlPermission
}: VirtualDesktopProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [paintColor, setPaintColor] = useState('#ef4444');
  const [paintWidth, setPaintWidth] = useState(4);
  const [currentLinePoints, setCurrentLinePoints] = useState<Vector2D[]>([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [draggingWindowId, setDraggingWindowId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Vector2D>({ x: 0, y: 0 });
  const [maxZIndex, setMaxZIndex] = useState(10);
  const [localHoverPos, setLocalHoverPos] = useState<Vector2D>({ x: 0, y: 0 });
  const [showRealScreenMock, setShowRealScreenMock] = useState(false);
  const [realScreenStream, setRealScreenStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [screenShareError, setScreenShareError] = useState<string | null>(null);

  // Mouse trail click visualizer
  const [clicks, setClicks] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

  // Sound effect helper
  const triggerClickSound = () => {
    playClick();
  };

  // WebRTC real screen sharing helper
  const toggleRealScreenSharing = async () => {
    if (showRealScreenMock) {
      if (realScreenStream) {
        realScreenStream.getTracks().forEach(track => track.stop());
        setRealScreenStream(null);
      }
      setShowRealScreenMock(false);
      setScreenShareError(null);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { displaySurface: "monitor" },
          audio: false
        });
        setRealScreenStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setShowRealScreenMock(true);
        setScreenShareError(null);
      } catch (err: any) {
        console.warn("Screen share WebRTC API restricted:", err);
        setScreenShareError("Tarayıcı/Iframe güvenlik politikaları nedeniyle gerçek ekran paylaşımı engellendi. Sanal Masaüstü kontrolü aktif kalacaktır!");
        setShowRealScreenMock(true); // fallbacks to mirror visual mock
      }
    }
  };

  // Format date helper for desktop bar
  const [desktopTime, setDesktopTime] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setDesktopTime(now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle cursor syncing: Controller informs Host, and vice-versa
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));

    const pos = { x, y };
    setLocalHoverPos(pos);

    // If controller has permission, sync cursor to Host immediately
    if (role === 'controller' && hasControlPermission) {
      onSendStateUpdate({ cursorPosition: pos });
    } else if (role === 'host') {
      onSendStateUpdate({ cursorPosition: pos });
    }

    // Handle active dragging inside desktop viewport
    if (draggingWindowId) {
      const parentRect = containerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - parentRect.left - dragOffset.x;
      const relativeY = e.clientY - parentRect.top - dragOffset.y;
      
      // Keep inside bounds roughly
      const boundedX = Math.max(-50, Math.min(parentRect.width - 150, relativeX));
      const boundedY = Math.max(0, Math.min(parentRect.height - 80, relativeY));

      const updatedWindows = desktopState.windows.map(w => {
        if (w.id === draggingWindowId) {
          return { ...w, position: { x: boundedX, y: boundedY }, zIndex: maxZIndex + 1 };
        }
        return w;
      });

      setDesktopState({
        ...desktopState,
        windows: updatedWindows,
        activeWindowId: draggingWindowId
      });
      
      onSendStateUpdate({ windows: updatedWindows, activeWindowId: draggingWindowId });
    }
  };

  const handleMouseUp = () => {
    if (draggingWindowId) {
      setDraggingWindowId(null);
    }
    if (currentLinePoints.length > 0) {
      const newLine: CanvasLine = {
        id: 'line_' + Math.random().toString(36).substring(2, 9),
        points: currentLinePoints,
        color: paintColor,
        width: paintWidth
      };

      const updatedState = {
        ...desktopState,
        canvasLines: [...desktopState.canvasLines, newLine]
      };
      
      setDesktopState(updatedState);
      onSendCanvasDraw(newLine);
      setCurrentLinePoints([]);
    }
  };

  // Open or select an app window
  const openWindow = (windowId: string) => {
    if (role === 'controller' && !hasControlPermission) return;
    triggerClickSound();
    const nextZ = maxZIndex + 1;
    setMaxZIndex(nextZ);

    const updated = desktopState.windows.map(w => {
      if (w.id === windowId) {
        return { ...w, isOpen: true, isMinimized: false, zIndex: nextZ };
      }
      return w;
    });

    setDesktopState({
      ...desktopState,
      windows: updated,
      activeWindowId: windowId
    });

    onSendStateUpdate({ windows: updated, activeWindowId: windowId });
  };

  // Close win
  const closeWindow = (windowId: string) => {
    if (role === 'controller' && !hasControlPermission) return;
    triggerClickSound();
    const updated = desktopState.windows.map(w => {
      if (w.id === windowId) {
        return { ...w, isOpen: false };
      }
      return w;
    });

    setDesktopState({
      ...desktopState,
      windows: updated,
      activeWindowId: desktopState.activeWindowId === windowId ? null : desktopState.activeWindowId
    });

    onSendStateUpdate({ 
      windows: updated, 
      activeWindowId: desktopState.activeWindowId === windowId ? null : desktopState.activeWindowId 
    });
  };

  // Minimize win
  const minimizeWindow = (windowId: string) => {
    if (role === 'controller' && !hasControlPermission) return;
    triggerClickSound();
    const updated = desktopState.windows.map(w => {
      if (w.id === windowId) {
        return { ...w, isMinimized: true };
      }
      return w;
    });

    setDesktopState({
      ...desktopState,
      windows: updated,
      activeWindowId: desktopState.activeWindowId === windowId ? null : desktopState.activeWindowId
    });

    onSendStateUpdate({
      windows: updated,
      activeWindowId: desktopState.activeWindowId === windowId ? null : desktopState.activeWindowId
    });
  };

  // Maximize win toggle
  const toggleMaximizeWindow = (windowId: string) => {
    if (role === 'controller' && !hasControlPermission) return;
    triggerClickSound();
    const updated = desktopState.windows.map(w => {
      if (w.id === windowId) {
        return { ...w, isMaximized: !w.isMaximized };
      }
      return w;
    });

    setDesktopState({
      ...desktopState,
      windows: updated
    });
    onSendStateUpdate({ windows: updated });
  };

  // Start dragging
  const startDrag = (e: MouseEvent<HTMLDivElement>, windowId: string) => {
    if (role === 'controller' && !hasControlPermission) return;
    const win = desktopState.windows.find(w => w.id === windowId);
    if (!win || win.isMaximized) return;

    const nextZ = maxZIndex + 1;
    setMaxZIndex(nextZ);
    setDraggingWindowId(windowId);

    const winRect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (winRect) {
      setDragOffset({
        x: e.clientX - winRect.left,
        y: e.clientY - winRect.top
      });
    }

    // Move to front
    const updated = desktopState.windows.map(w => {
      if (w.id === windowId) {
        return { ...w, zIndex: nextZ };
      }
      return w;
    });

    setDesktopState({
      ...desktopState,
      windows: updated,
      activeWindowId: windowId
    });
    onSendStateUpdate({ windows: updated, activeWindowId: windowId });
  };

  // Collaborative canvas painting actions
  const drawPaint = (e: MouseEvent<HTMLDivElement>) => {
    if (role === 'controller' && !hasControlPermission) return;
    if (e.buttons !== 1) return; // Only draw when left click held

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentLinePoints(prev => [...prev, { x, y }]);
  };

  // Collaborative notes content typings
  const handleEditorType = (content: string) => {
    if (role === 'controller' && !hasControlPermission) return;
    
    setDesktopState({
      ...desktopState,
      notesContent: content
    });
    onSendEditorChange(content);
  };

  // Interactive mock terminal executable shell commands
  const handleExecuteTerminal = () => {
    if (role === 'controller' && !hasControlPermission) return;
    if (!terminalInput.trim()) return;

    const command = terminalInput.trim().toLowerCase();
    let response: string[] = [];

    response.push(`C:\\remote_user> ${terminalInput}`);

    if (command === 'help') {
      response.push(
        "Masaüstü Shell CLI Yardım Menüsü:",
        "  help      - Bu rehber sayfasını görüntüler.",
        "  ls        - Mevcut klasördeki dosyaları listeler.",
        "  cat       - Belirtilen dosyanın içeriğini okur.",
        "  ping      - Sunucu ve uzak birim gecikmesini ölçer.",
        "  neofetch  - Cihaz ve sistem özelliklerini listeler.",
        "  clear     - Terminal penceresini temizler."
      );
    } else if (command === 'ls') {
      response.push(
        "Kullanıcı\\Dosyalar Dizini:",
        "  2026-06-19 14:05   <DIR>    Belgelerim",
        "  2026-06-19 15:21      1,241 neofetch_info.json",
        "  2026-06-19 16:04        412 siber_güvenlik_notları.txt"
      );
      if (sharedFiles.length > 0) {
        response.push(`  === Uzaktan Gönderilen Dosyalar (${sharedFiles.length}) ===`);
        sharedFiles.forEach(f => {
          response.push(`  2026-06-19 16:04      ${f.size.toLocaleString()} ${f.name}`);
        });
      }
    } else if (command === 'neofetch') {
      response.push(
        "   /\\_/\\      Uzak Cihaz: TargetAnyDesk_PC",
        "  ( o.o )     İşletim Sistemi: SkyOS Browser-Core v4.9",
        "   > ^ <      Mimari: WebAssembly Electron-Simulate x86_64",
        "              Çekirdek: v6.12.0-cloud-run-container",
        "              Çalışma Süresi: 12 dakika",
        "              Çözünürlük: 1920x1080 (HD Sandbox Mirror)",
        "              Paketler: npm, tailwind v4, vite, ws-signaler",
        "              CPU: AMD EPYC Core-Managed (V-Core 4)",
        "              GPU: Chrome WebGL Canvas virtualizer",
        "              Hafıza: 16 GB WebBuffer / 32 MB Base64-Allocateded"
      );
    } else if (command.startsWith('cat')) {
      const target = command.substring(3).trim();
      if (!target) {
        response.push("Hata: Dosya ismi belirtilmediniz. cat <dosya_adi> şeklinde kullanın.");
      } else if (target.includes('siber') || target.includes('not')) {
        response.push(
          "--- siber_güvenlik_notları.txt ---",
          "1. Canlı AnyDesk senkronizasyonu için WebSocket tünellemesi kullanılıyor.",
          "2. P2P dosya transferleri, in-memory Buffer streamleri ile eşleşiyor.",
          "3. Kontrolcü yetkisi verildikten sonra mouse hamleleri 60fps'de serialize edilir."
        );
      } else {
        response.push(`Hata: '${target}' adlı dosya bulunamadı.`);
      }
    } else if (command === 'ping') {
      response.push(
        "PING 127.0.0.1 (Websocket local-loopback):",
        "  64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=12 ms",
        "  64 bytes from 127.0.0.1: icmp_seq=2 ttl=64 time=14 ms",
        "  64 bytes from 127.0.0.1: icmp_seq=3 ttl=64 time=11 ms",
        "--- local-loopback ping istatistikleri ---",
        "  3 Paket gönderildi, 3 Paket alındı, 0% paket kaybı.",
        "  Gecikme süresi: min/avg/max = 11.2 / 12.4 / 14.1 ms"
      );
    } else if (command === 'clear') {
      setDesktopState({
        ...desktopState,
        terminalHistory: []
      });
      setTerminalInput('');
      return;
    } else {
      response.push(`Hata: '${command}' tanınmayan dahili veya harici bir komut.`);
    }

    const updatedState = {
      ...desktopState,
      terminalHistory: [...desktopState.terminalHistory, ...response]
    };

    setDesktopState(updatedState);
    onSendStateUpdate({ terminalHistory: updatedState.terminalHistory });
    setTerminalInput('');
  };

  // Render cursor ripple coordinates for both Host and Client
  const handleDeskClick = (e: MouseEvent<HTMLDivElement>) => {
    if (role === 'controller' && !hasControlPermission) return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const percentX = ((e.clientX - rect.left) / rect.width) * 100;
    const percentY = ((e.clientY - rect.top) / rect.height) * 100;

    const newClick = {
      id: Date.now(),
      x: percentX,
      y: percentY,
      color: role === 'controller' ? '#ef4444' : '#3b82f6'
    };

    setClicks(prev => [...prev, newClick]);
    triggerClickSound();

    // Fade clicking ripple
    setTimeout(() => {
      setClicks(prev => prev.filter(c => c.id !== newClick.id));
    }, 1000);
  };

  // Helper app item renderer on desktop
  const appIcons = [
    { id: 'notepad', title: 'Not Defteri', icon: <FileText className="w-10 h-10 text-yellow-400" /> },
    { id: 'paint', title: 'Çizim Alanı', icon: <Palette className="w-10 h-10 text-emerald-400" /> },
    { id: 'terminal', title: 'Sistem Uçbirimi', icon: <TerminalIcon className="w-10 h-10 text-purple-400" /> },
    { id: 'files', title: 'Paylaşılan Dosyalar', icon: <FolderOpen className="w-10 h-10 text-sky-400" /> }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-2xl border border-slate-800 p-2 overflow-hidden relative">
      
      {/* Remote screen status bar banner */}
      <div className="flex items-center justify-between pb-2 px-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          {role === 'controller' ? (
            <span className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold bg-amber-950/20 px-2.5 py-1 rounded-full border border-amber-900/50">
              <Monitor className="w-3.5 h-3.5 animate-pulse" />
              Uzaktan İzleniyor: {desktopState.activeWindowId ? 'Aktif Pencere: ' + desktopState.windows.find(w => w.id === desktopState.activeWindowId)?.title : 'Masaüstü'}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/20 px-2.5 py-1 rounded-full border border-emerald-900/50">
              <Monitor className="w-3.5 h-3.5" />
              Masaüstünü Paylaşıyorsunuz
            </span>
          )}
        </div>

        {/* Action controllers */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleRealScreenSharing}
            className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-md border font-medium transition-all ${
              showRealScreenMock
                ? 'bg-red-600 border-red-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white'
            }`}
          >
            <Play className={`w-3 h-3 ${showRealScreenMock ? 'animate-pulse' : ''}`} />
            {showRealScreenMock ? 'Gerçek Masaüstünü Kapat' : 'Gerçek Ekran Yansıtıcıyı Başlat (WebRTC)'}
          </button>
        </div>
      </div>

      {/* Screen area */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleDeskClick}
        className={`flex-1 relative aspect-video w-full rounded-xl overflow-hidden mt-2 select-none bg-cover bg-center transition-all ${
          showRealScreenMock ? 'bg-black' : "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-900 to-slate-950"
        } ${role === 'controller' && !hasControlPermission ? 'cursor-not-allowed' : 'cursor-default'}`}
        style={{
          // Modern tech dynamic grids
          backgroundImage: showRealScreenMock ? 'none' : 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      >
        {/* Real screen sharing layout overlay if WebRTC is utilized */}
        {showRealScreenMock && (
          <div className="absolute inset-0 z-[1] flex flex-col">
            <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden">
              {screenShareError ? (
                <div className="max-w-md p-5 bg-red-950/40 border border-red-900/60 text-slate-200 text-xs rounded-xl text-center shadow-lg">
                  <p className="font-bold text-red-400 text-sm mb-1">WebRTC İletişim Engeli</p>
                  <p className="leading-relaxed">{screenShareError}</p>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </div>
        )}

        {/* Dynamic click ripple trail */}
        {clicks.map(click => (
          <div
            key={click.id}
            className="absolute rounded-full pointer-events-none animate-ping z-50 border-2"
            style={{
              left: `${click.x}%`,
              top: `${click.y}%`,
              width: '32px',
              height: '32px',
              marginLeft: '-16px',
              marginTop: '-16px',
              borderColor: click.color,
              backgroundColor: `${click.color}22`
            }}
          />
        ))}

        {/* Desktop Application Icons GRID */}
        {!showRealScreenMock && (
          <div className="absolute top-5 left-5 grid grid-cols-1 gap-6 z-10">
            {appIcons.map(app => (
              <div 
                key={app.id}
                onDoubleClick={() => openWindow(app.id)}
                onClick={() => {
                  // Fallback for double click on responsive phones / tablet
                  if (window.innerWidth < 768) {
                    openWindow(app.id);
                  }
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border border-transparent hover:border-slate-800 hover:bg-slate-900/40 cursor-pointer text-center select-none w-20 transition-all ${
                  role === 'controller' && !hasControlPermission ? 'pointer-events-none opacity-50' : ''
                }`}
              >
                {app.icon}
                <span className="text-[10px] font-medium text-slate-300 mt-1.5 tracking-tight truncate w-full">
                  {app.title}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* RENDER ACTIVE WINDOWS */}
        {!showRealScreenMock && desktopState.windows.map((win) => {
          if (!win.isOpen) return null;
          if (win.isMinimized) return null;

          return (
            <div
              key={win.id}
              className={`absolute flex flex-col bg-slate-900/90 border border-slate-800/80 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md z-20 ${
                win.isMaximized ? 'inset-0 !h-[calc(100%-40px)] !w-full !left-0 !top-0' : ''
              }`}
              style={{
                left: win.isMaximized ? 0 : `${win.position.x}px`,
                top: win.isMaximized ? 0 : `${win.position.y}px`,
                width: win.isMaximized ? '100%' : `${win.size.width}px`,
                height: win.isMaximized ? 'calc(100% - 40px)' : `${win.size.height}px`,
                zIndex: win.zIndex
              }}
            >
              {/* Window Header handle */}
              <div
                onMouseDown={(e) => startDrag(e, win.id)}
                className="flex items-center justify-between px-3 py-2 bg-slate-950/80 select-none cursor-move border-b border-slate-900/60"
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-semibold text-xs">{win.title}</span>
                </div>
                
                {/* Control utility buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => minimizeWindow(win.id)}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  >
                    <Minimize2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => toggleMaximizeWindow(win.id)}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => closeWindow(win.id)}
                    className="p-1 text-red-400 hover:text-white hover:bg-red-650 rounded transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Window Content bodies */}
              <div className="flex-1 overflow-auto p-3 text-slate-200">
                
                {/* NOTEPAD (Notebook) App */}
                {win.id === 'notepad' && (
                  <textarea
                    value={desktopState.notesContent}
                    onChange={(e) => handleEditorType(e.target.value)}
                    disabled={role === 'controller' && !hasControlPermission}
                    placeholder="Bu alana anlık yazılan notlar, bağlı bilgisayarlar arasında anında karakter bazlı senkronize olur..."
                    className="w-full h-full min-h-[140px] bg-slate-950/20 border border-transparent font-sans text-xs focus:outline-none resize-none placeholder-slate-600 text-slate-200 leading-relaxed"
                  />
                )}

                {/* PAINT (Drawing Board) App */}
                {win.id === 'paint' && (
                  <div className="flex flex-col h-full">
                    {/* Paint controls */}
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Renk Paleti:</span>
                        {['#ef4444', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#ffffff'].map((c) => (
                          <button
                            key={c}
                            onClick={() => setPaintColor(c)}
                            className={`w-4 h-4 rounded-full border-2 transition-transform ${
                              paintColor === c ? 'scale-120 border-white' : 'border-transparent hover:scale-110'
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Boyut:</span>
                        <input
                          type="range"
                          min="2"
                          max="15"
                          value={paintWidth}
                          onChange={(e) => setPaintWidth(parseInt(e.target.value))}
                          className="w-20 accent-red-500 h-1 rounded"
                        />
                      </div>

                      <button
                        onClick={() => {
                          if (role === 'controller' && !hasControlPermission) return;
                          setDesktopState({ ...desktopState, canvasLines: [] });
                          onSendStateUpdate({ canvasLines: [] });
                        }}
                        className="flex items-center gap-1.5 text-[10px] text-red-400 hover:text-red-300 font-semibold bg-red-950/10 hover:bg-red-955/20 px-2 py-1 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Temizle
                      </button>
                    </div>

                    {/* Canvas paint sheet */}
                    <div
                      onMouseMove={drawPaint}
                      className="flex-1 bg-slate-950 rounded-lg relative overflow-hidden border border-slate-800 cursor-crosshair h-[160px]"
                    >
                      <svg className="w-full h-full absolute inset-0">
                        {desktopState.canvasLines.map((line) => (
                          <path
                            key={line.id}
                            d={`M ${line.points.map(p => `${p.x},${p.y}`).join(' L ')}`}
                            stroke={line.color}
                            strokeWidth={line.width}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        ))}
                        {currentLinePoints.length > 0 && (
                          <path
                            d={`M ${currentLinePoints.map(p => `${p.x},${p.y}`).join(' L ')}`}
                            stroke={paintColor}
                            strokeWidth={paintWidth}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}
                      </svg>
                    </div>
                  </div>
                )}

                {/* TERMINAL CLI App */}
                {win.id === 'terminal' && (
                  <div className="flex flex-col h-full font-mono text-xs select-text">
                    <div className="flex-1 bg-black/40 border border-slate-850 p-3 rounded-lg overflow-y-auto max-h-[160px] space-y-1 scrollbar-thin">
                      <p className="text-slate-500">// Yardıma ulaşmak için 'help' yazıp enter tuşuna basın.</p>
                      {desktopState.terminalHistory.map((line, idx) => (
                        <div key={idx} className="whitespace-pre-wrap leading-relaxed">
                          {line.startsWith('C:\\') ? (
                            <span className="text-amber-400">{line}</span>
                          ) : line.includes('Mimari') || line.includes('CPU') ? (
                            <span className="text-emerald-400">{line}</span>
                          ) : (
                            <span className="text-slate-300">{line}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-2">
                      <span className="text-amber-400 mt-1.5 select-none leading-none">C:\&gt;</span>
                      <input
                        type="text"
                        value={terminalInput}
                        onChange={(e) => setTerminalInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleExecuteTerminal()}
                        disabled={role === 'controller' && !hasControlPermission}
                        className="flex-1 bg-transparent border-none text-slate-100 font-mono text-xs outline-none focus:ring-0 leading-none py-1.5"
                        placeholder="Komut buraya yazılır..."
                      />
                      <button
                        onClick={handleExecuteTerminal}
                        className="bg-slate-800 hover:bg-slate-700 px-3 rounded text-[10px] font-semibold text-slate-300 uppercase tracking-widest"
                      >
                        Gönder
                      </button>
                    </div>
                  </div>
                )}

                {/* SHARED FILES Explorer Box App */}
                {win.id === 'files' && (
                  <div className="space-y-3 font-sans text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="font-bold text-slate-400">YAYINLANAN DOSYALAR</span>
                      <span className="text-[10px] bg-sky-950 text-sky-400 px-2 py-0.5 rounded border border-sky-900/50">Cihaz Depolama</span>
                    </div>

                    {sharedFiles.length === 0 ? (
                      <div className="text-center py-6 text-slate-550 italic">
                        Uzak oturumun bu klasöründe henüz yüklenmiş bir dosya bulunmuyor. Sol uploader panelinden dosya atabilirsiniz.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 h-[160px] overflow-auto">
                        {sharedFiles.map((f) => (
                          <div 
                            key={f.id}
                            className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-850 hover:border-slate-750 flex items-center justify-between group transition-all"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <FileText className="w-5 h-5 text-sky-400 flex-shrink-0" />
                              <div className="overflow-hidden">
                                <p className="font-medium text-slate-200 truncate pr-2" title={f.name}>{f.name}</p>
                                <p className="text-[9px] text-slate-500 font-mono">{(f.size / 1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                            <a
                              href={f.downloadUrl}
                              download={f.name}
                              className="w-6 h-6 hover:bg-red-650 rounded-md border border-slate-800 hover:border-red-500 flex items-center justify-center text-slate-400 hover:text-white transition-all scale-95 group-hover:scale-100"
                            >
                              <Download className="w-3 h-3" />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          );
        })}

        {/* Live Remote Peer interactive cursor */}
        {role === 'controller' && (
          <div
            className="absolute pointer-events-none transition-all duration-75 z-40 ease-out"
            style={{
              left: `${desktopState.cursorPosition.x}%`,
              top: `${desktopState.cursorPosition.y}%`,
            }}
          >
            <div className="relative">
              {/* Classic AnyDesk styled red arrow pointer */}
              <svg className="w-5 h-5 text-red-500 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0 0l24 9-11 3-3 11-10-23z" stroke="white" strokeWidth="1.5" />
              </svg>
              {/* Hover indicator node name tag */}
              <span className="absolute left-4 top-4 bg-red-600 text-[9px] text-white font-bold px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap border border-white/50">
                Uzak Cihaz
              </span>
            </div>
          </div>
        )}

        {role === 'host' && (
          <div
            className="absolute pointer-events-none transition-all duration-75 z-40 ease-out"
            style={{
              left: `${desktopState.cursorPosition.x}%`,
              top: `${desktopState.cursorPosition.y}%`,
            }}
          >
            <div className="relative">
              {/* Blue pointer represent the operator */}
              <svg className="w-5 h-5 text-sky-500 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0 0l24 9-11 3-3 11-10-23z" stroke="white" strokeWidth="1.5" />
              </svg>
              <span className="absolute left-4 top-4 bg-sky-600 text-[9px] text-white font-bold px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap border border-white/50">
                Kontrolcü
              </span>
            </div>
          </div>
        )}

      </div>

      {/* Taskbar at the bottom */}
      {!showRealScreenMock && (
        <div className="h-10 bg-slate-950/90 rounded-xl mt-2 px-3 flex items-center justify-between border border-slate-900/60 z-30 select-none">
          <div className="flex items-center gap-1.5">
            {/* Standard circular Red/AnyOS logo menu item */}
            <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform" />
            
            <div className="h-5 w-[1px] bg-slate-800 mx-1" />

            {/* Minimize bar window states list */}
            {desktopState.windows.map(w => {
              if (!w.isOpen) return null;
              return (
                <button
                  key={w.id}
                  onClick={() => openWindow(w.id)}
                  className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border text-[10px] font-semibold transition-all ${
                    desktopState.activeWindowId === w.id && !w.isMinimized
                      ? 'bg-slate-800 border-slate-750 text-white'
                      : 'bg-slate-900/40 border-transparent hover:border-slate-850 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${desktopState.activeWindowId === w.id ? 'bg-red-500' : 'bg-slate-500'}`} />
                  {w.title}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-450 tracking-wider">UTC SYSTEM CLOCK:</span>
            <span className="text-[10px] font-mono text-slate-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800/80">
              {desktopTime}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

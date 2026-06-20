import { useState, useRef, useEffect, MouseEvent } from 'react';
import { Monitor, Play, Maximize2, Minimize2, X, FolderOpen, FileText, Download, RefreshCw } from 'lucide-react';
import { DesktopState, VirtualWindow, Vector2D, CanvasLine, SharedFile } from '../types';
import { playClick } from './AudioEffects';

interface VirtualDesktopProps {
  role: 'host' | 'controller';
  desktopState: DesktopState;
  setDesktopState: (state: DesktopState) => void;
  onSendStateUpdate: (state: Partial<DesktopState>) => void;
  onSendCanvasDraw: (line: CanvasLine) => void;
  onSendEditorChange: (content: string) => void;
  sharedFiles: SharedFile[];
  hasControlPermission: boolean;
}

export default function VirtualDesktop({
  role,
  desktopState,
  setDesktopState,
  onSendStateUpdate,
  sharedFiles,
  hasControlPermission
}: VirtualDesktopProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingWindowId, setDraggingWindowId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Vector2D>({ x: 0, y: 0 });
  const [maxZIndex, setMaxZIndex] = useState(10);
  const [showRealScreenMock, setShowRealScreenMock] = useState(false);
  const [realScreenStream, setRealScreenStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [screenShareError, setScreenShareError] = useState<string | null>(null);
  const [clicks, setClicks] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const [desktopTime, setDesktopTime] = useState('');

  useEffect(() => {
    const updateTime = () => setDesktopTime(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleRealScreenSharing = async () => {
    if (showRealScreenMock) {
      realScreenStream?.getTracks().forEach(t => t.stop());
      setRealScreenStream(null);
      setShowRealScreenMock(false);
      setScreenShareError(null);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: { displaySurface: 'monitor' }, audio: false });
        setRealScreenStream(stream);
        if (videoRef.current) videoRef.current.srcObject = stream;
        setShowRealScreenMock(true);
        setScreenShareError(null);
      } catch (err: any) {
        setScreenShareError('Tarayıcı güvenlik politikaları nedeniyle gerçek ekran paylaşımı engellendi.');
        setShowRealScreenMock(true);
      }
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    const pos = { x, y };
    if (role === 'controller' && hasControlPermission) onSendStateUpdate({ cursorPosition: pos });
    else if (role === 'host') onSendStateUpdate({ cursorPosition: pos });

    if (draggingWindowId) {
      const parentRect = containerRef.current.getBoundingClientRect();
      const relativeX = Math.max(-50, Math.min(parentRect.width - 150, e.clientX - parentRect.left - dragOffset.x));
      const relativeY = Math.max(0, Math.min(parentRect.height - 80, e.clientY - parentRect.top - dragOffset.y));
      const updatedWindows = desktopState.windows.map(w =>
        w.id === draggingWindowId ? { ...w, position: { x: relativeX, y: relativeY }, zIndex: maxZIndex + 1 } : w
      );
      setDesktopState({ ...desktopState, windows: updatedWindows, activeWindowId: draggingWindowId });
      onSendStateUpdate({ windows: updatedWindows, activeWindowId: draggingWindowId });
    }
  };

  const handleMouseUp = () => setDraggingWindowId(null);

  const openWindow = (windowId: string) => {
    if (role === 'controller' && !hasControlPermission) return;
    playClick();
    const nextZ = maxZIndex + 1;
    setMaxZIndex(nextZ);
    const updated = desktopState.windows.map(w => w.id === windowId ? { ...w, isOpen: true, isMinimized: false, zIndex: nextZ } : w);
    setDesktopState({ ...desktopState, windows: updated, activeWindowId: windowId });
    onSendStateUpdate({ windows: updated, activeWindowId: windowId });
  };

  const closeWindow = (windowId: string) => {
    if (role === 'controller' && !hasControlPermission) return;
    playClick();
    const updated = desktopState.windows.map(w => w.id === windowId ? { ...w, isOpen: false } : w);
    const activeId = desktopState.activeWindowId === windowId ? null : desktopState.activeWindowId;
    setDesktopState({ ...desktopState, windows: updated, activeWindowId: activeId });
    onSendStateUpdate({ windows: updated, activeWindowId: activeId });
  };

  const minimizeWindow = (windowId: string) => {
    if (role === 'controller' && !hasControlPermission) return;
    playClick();
    const updated = desktopState.windows.map(w => w.id === windowId ? { ...w, isMinimized: true } : w);
    const activeId = desktopState.activeWindowId === windowId ? null : desktopState.activeWindowId;
    setDesktopState({ ...desktopState, windows: updated, activeWindowId: activeId });
    onSendStateUpdate({ windows: updated, activeWindowId: activeId });
  };

  const toggleMaximizeWindow = (windowId: string) => {
    if (role === 'controller' && !hasControlPermission) return;
    playClick();
    const updated = desktopState.windows.map(w => w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w);
    setDesktopState({ ...desktopState, windows: updated });
    onSendStateUpdate({ windows: updated });
  };

  const startDrag = (e: MouseEvent<HTMLDivElement>, windowId: string) => {
    if (role === 'controller' && !hasControlPermission) return;
    const win = desktopState.windows.find(w => w.id === windowId);
    if (!win || win.isMaximized) return;
    const nextZ = maxZIndex + 1;
    setMaxZIndex(nextZ);
    setDraggingWindowId(windowId);
    const winRect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (winRect) setDragOffset({ x: e.clientX - winRect.left, y: e.clientY - winRect.top });
    const updated = desktopState.windows.map(w => w.id === windowId ? { ...w, zIndex: nextZ } : w);
    setDesktopState({ ...desktopState, windows: updated, activeWindowId: windowId });
    onSendStateUpdate({ windows: updated, activeWindowId: windowId });
  };

  const handleDeskClick = (e: MouseEvent<HTMLDivElement>) => {
    if (role === 'controller' && !hasControlPermission) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newClick = {
      id: Date.now(),
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      color: role === 'controller' ? '#ef4444' : '#3b82f6'
    };
    setClicks(prev => [...prev, newClick]);
    playClick();
    setTimeout(() => setClicks(prev => prev.filter(c => c.id !== newClick.id)), 1000);
  };

  // Sadece Paylaşılan Dosyalar penceresi
  const appIcons = [
    { id: 'files', title: 'Paylaşılan Dosyalar', icon: <FolderOpen className="w-10 h-10 text-sky-400" /> }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-2xl border border-slate-800 p-2 overflow-hidden relative">
      
      {/* Üst durum çubuğu */}
      <div className="flex items-center justify-between pb-2 px-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          {role === 'controller' ? (
            <span className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold bg-amber-950/20 px-2.5 py-1 rounded-full border border-amber-900/50">
              <Monitor className="w-3.5 h-3.5 animate-pulse" />
              Uzaktan İzleniyor
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/20 px-2.5 py-1 rounded-full border border-emerald-900/50">
              <Monitor className="w-3.5 h-3.5" />
              Masaüstünü Paylaşıyorsunuz
            </span>
          )}
        </div>
        <button
          onClick={toggleRealScreenSharing}
          className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-md border font-medium transition-all ${
            showRealScreenMock
              ? 'bg-red-600 border-red-500 text-white'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white'
          }`}
        >
          <Play className={`w-3 h-3 ${showRealScreenMock ? 'animate-pulse' : ''}`} />
          {showRealScreenMock ? 'Ekran Paylaşımını Kapat' : 'Gerçek Ekran Paylaş (WebRTC)'}
        </button>
      </div>

      {/* Ekran alanı */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleDeskClick}
        className={`flex-1 relative w-full rounded-xl overflow-hidden mt-2 select-none ${
          showRealScreenMock ? 'bg-black' : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-900 to-slate-950'
        } ${role === 'controller' && !hasControlPermission ? 'cursor-not-allowed' : 'cursor-default'}`}
        style={{ backgroundImage: showRealScreenMock ? 'none' : 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '24px 24px' }}
      >
        {/* Gerçek ekran paylaşımı */}
        {showRealScreenMock && (
          <div className="absolute inset-0 z-[1] flex flex-col">
            <div className="flex-1 bg-black flex items-center justify-center">
              {screenShareError ? (
                <div className="max-w-md p-5 bg-red-950/40 border border-red-900/60 text-slate-200 text-xs rounded-xl text-center">
                  <p className="font-bold text-red-400 text-sm mb-1">WebRTC Engeli</p>
                  <p>{screenShareError}</p>
                </div>
              ) : (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
              )}
            </div>
          </div>
        )}

        {/* Tıklama efekti */}
        {clicks.map(click => (
          <div
            key={click.id}
            className="absolute rounded-full pointer-events-none animate-ping z-50 border-2"
            style={{ left: `${click.x}%`, top: `${click.y}%`, width: '32px', height: '32px', marginLeft: '-16px', marginTop: '-16px', borderColor: click.color, backgroundColor: `${click.color}22` }}
          />
        ))}

        {/* Masaüstü ikonları */}
        {!showRealScreenMock && (
          <div className="absolute top-5 left-5 grid grid-cols-1 gap-6 z-10">
            {appIcons.map(app => (
              <div
                key={app.id}
                onDoubleClick={() => openWindow(app.id)}
                onClick={() => { if (window.innerWidth < 768) openWindow(app.id); }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border border-transparent hover:border-slate-800 hover:bg-slate-900/40 cursor-pointer text-center select-none w-20 transition-all ${
                  role === 'controller' && !hasControlPermission ? 'pointer-events-none opacity-50' : ''
                }`}
              >
                {app.icon}
                <span className="text-[10px] font-medium text-slate-300 mt-1.5 tracking-tight truncate w-full">{app.title}</span>
              </div>
            ))}
          </div>
        )}

        {/* Pencereler */}
        {!showRealScreenMock && desktopState.windows.map(win => {
          if (!win.isOpen || win.isMinimized || win.id !== 'files') return null;
          return (
            <div
              key={win.id}
              className={`absolute flex flex-col bg-slate-900/90 border border-slate-800/80 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md z-20 ${
                win.isMaximized ? 'inset-0' : ''
              }`}
              style={{
                left: win.isMaximized ? 0 : `${win.position.x}px`,
                top: win.isMaximized ? 0 : `${win.position.y}px`,
                width: win.isMaximized ? '100%' : `${win.size.width}px`,
                height: win.isMaximized ? 'calc(100% - 40px)' : `${win.size.height}px`,
                zIndex: win.zIndex
              }}
            >
              <div onMouseDown={(e) => startDrag(e, win.id)} className="flex items-center justify-between px-3 py-2 bg-slate-950/80 select-none cursor-move border-b border-slate-900/60">
                <span className="text-slate-400 font-semibold text-xs">{win.title}</span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => minimizeWindow(win.id)} className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors">
                    <Minimize2 className="w-3 h-3" />
                  </button>
                  <button onClick={() => toggleMaximizeWindow(win.id)} className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors">
                    <Maximize2 className="w-3 h-3" />
                  </button>
                  <button onClick={() => closeWindow(win.id)} className="p-1 text-red-400 hover:text-white hover:bg-red-600 rounded transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-3 text-slate-200">
                <div className="space-y-3 font-sans text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-bold text-slate-400">PAYLAŞILAN DOSYALAR</span>
                    <span className="text-[10px] bg-sky-950 text-sky-400 px-2 py-0.5 rounded border border-sky-900/50">{sharedFiles.length} Dosya</span>
                  </div>
                  {sharedFiles.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 italic">Henüz dosya paylaşılmadı.</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 overflow-auto">
                      {sharedFiles.map(f => (
                        <div key={f.id} className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800 hover:border-slate-700 flex items-center justify-between group transition-all">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className="w-5 h-5 text-sky-400 flex-shrink-0" />
                            <div className="overflow-hidden">
                              <p className="font-medium text-slate-200 truncate pr-2" title={f.name}>{f.name}</p>
                              <p className="text-[9px] text-slate-500 font-mono">{(f.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <a href={f.downloadUrl} download={f.name} className="w-6 h-6 hover:bg-red-600 rounded-md border border-slate-800 hover:border-red-500 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                            <Download className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}


      </div>

      {/* Görev çubuğu */}
      {!showRealScreenMock && (
        <div className="h-10 bg-slate-950/90 rounded-xl mt-2 px-3 flex items-center justify-between border border-slate-900/60 z-30 select-none">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-red-600 cursor-pointer hover:scale-105 transition-transform" />
            <div className="h-5 w-[1px] bg-slate-800 mx-1" />
            {desktopState.windows.filter(w => w.isOpen).map(w => (
              <button key={w.id} onClick={() => openWindow(w.id)} className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border text-[10px] font-semibold transition-all ${
                desktopState.activeWindowId === w.id && !w.isMinimized
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-slate-900/40 border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${desktopState.activeWindowId === w.id ? 'bg-red-500' : 'bg-slate-500'}`} />
                {w.title}
              </button>
            ))}
          </div>
          <span className="text-[10px] font-mono text-slate-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800/80">{desktopTime}</span>
        </div>
      )}
    </div>
  );
}

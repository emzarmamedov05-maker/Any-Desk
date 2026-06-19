export type ConnectionRole = 'host' | 'controller' | 'none';

export type SessionStatus = 'idle' | 'connecting' | 'connected' | 'rejected' | 'disconnected';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface SharedFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  downloadUrl: string;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface CanvasLine {
  id: string;
  points: Vector2D[];
  color: string;
  width: number;
}

export interface VirtualWindow {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  icon: string;
}

export interface DesktopState {
  windows: VirtualWindow[];
  activeWindowId: string | null;
  cursorPosition: Vector2D;
  isDrawingActive: boolean;
  notesContent: string;
  canvasLines: CanvasLine[];
  terminalHistory: string[];
}

export interface RemoteSession {
  roomId: string;
  hostId: string;
  hostName: string;
  controllerId: string | null;
  controllerName: string | null;
}

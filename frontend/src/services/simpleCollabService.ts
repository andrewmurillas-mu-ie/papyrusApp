import { io, Socket } from 'socket.io-client';

export interface CollabUser {
  id: string;
  name: string;
  cursor?: number;
}

export class SimpleCollabService {
  private socket: Socket | null = null;
  private documentId: string | null = null;
  private users: Map<string, CollabUser> = new Map();
  private callbacks: {
    onUserJoined?: (user: CollabUser) => void;
    onUserLeft?: (user: CollabUser) => void;
    onUsersList?: (users: CollabUser[]) => void;
    onContentUpdate?: (content: string) => void;
    onCursorUpdate?: (data: { userId: string; userName: string; cursor: number }) => void;
    onConnected?: () => void;
    onDisconnected?: () => void;
    onError?: (error: string) => void;
  } = {};

  constructor() {
    this.setupSocket();
  }

  private setupSocket() {
    this.socket = io('http://localhost:3000', {
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      console.log('🔗 Connected to collaboration server');
      this.callbacks.onConnected?.();
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from collaboration server');
      this.callbacks.onDisconnected?.();
    });

    this.socket.on('error', (error: string) => {
      console.error('❌ Collaboration error:', error);
      this.callbacks.onError?.(error);
    });

    this.socket.on('document-content', (content: string) => {
      console.log('📄 Received document content');
      this.callbacks.onContentUpdate?.(content);
    });

    this.socket.on('content-update', (content: string) => {
      console.log('📝 Received content update');
      this.callbacks.onContentUpdate?.(content);
    });

    this.socket.on('user-joined', (user: CollabUser) => {
      console.log('👤 User joined:', user.name);
      this.users.set(user.id, user);
      this.callbacks.onUserJoined?.(user);
      this.callbacks.onUsersList?.(Array.from(this.users.values()));
    });

    this.socket.on('user-left', (user: CollabUser) => {
      console.log('👋 User left:', user.name);
      this.users.delete(user.id);
      this.callbacks.onUserLeft?.(user);
      this.callbacks.onUsersList?.(Array.from(this.users.values()));
    });

    this.socket.on('users-list', (users: CollabUser[]) => {
      console.log('👥 Users list updated:', users.length);
      users.forEach(user => this.users.set(user.id, user));
      this.callbacks.onUsersList?.(users);
    });

    this.socket.on('cursor-update', (data: { userId: string; userName: string; cursor: number }) => {
      console.log('📍 Cursor update:', data.userName, data.cursor);
      this.callbacks.onCursorUpdate?.(data);
    });
  }

  connectToDocument(documentId: string, userName: string) {
    if (!this.socket) return;

    this.documentId = documentId;
    console.log('🔗 Connecting to document:', documentId);
    
    this.socket.emit('join-document', { documentId, userName });
  }

  disconnectFromDocument() {
    if (this.socket && this.documentId) {
      console.log('🔌 Disconnecting from document:', this.documentId);
      this.socket.emit('leave-document', this.documentId);
    }
    
    this.documentId = null;
    this.users.clear();
  }

  sendContentUpdate(content: string) {
    if (this.socket && this.documentId) {
      console.log('📤 Sending content update');
      this.socket.emit('content-update', { documentId: this.documentId, content });
    }
  }

  sendCursorUpdate(cursor: number) {
    if (this.socket && this.documentId) {
      console.log('📍 Sending cursor update:', cursor);
      this.socket.emit('cursor-update', { documentId: this.documentId, cursor });
    }
  }

  getCurrentUsers(): CollabUser[] {
    return Array.from(this.users.values());
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Event callback setters
  onUserJoined(callback: (user: CollabUser) => void) {
    this.callbacks.onUserJoined = callback;
  }

  onUserLeft(callback: (user: CollabUser) => void) {
    this.callbacks.onUserLeft = callback;
  }

  onUsersList(callback: (users: CollabUser[]) => void) {
    this.callbacks.onUsersList = callback;
  }

  onContentUpdate(callback: (content: string) => void) {
    this.callbacks.onContentUpdate = callback;
  }

  onCursorUpdate(callback: (data: { userId: string; userName: string; cursor: number }) => void) {
    this.callbacks.onCursorUpdate = callback;
  }

  onConnected(callback: () => void) {
    this.callbacks.onConnected = callback;
  }

  onDisconnected(callback: () => void) {
    this.callbacks.onDisconnected = callback;
  }

  onError(callback: (error: string) => void) {
    this.callbacks.onError = callback;
  }

  destroy() {
    this.disconnectFromDocument();
    this.socket?.disconnect();
    this.socket = null;
  }
}

// Singleton instance
export const simpleCollabService = new SimpleCollabService();

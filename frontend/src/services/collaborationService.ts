import { io, Socket } from 'socket.io-client'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

export interface CollaborationUser {
  userId: string
  userName: string
  position?: number
  selection?: { from: number; to: number }
}

export class CollaborationService {
  private socket: Socket | null = null
  private doc: Y.Doc | null = null
  private provider: WebsocketProvider | null = null
  private documentId: string | null = null
  private users: Map<string, CollaborationUser> = new Map()
  private callbacks: {
    onUserJoined?: (user: CollaborationUser) => void
    onUserLeft?: (user: CollaborationUser) => void
    onUsersList?: (users: CollaborationUser[]) => void
    onCursorUpdate?: (user: CollaborationUser) => void
    onConnected?: () => void
    onDisconnected?: () => void
    onError?: (error: string) => void
  } = {}

  constructor() {
    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    if (typeof window === 'undefined') return

    // Get auth token from localStorage
    const token = localStorage.getItem('token')
    const userName = localStorage.getItem('userName') || 'Anonymous'

    this.socket = io('http://localhost:3000', {
      auth: { token, userName },
      transports: ['websocket']
    })

    this.socket.on('connect', () => {
      console.log('Connected to collaboration server')
      this.callbacks.onConnected?.()
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from collaboration server')
      this.callbacks.onDisconnected?.()
    })

    this.socket.on('error', (error: string) => {
      console.error('Collaboration error:', error)
      this.callbacks.onError?.(error)
    })

    this.socket.on('document-state', (state: Uint8Array) => {
      if (this.doc) {
        Y.applyUpdate(this.doc, state)
      }
    })

    this.socket.on('document-update', (update: Uint8Array) => {
      if (this.doc) {
        Y.applyUpdate(this.doc, update)
      }
    })

    this.socket.on('user-joined', (user: CollaborationUser) => {
      this.users.set(user.userId, user)
      this.callbacks.onUserJoined?.(user)
      this.callbacks.onUsersList?.(Array.from(this.users.values()))
    })

    this.socket.on('user-left', (user: CollaborationUser) => {
      this.users.delete(user.userId)
      this.callbacks.onUserLeft?.(user)
      this.callbacks.onUsersList?.(Array.from(this.users.values()))
    })

    this.socket.on('users-list', (users: CollaborationUser[]) => {
      users.forEach(user => this.users.set(user.userId, user))
      this.callbacks.onUsersList?.(users)
    })

    this.socket.on('cursor-update', (data: CollaborationUser) => {
      this.users.set(data.userId, data)
      this.callbacks.onCursorUpdate?.(data)
    })
  }

  connectToDocument(documentId: string): void {
    if (!this.socket) return

    this.documentId = documentId
    this.doc = new Y.Doc()

    // Join the document room
    this.socket.emit('join-document', documentId)

    // Set up document update listener
    this.doc.on('update', (update: Uint8Array) => {
      if (this.socket && this.documentId) {
        this.socket.emit('document-update', {
          documentId: this.documentId,
          update
        })
      }
    })
  }

  disconnectFromDocument(): void {
    if (this.socket && this.documentId) {
      this.socket.emit('leave-document', this.documentId)
    }
    
    this.documentId = null
    this.doc = null
    this.users.clear()
  }

  getDocument(): Y.Doc | null {
    return this.doc
  }

  getYText(): Y.Text | null {
    if (!this.doc) return null
    return this.doc.getText('content')
  }

  updateCursor(position: number, selection?: { from: number; to: number }): void {
    if (this.socket && this.documentId) {
      this.socket.emit('cursor-update', {
        documentId: this.documentId,
        position,
        selection
      })
    }
  }

  getCurrentUsers(): CollaborationUser[] {
    return Array.from(this.users.values())
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }

  // Event callback setters
  onUserJoined(callback: (user: CollaborationUser) => void): void {
    this.callbacks.onUserJoined = callback
  }

  onUserLeft(callback: (user: CollaborationUser) => void): void {
    this.callbacks.onUserLeft = callback
  }

  onUsersList(callback: (users: CollaborationUser[]) => void): void {
    this.callbacks.onUsersList = callback
  }

  onCursorUpdate(callback: (user: CollaborationUser) => void): void {
    this.callbacks.onCursorUpdate = callback
  }

  onConnected(callback: () => void): void {
    this.callbacks.onConnected = callback
  }

  onDisconnected(callback: () => void): void {
    this.callbacks.onDisconnected = callback
  }

  onError(callback: (error: string) => void): void {
    this.callbacks.onError = callback
  }

  destroy(): void {
    this.disconnectFromDocument()
    this.socket?.disconnect()
    this.socket = null
  }
}

// Singleton instance
export const collaborationService = new CollaborationService()

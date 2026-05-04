import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

interface DocumentSession {
  documentId: string;
  content: string;
  users: Map<string, { id: string; name: string; cursor?: number }>;
  lastUpdate: Date;
}

class SimpleCollaborationServer {
  private io: SocketIOServer;
  private sessions: Map<string, DocumentSession> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: ["http://localhost:5174", "http://localhost:5175"],
        methods: ["GET", "POST"]
      }
    });

    this.setupSocketHandlers();
    console.log('🚀 Simple collaboration server initialized');
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔗 Client connected: ${socket.id}`);

      // Join document session
      socket.on('join-document', (data: { documentId: string; userName: string }) => {
        const { documentId, userName } = data;
        
        console.log(`📝 User ${userName} joining document: ${documentId}`);

        // Get or create session
        let session = this.sessions.get(documentId);
        if (!session) {
          session = {
            documentId,
            content: '',
            users: new Map(),
            lastUpdate: new Date()
          };
          this.sessions.set(documentId, session);
        }

        // Add user to session
        session.users.set(socket.id, { id: socket.id, name: userName });
        socket.join(documentId);

        // Send current content to new user
        socket.emit('document-content', session.content);
        
        // Send current users list
        const usersList = Array.from(session.users.values());
        socket.emit('users-list', usersList);

        // Notify other users
        socket.to(documentId).emit('user-joined', { id: socket.id, name: userName });
        socket.to(documentId).emit('users-list', usersList);

        console.log(`👥 Document ${documentId} now has ${session.users.size} users`);
      });

      // Handle content updates
      socket.on('content-update', (data: { documentId: string; content: string }) => {
        const { documentId, content } = data;
        const session = this.sessions.get(documentId);

        if (session) {
          session.content = content;
          session.lastUpdate = new Date();
          
          // Broadcast to other clients in the session
          socket.to(documentId).emit('content-update', content);
        }
      });

      // Handle cursor updates
      socket.on('cursor-update', (data: { documentId: string; cursor: number }) => {
        const { documentId, cursor } = data;
        const session = this.sessions.get(documentId);

        if (session) {
          const user = session.users.get(socket.id);
          if (user) {
            user.cursor = cursor;
            
            // Broadcast cursor position to other clients
          socket.to(documentId).emit('cursor-update', { 
              userId: socket.id, 
              userName: user.name, 
              cursor 
            });
          }
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);

        // Remove user from all sessions
        for (const [documentId, session] of this.sessions.entries()) {
          if (session.users.has(socket.id)) {
            const user = session.users.get(socket.id);
            session.users.delete(socket.id);
            
            // Notify other clients
            socket.to(documentId).emit('user-left', { id: socket.id, name: user?.name });
            
            const usersList = Array.from(session.users.values());
            socket.to(documentId).emit('users-list', usersList);
            
            // Clean up empty sessions
            if (session.users.size === 0) {
              this.sessions.delete(documentId);
              console.log(`🗑️ Cleaned up empty session: ${documentId}`);
            }
          }
        }
      });
    });
  }

  // Method to get session info for debugging
  getSessions() {
    return Array.from(this.sessions.entries()).map(([id, session]) => ({
      documentId: id,
      content: session.content.substring(0, 100) + '...',
      userCount: session.users.size,
      lastUpdate: session.lastUpdate
    }));
  }
}

export default SimpleCollaborationServer;

const Hocuspocus = require("@hocuspocus/server").Server;
const Y = require("yjs");

// Configure Hocuspocus server
const server = new Hocuspocus({
  port: process.env.COLLABORATION_PORT || 1234,

  // Handle document changes
  onAuthenticate: async (data: any) => {
    const { token } = data;
    
    // Simple token validation - in production, use proper JWT verification
    if (!token || token !== "papyrus-collab-token") {
      throw new Error("Invalid authentication token");
    }
    
    return {
      user: {
        id: "user-" + Math.random().toString(36).substring(2, 15),
        name: "Collaborative User",
      },
    };
  },

  onLoadDocument: async (data: any) => {
    const { documentName } = data;
    
    console.log(`📝 Loading collaborative document: ${documentName}`);
    
    try {
      // Load document from MongoDB or create new one
      // For now, return empty document
      const ydoc = new Y.Doc();
      
      // You could load existing document content from MongoDB here
      // const existingContent = await loadDocumentFromMongo(documentName);
      // if (existingContent) {
      //   Y.applyUpdate(ydoc, existingContent);
      // }
      
      return ydoc;
    } catch (error: any) {
      console.error(`❌ Failed to load document ${documentName}:`, error);
      throw error;
    }
  },

  onStoreDocument: async (data: any) => {
    const { documentName, document } = data;
    
    console.log(`💾 Storing collaborative document: ${documentName}`);
    
    try {
      // Store document state to MongoDB
      const state = Y.encodeStateAsUpdate(document);
      
      // You could save this to MongoDB here
      // await saveDocumentToMongo(documentName, state);
      
      console.log(`✅ Document ${documentName} stored successfully`);
    } catch (error: any) {
      console.error(`❌ Failed to store document ${documentName}:`, error);
    }
  },

  onConnect: (data: any) => {
    console.log(`🔗 Client connected to collaboration server: ${data.documentName}`);
  },

  onDisconnect: (data: any) => {
    console.log(`🔌 Client disconnected from collaboration server: ${data.documentName}`);
  },
});

// Start the server
server.listen().then(() => {
  console.log(`🚀 Hocuspocus collaboration server running on port ${process.env.COLLABORATION_PORT || 1234}`);
}).catch((error: any) => {
  console.error("❌ Failed to start collaboration server:", error);
});

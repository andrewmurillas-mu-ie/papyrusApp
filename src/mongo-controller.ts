import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

export async function connect(): Promise<typeof mongoose> {
  try {
    console.log("🔗 Connecting to MongoDB Atlas...");
    
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not set");
    }
    
    const options = {
      serverSelectionTimeoutMS: 10000,
      retryWrites: true,
      bufferCommands: false
    };

    const connection = await mongoose.connect(process.env.MONGO_URI, options);
    
    console.log("✅ Successfully connected to MongoDB Atlas");
    console.log(`📊 Database: ${connection.connection.name}`);
    console.log(`🔗 Connection host: ${connection.connection.host}`);
    
    // Test the connection with a simple operation
    if (connection.connection.db) {
      await connection.connection.db.admin().ping();
      console.log("🏓 MongoDB ping successful - connection verified");
    } else {
      console.log("📊 MongoDB connection established (no database specified)");
    }
    
    return connection;
  } catch (error) {
    console.error("❌ MongoDB Atlas connection failed:", error);
    console.error("� CRITICAL: MongoDB connection is required for application to function");
    console.error("🔧 Please check:");
    console.error("   1. MONGO_URI environment variable is correct");
    console.error("   2. MongoDB Atlas cluster is running");
    console.error("   3. Network connectivity is available");
    console.error("   4. IP whitelist includes your current IP");
    
    // Exit the application since MongoDB is required
    process.exit(1);
  }
}

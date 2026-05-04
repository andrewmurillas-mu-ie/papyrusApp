import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

export async function connect(): Promise<typeof mongoose> {
  return mongoose.connect(process.env.MONGO_URI!, {
    serverSelectionTimeoutMS: 5000,
  });
}

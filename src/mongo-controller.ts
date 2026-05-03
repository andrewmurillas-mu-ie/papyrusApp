import "dotenv/config";
import mongoose from "mongoose";

const uri: string = process.env.MONGO_URI!;

export async function connect(): Promise<typeof mongoose> {
  return mongoose.connect(process.env.MONGO_URI!);
}

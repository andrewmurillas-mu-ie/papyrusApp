import 'dotenv/config';
import mongoose from 'mongoose';

const uri: string = process.env.MONGO_URI!;

export async function connectMongoose(): Promise<void> {
  if (!uri) {
    throw new Error('MONGO_URI is missing from .env');
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log('Mongoose connected to MongoDB');
}

import 'dotenv/config';
import { MongoClient } from 'mongodb';

const uri: string = process.env.MONGO_URI!;

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 5000,
});

export async function connect(): Promise<MongoClient> {
  try {
    await client.connect();
    console.log('Native MongoDB driver connected to MongoDB');
  } catch (error) {
    console.error('Native MongoDB connection failed. Continuing without native MongoDB connection.');
    console.error(error);
  }

  return client;
}

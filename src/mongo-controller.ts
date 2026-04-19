import 'dotenv/config';
import {MongoClient} from 'mongodb';

const uri = process.env.MONGO_URI!;

const client = new MongoClient(uri);

export async function connect(): Promise<MongoClient> {

	await client.connect();

	return client;
}
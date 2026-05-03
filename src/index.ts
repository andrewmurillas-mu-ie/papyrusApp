import express, { Application } from 'express';
import { Db, MongoClient } from 'mongodb';
import { connect } from './mongo-controller';
import { connectMongoose } from './mongoose-controller';
import userRouter from './routes/user_routes';
import authRouter from './routes/auth_routes';
import documentRouter from './routes/document_routes';
import aiRouter from './routes/ai_routes';
import './auth/passport';
import cors from 'cors';


const app: Application = express();
const PORT: number = process.env.PORT as unknown as number || 3000;

app.use(
  cors({
    origin: 'http://localhost:5174',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

app.use(express.json());
app.use('/auth', authRouter);
app.use('/', userRouter);
app.use('/documents', documentRouter);
app.use('/ai', aiRouter);

const client: Promise<MongoClient> = connect();
export const db: Promise<Db> = client.then((c) => c.db('papyrus'));

connectMongoose().catch((error) => {
  console.error('Mongoose connection failed:', error);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
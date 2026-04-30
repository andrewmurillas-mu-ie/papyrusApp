import express, {Application} from 'express';
import {Db, MongoClient} from 'mongodb';
import {connect} from './mongo-controller';
import userRouter from './routes/user_routes';
import authRouter from './routes/auth_routes';
import pageRouter from './routes/page_routes';
import './auth/passport';

const app: Application = express();
const PORT: number = process.env.PORT as unknown as number || 3000;

app.use(express.json());
app.use('/auth', authRouter);
app.use('/', userRouter);
app.use('/', pageRouter);

const client: Promise<MongoClient> = connect();
export const db: Promise<Db> = client.then(c => c.db('papyrus'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

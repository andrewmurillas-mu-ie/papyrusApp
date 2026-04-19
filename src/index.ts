import express, {Application} from 'express';
import {Db, MongoClient} from 'mongodb';
import {connect} from './mongo-controller';
import userRouter from './routes/user_routes';

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/', userRouter);

const client: Promise<MongoClient> = connect();
export const db: Promise<Db> = client.then(c => c.db('papyrus'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

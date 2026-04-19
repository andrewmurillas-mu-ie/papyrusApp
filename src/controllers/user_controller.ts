import {Request, Response} from 'express';
import {getUser, User} from '../models/user_model.js';

export async function requestUser(req: Request, res: Response): Promise<void> {
    const user: User | undefined = await getUser('000');
    res.json(user);
}
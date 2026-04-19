import {Request, Response} from 'express';
import {getAllUsers, getUser, User} from '../models/user_model.js';

export async function requestUser(req: Request, res: Response): Promise<void> {
    const user: User | null = await getUser(req.params.id as string);
    res.json(user);
}

export async function requestAllUsers(_ :Request, res: Response): Promise<void> {
    const users: User[] = await getAllUsers();
    res.json(users);
}
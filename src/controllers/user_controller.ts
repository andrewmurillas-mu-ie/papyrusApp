import { Request, Response } from "express";
import User, {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from "../models/user_model";

export async function requestUser(req: Request, res: Response): Promise<void> {
  const user: User | null = await getUser(req.params.id as string);
  res.json(user);
}

export async function requestAllUsers(
  _: Request,
  res: Response,
): Promise<void> {
  const users: User[] = await getAllUsers();
  res.json(users);
}

export async function requestCreateUser(
  req: Request,
  res: Response,
): Promise<void> {
  const user: User = req.body;
  await createUser(user);
  res.status(201).json(user);
}

export async function requestUpdateUser(
  req: Request,
  res: Response,
): Promise<void> {
  const user: User = req.body;
  await updateUser(req.params.id as string, user);
  res.json(user);
}

export async function requestDeleteUser(
  req: Request,
  res: Response,
): Promise<void> {
  await deleteUser(req.params.id as string);
  res.status(204).end();
}

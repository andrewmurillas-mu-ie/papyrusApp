import { db } from "../index";
import { Collection, Filter, WithId } from "mongodb";
import { Types } from "mongoose";

export default interface User {
  fullName: string;
  githubId: string;
  passwordHash?: string;
  role: "admin" | "user";
  avatarUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

function isUser(doc: WithId<User> | null): doc is WithId<User> & User {
  if (!doc) return false;
  return (
    "fullName" in doc &&
    "githubId" in doc &&
    "avatarUrl" in doc &&
    "createdAt" in doc &&
    "updatedAt" in doc
  );
}

export async function getUser(userId: string): Promise<User | null> {
  const users: Collection<User> = (await db).collection<User>("users");
  const query: Filter<User> = { _id: new Types.ObjectId(userId) } as Filter<User>;
  const userDocument: WithId<User> | any = await users.findOne(query);
  if (!isUser(userDocument)) return null;
  return userDocument;
}

export async function getAllUsers(): Promise<User[]> {
  const users: Collection<User> = (await db).collection<User>("users");
  return users.find().toArray();
}

export async function createUser(user: User): Promise<User> {
  const users: Collection<User> = (await db).collection<User>("users");
  await users.insertOne(user as any);
  return user;
}

export async function getUserByGithubId(
  githubId: string,
): Promise<User | null> {
  const users: Collection<User> = (await db).collection<User>("users");
  return users.findOne({ githubId } as Filter<User>);
}

export async function updateUser(userId: string, user: User): Promise<void> {
  const users: Collection<User> = (await db).collection<User>("users");
  await users.updateOne({ _id: new Types.ObjectId(userId) }, { $set: user });
}

export async function deleteUser(userId: string): Promise<void> {
  const users: Collection<User> = (await db).collection<User>("users");
  await users.deleteOne({ _id: new Types.ObjectId(userId) });
}

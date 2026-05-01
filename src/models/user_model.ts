import { db } from "../index";
import { Collection, Filter, ObjectId, WithId } from "mongodb";

export default interface User {
  name: string;
  email: string;
  githubId: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

function isUser(doc: WithId<User> | null): doc is WithId<User> & User {
  if (!doc) return false;
  return (
    "name" in doc &&
    "email" in doc &&
    "avatarUrl" in doc &&
    "createdAt" in doc &&
    "updatedAt" in doc
  );
}

export async function getUser(userId: string): Promise<User | null> {
  const users: Collection<User> = (await db).collection<User>("users");
  const query: Filter<User> = { _id: new ObjectId(userId) } as Filter<User>;
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
  await users.insertOne(user);
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
  await users.updateOne({ _id: new ObjectId(userId) }, { $set: user });
}

export async function deleteUser(userId: string): Promise<void> {
  const users: Collection<User> = (await db).collection<User>("users");
  await users.deleteOne({ _id: new ObjectId(userId) });
}

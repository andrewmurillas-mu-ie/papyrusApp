import mongoose, { Model, Schema } from "mongoose";

export default interface User {
  fullName: string;
  githubId: string;
  passwordHash?: string;
  role: "admin" | "user";
  avatarUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<User>({
  fullName: { type: String, required: true },
  githubId: { type: String, required: true, unique: true },
  passwordHash: { type: String },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  avatarUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const UserModel: Model<User> = mongoose.model<User>("User", UserSchema);

export async function getUser(userId: string): Promise<User | null> {
  return UserModel.findById(userId);
}

export async function getAllUsers(): Promise<User[]> {
  return UserModel.find();
}

export async function createUser(user: User): Promise<User> {
  return UserModel.create(user);
}

export async function getUserByGithubId(githubId: string): Promise<User | null> {
  return UserModel.findOne({ githubId });
}

export async function updateUser(userId: string, user: Partial<User>): Promise<void> {
  await UserModel.findByIdAndUpdate(userId, user);
}

export async function deleteUser(userId: string): Promise<void> {
  await UserModel.findByIdAndDelete(userId);
}
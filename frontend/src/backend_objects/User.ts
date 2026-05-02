export default interface User {
  _id: string;
  fullName: string;
  email: string;
  githubId: string;
  avatarUrl: string;
  role: "admin" | "user";
  createdAt: string;
  updatedAt: string;
}

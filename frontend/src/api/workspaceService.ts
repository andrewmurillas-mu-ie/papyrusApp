import { ObjectId } from "mongodb";

export default interface Workspace {
  _id: string;
  name: string;
  owner: string;
  members: { user: ObjectId; permission: "owner" | "editor" | "viewer" }[];
  createdAt: Date;
  lastUpdated: Date;
}


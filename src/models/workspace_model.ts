import { db } from "../index";
import { Collection, Filter, ObjectId, WithId } from "mongodb";
import User from "./user_model";

enum permission {
  owner = 0,
  editor = 1,
  viewer = 2,
}

export interface Workspace {
  name: string;
  owner: User;
  members: User[];
  permissions: permission[];
  createdAt: Date;
  lastUpdate: Date;
}

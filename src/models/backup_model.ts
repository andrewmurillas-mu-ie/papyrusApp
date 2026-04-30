import { db } from "../index";
import { Collection, Filter, ObjectId, WithId } from "mongodb";
import User from "./user_model";

export default interface Backup {
  user: ObjectId;
  workspace: ObjectId;
  format: string;
  data: any;
  createdAt: Date;
  lastUpdated: Date;
}

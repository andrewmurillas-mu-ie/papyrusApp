import { db } from "../index";
import { Collection, Filter, ObjectId, WithId } from "mongodb";
import User from "./user_model";

export default interface Version {
  page: ObjectId;
  versionNumber: number;
  snapshot: any;
  savedBy: ObjectId;
  createAt: Date;
  updatedAt: Date;
}

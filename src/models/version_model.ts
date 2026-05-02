import { Schema, Types } from "mongoose";

type Mixed = Schema.Types.Mixed;
type ObjectId = Types.ObjectId;

export default interface Version {
  page: ObjectId;
  versionNumber: number;
  snapshot: Mixed;
  savedBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

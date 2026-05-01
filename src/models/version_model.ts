import { ObjectId } from "mongodb";

export default interface Version {
  page: ObjectId;
  versionNumber: Number;
  snapshot: any;
  savedBy: ObjectId;
  createAt: Date;
  updatedAt: Date;
}

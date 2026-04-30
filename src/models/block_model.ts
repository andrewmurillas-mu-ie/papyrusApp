import { db } from "../index";
import { Collection, Filter, ObjectId, WithId } from "mongodb";

export default interface Block {
  page: string;
  type: string;
  order: number;
  createdAt: Date;
  lastUpdate: Date;
}

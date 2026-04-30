import { db } from "../index";
import { Collection, Filter, ObjectId, WithId } from "mongodb";

import User from "./user_model";
import Block from "./block_model";

export default interface Template {
  name: string;
  description: string;
  createdBy: User;
  blocks: Block[];
}

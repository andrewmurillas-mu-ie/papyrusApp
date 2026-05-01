import { db } from "../index";
import { Collection, Filter, ObjectId, WithId } from "mongodb";

export default interface Backup {
  user: ObjectId;
  workspace: ObjectId;
  format: "json" | "markdown" | "csv";
  data: any;
  createdAt: Date;
  lastUpdated: Date;
}

function isBackup(doc: WithId<Backup> | null): doc is WithId<Backup> & Backup {
  if (!doc) return false;
  return (
    "user" in doc &&
    "workspace" in doc &&
    "format" in doc &&
    "data" in doc &&
    "createdAt" in doc &&
    "lastUpdated" in doc
  );
}

export async function getBackup(backupId: ObjectId): Promise<Backup | null> {
  const backups: Collection<Backup> = (await db).collection<Backup>("backups");
  const query: Filter<Backup> = {
    _id: new ObjectId(),
  } as Filter<Backup>;
  const backupDocument: WithId<Backup> | any = await backups.findOne(query);
  if (!isBackup(backupDocument)) return null;
  return backupDocument;
}

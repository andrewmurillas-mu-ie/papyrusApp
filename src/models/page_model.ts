import { db } from "../index";
import { Collection, Filter, ObjectId, WithId } from "mongodb";

export default interface Page {
  title: string;
  workspace: ObjectId;
  createdBy: ObjectId;
  blocks: ObjectId[];
  isShared: boolean;
  currentVersion: number;
  createdAt: Date;
  lastUpdate: Date;
}

function isPage(doc: WithId<Page> | null): doc is WithId<Page> & Page {
  if (!doc) return false;
  return (
    "title" in doc &&
    "workspace" in doc &&
    "createdBy" in doc &&
    "block" in doc &&
    "isShared" in doc &&
    "currentVersion" in doc &&
    "createdAt" in doc &&
    "updatedAt" in doc
  );
}

export async function getPage(pageId: string): Promise<Page | null> {
  const pages: Collection<Page> = (await db).collection<Page>("pages");
  const query: Filter<Page> = { _id: new ObjectId(pageId) } as Filter<Page>;
  const pageDocument: WithId<Page> | any = await pages.findOne(query);
  if (!isPage(pageDocument)) return null;
  return pageDocument;
}

export async function getAllPages(): Promise<Page[]> {
  const pages: Collection<Page> = (await db).collection<Page>("pages");
  return pages.find().toArray();
}

export async function createPage(page: Page): Promise<Page> {
  const pages: Collection<Page> = (await db).collection<Page>("pages");
  await pages.insertOne(page);
  return page;
}

export async function updatePage(pageId: string, page: Page): Promise<void> {
  const pages: Collection<Page> = (await db).collection<Page>("pages");
  await pages.updateOne({ _id: new ObjectId(pageId) }, { $set: page });
}

export async function deletePage(pageId: string): Promise<void> {
  const pages: Collection<Page> = (await db).collection<Page>("pages");
  await pages.deleteOne({ _id: new ObjectId(pageId) });
}

import { db } from "../index";
import { Collection, Filter, WithId } from "mongodb";
import { Types } from "mongoose";

type ObjectId = Types.ObjectId;

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
    "blocks" in doc &&
    "isShared" in doc &&
    "currentVersion" in doc &&
    "createdAt" in doc &&
    "lastUpdate" in doc
  );
}

export async function getPage(pageId: string): Promise<Page | null> {
  const pages: Collection<Page> = (await db).collection<Page>("pages");
  const query: Filter<Page> = {
    _id: new Types.ObjectId(pageId),
  } as Filter<Page>;
  const pageDocument: WithId<Page> | any = await pages.findOne(query);
  if (!isPage(pageDocument)) return null;
  return pageDocument;
}

export async function getPagesByUserWorkspaces(
  userId: string,
): Promise<Page[]> {
  const workspaces: Collection<Document> = (await db).collection("Workspaces");
  const userObjectId = new Types.ObjectId(userId);
  const userWorkspaces: WithId<Document>[] = await workspaces
    .find(
      { $or: [{ owner: userObjectId }, { "members.user": userObjectId }] },
      { projection: { _id: 1 } },
    )
    .toArray();

  const workspaceIds: ObjectId[] = userWorkspaces.map(
    (w: WithId<Document>): ObjectId => w._id,
  );

  const pages: Collection<Page> = (await db).collection<Page>("pages");
  return pages.find({ workspace: { $in: workspaceIds } }).toArray();
}

export async function isPageOwnedByUser(
  pageId: string,
  userId: string,
): Promise<boolean> {
  const pages: Collection<Page> = (await db).collection<Page>("pages");
  const page: WithId<Page> | null = await pages.findOne(
    { _id: new Types.ObjectId(pageId) } as Filter<Page>,
    { projection: { workspace: 1 } },
  );
  if (!page) return false;

  const workspaces: Collection<Document> = (await db).collection("Workspaces");
  const workspace: WithId<Document> | null = await workspaces.findOne({
    _id: page.workspace,
    owner: new Types.ObjectId(userId),
  });
  return workspace !== null;
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
  await pages.updateOne({ _id: new Types.ObjectId(pageId) }, { $set: page });
}

export async function deletePage(pageId: string): Promise<void> {
  const pages: Collection<Page> = (await db).collection<Page>("pages");
  await pages.deleteOne({ _id: new Types.ObjectId(pageId) });
}

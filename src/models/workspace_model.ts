import { db } from "../index";
import { Collection, Filter, WithId } from "mongodb";
import { Types } from "mongoose";

type ObjectId = Types.ObjectId;

export interface Workspace {
  name: string;
  owner: ObjectId;
  members: Array<{
    user: Types.ObjectId;
    permission: "owner" | "editor" | "viewer";
  }>;
  createdAt: Date;
  lastUpdated: Date;
}

function isWorkspace(
  doc: WithId<Workspace> | null,
): doc is WithId<Workspace> & Workspace {
  if (!doc) return false;
  return (
    "name" in doc && "owner" in doc && "members" in doc && "lastUpdated" in doc
  );
}

export async function getWorkspace(
  WorkspaceId: string,
): Promise<Workspace | null> {
  const Workspaces: Collection<Workspace> = (await db).collection<Workspace>(
    "Workspaces",
  );
  const query: Filter<Workspace> = {
    _id: new Types.ObjectId(WorkspaceId),
  } as Filter<Workspace>;
  const WorkspaceDocument: WithId<Workspace> | any =
    await Workspaces.findOne(query);
  if (!isWorkspace(WorkspaceDocument)) return null;
  return WorkspaceDocument;
}

export async function getAllWorkspaces(): Promise<Workspace[]> {
  const Workspaces: Collection<Workspace> = (await db).collection<Workspace>(
    "Workspaces",
  );
  return Workspaces.find().toArray();
}

export async function createWorkspace(
  Workspace: Workspace,
): Promise<Workspace> {
  const Workspaces: Collection<Workspace> = (await db).collection<Workspace>(
    "Workspaces",
  );
  await Workspaces.insertOne(Workspace);
  return Workspace;
}

export async function updateWorkspace(
  WorkspaceId: string,
  Workspace: Workspace,
): Promise<void> {
  const Workspaces: Collection<Workspace> = (await db).collection<Workspace>(
    "Workspaces",
  );
  await Workspaces.updateOne(
    { _id: new Types.ObjectId(WorkspaceId) },
    { $set: Workspace },
  );
}

export async function deleteWorkspace(WorkspaceId: string): Promise<void> {
  const Workspaces: Collection<Workspace> = (await db).collection<Workspace>(
    "Workspaces",
  );
  await Workspaces.deleteOne({ _id: new Types.ObjectId(WorkspaceId) });
}

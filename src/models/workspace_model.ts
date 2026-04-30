import { db } from "../index";
import { Collection, Filter, ObjectId, WithId } from "mongodb";
import User from "./user_model";
import Template from "./template_model";

enum permission {
  owner = 0,
  editor = 1,
  viewer = 2,
}

export interface Workspace {
  name: string;
  owner: User;
  members: User[];
  permissions: permission[];
  createdAt: Date;
  lastUpdate: Date;
}

function isWorkspace(
  doc: WithId<Workspace> | null,
): doc is WithId<Workspace> & Workspace {
  if (!doc) return false;
  return (
    "name" in doc &&
    "owner" in doc &&
    "members" in doc &&
    "permissions" in doc &&
    "updatedAt" in doc
  );
}

export async function getWorkspace(
  WorkspaceId: string,
): Promise<Workspace | null> {
  const Workspaces: Collection<Workspace> = (await db).collection<Workspace>(
    "Workspaces",
  );
  const query: Filter<Workspace> = {
    _id: new ObjectId(WorkspaceId),
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
    { _id: new ObjectId(WorkspaceId) },
    { $set: Workspace },
  );
}

export async function deleteWorkspace(WorkspaceId: string): Promise<void> {
  const Workspaces: Collection<Workspace> = (await db).collection<Workspace>(
    "Workspaces",
  );
  await Workspaces.deleteOne({ _id: new ObjectId(WorkspaceId) });
}

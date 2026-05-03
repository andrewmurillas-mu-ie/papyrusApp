import { Request, Response } from "express";
import {
  createWorkspace,
  deleteWorkspace,
  getWorkspace,
  getWorkspacesByOwner,
  isWorkspaceOwnedByUser,
  updateWorkspace,
  Workspace,
} from "../models/workspace_model";

export async function requestAllWorkspaces(req: Request, res: Response): Promise<void> {
  const userId: string = (req.user as any)._id;
  const workspaces: Workspace[] = await getWorkspacesByOwner(userId);
  res.json(workspaces);
}

export async function requestWorkspace(req: Request, res: Response): Promise<void> {
  const userId: string = (req.user as any)._id;
  const workspaceId = req.params.id as string;
  const owned: boolean = await isWorkspaceOwnedByUser(workspaceId, userId);
  if (!owned) { res.status(403).json({ error: "Forbidden" }); return; }
  const workspace: Workspace | null = await getWorkspace(workspaceId);
  res.json(workspace);
}

export async function requestCreateWorkspace(req: Request, res: Response): Promise<void> {
  const userId: string = (req.user as any)._id;
  const workspace: Workspace = { ...req.body, owner: userId, createdAt: new Date(), lastUpdated: new Date() };
  await createWorkspace(workspace);
  res.status(201).json(workspace);
}

export async function requestUpdateWorkspace(req: Request, res: Response): Promise<void> {
  const userId: string = (req.user as any)._id;
  const workspaceId = req.params.id as string;
  const owned: boolean = await isWorkspaceOwnedByUser(workspaceId, userId);
  if (!owned) { res.status(403).json({ error: "Forbidden" }); return; }
  await updateWorkspace(workspaceId, req.body);
  res.json(req.body);
}

export async function requestDeleteWorkspace(req: Request, res: Response): Promise<void> {
  const userId: string = (req.user as any)._id;
  const workspaceId = req.params.id as string;
  const owned: boolean = await isWorkspaceOwnedByUser(workspaceId, userId);
  if (!owned) { res.status(403).json({ error: "Forbidden" }); return; }
  await deleteWorkspace(workspaceId);
  res.status(204).end();
}
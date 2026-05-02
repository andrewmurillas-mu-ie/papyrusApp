import { Request, Response } from "express";
import { getWorkspace, Workspace } from "../models/workspace_model";

export async function requestWorkspace(
  req: Request,
  res: Response,
): Promise<void> {
  const workspace: Workspace | null = await getWorkspace(req.params.id as string);
  res.json(workspace);
}

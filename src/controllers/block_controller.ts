import { Request, Response } from "express";
import Block from "../models/block_model";
import { getBlock, deleteBlock } from "../models/block_model";

export async function requestBlock(req: Request, res: Response): Promise<void> {
  const block: Block | null = await getBlock(req.params.id as string);
  res.json(block);
}

export async function requestDeleteBlock(
  req: Request,
  res: Response,
): Promise<void> {
  await deleteBlock(req.params.id as string);
  res.status(204).end();
}

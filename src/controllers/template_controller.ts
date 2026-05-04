import { Request, Response } from "express";
import Block, {
  getBlock,
  deleteBlock,
  createBlock,
} from "../models/block_model";

export async function requestTemplate(
  req: Request,
  res: Response,
): Promise<void> {
  const block: Block | null = await getBlock(req.params.id as string);
  res.json(block);
}

export async function requestCreateTemplate(
  req: Request,
  res: Response,
): Promise<void> {
  const block: Block = req.body;
  await createBlock(block);
  res.status(201).json(block);
}

export async function requestDeleteTemplate(
  req: Request,
  res: Response,
): Promise<void> {
  await deleteBlock(req.params.id as string);
  res.status(204).end();
}

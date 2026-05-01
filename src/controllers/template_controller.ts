import { Request, Response } from "express";
import Block from "../models/block_model";
import { getBlock, deleteBlock } from "../models/block_model";
import Page, { createPage } from "../models/page_model";

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
  const page: Page = req.body;
  await createPage(page);
  res.status(201).json(page);
}

export async function requestDeleteTemplate(
  req: Request,
  res: Response,
): Promise<void> {
  await deleteBlock(req.params.id as string);
  res.status(204).end();
}

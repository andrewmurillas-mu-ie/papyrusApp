import { Request, Response } from "express";
import Page, {createPage, deletePage, getAllPages, getPage, updatePage} from '../models/page_model'

export async function requestPage(req: Request, res: Response): Promise<void> {
  const page: Page | null = await getPage(req.params.id as string);
  res.json(page);
}

export async function requestAllPages(_: Request, res: Response): Promise<void> {
  const pages: Page[] = await getAllPages();
  res.json(pages);
}

export async function requestCreatePage(req: Request, res: Response): Promise<void> {
  const page: Page = req.body;
  await createPage(page);
  res.status(201).json(page)
}

export async function requestUpdatePage(req: Request, res: Response): Promise<void> {
  const page: Page = req.body;
  await updatePage(req.params.id as string, page);
  res.json(page);
}

export async function requestDeletePage(req: Request, res: Response): Promise<void> {
  await deletePage(req.params.id as string);
  res.status(204).end();
}
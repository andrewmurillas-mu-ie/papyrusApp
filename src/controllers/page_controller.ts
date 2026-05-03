import { Request, Response } from "express";
import Page, {
  createPage,
  deletePage,
  getPage,
  getPagesByUserWorkspaces,
  isPageOwnedByUser,
  updatePage,
} from "../models/page_model";

export async function requestAllPages(
  req: Request,
  res: Response,
): Promise<void> {
  const userId: string = (req.user as any)._id;
  const pages: Page[] = await getPagesByUserWorkspaces(userId);
  res.json(pages);
}

export async function requestPage(req: Request, res: Response): Promise<void> {
  const userId: string = (req.user as any)._id;
  const pageId = req.params.id as string;
  const owned: boolean = await isPageOwnedByUser(pageId, userId);
  if (!owned) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const page: Page | null = await getPage(pageId);
  res.json(page);
}

export async function requestCreatePage(
  req: Request,
  res: Response,
): Promise<void> {
  const page: Page = req.body;
  await createPage(page);
  res.status(201).json(page);
}

export async function requestUpdatePage(
  req: Request,
  res: Response,
): Promise<void> {
  const userId: string = (req.user as any)._id;
  const pageId = req.params.id as string;
  const owned: boolean = await isPageOwnedByUser(pageId, userId);
  if (!owned) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const page: Page = req.body;
  await updatePage(pageId, page);
  res.json(page);
}

export async function requestDeletePage(
  req: Request,
  res: Response,
): Promise<void> {
  const userId: string = (req.user as any)._id;
  const pageId = req.params.id as string;
  const owned: boolean = await isPageOwnedByUser(pageId, userId);
  if (!owned) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  await deletePage(pageId);
  res.status(204).end();
}

import { db } from "../index";
import { Collection, Filter, ObjectId, WithId } from "mongodb";

export default interface Block {
  page: ObjectId;
  type: "heading" | "text" | "checklist" | "table" | "image";
  content: Record<string, unknown>;
  order: Number;
  createdAt: Date;
  lastUpdated: Date;
}

function isBlock(doc: WithId<Block> | null): doc is WithId<Block> & Block {
  if (!doc) return false;
  return (
    "page" in doc &&
    "type" in doc &&
    "content" in doc &&
    "order" in doc &&
    "createdAt" in doc &&
    "lastUpdated" in doc
  );
}

export async function getBlock(blockId: string): Promise<Block | null> {
  const blocks: Collection<Block> = (await db).collection<Block>("Blocks");
  const query: Filter<Block> = {
    _id: new ObjectId(blockId),
  } as Filter<Block>;
  const blockDocument: WithId<Block> | any = await blocks.findOne(query);
  if (!isBlock(blockDocument)) return null;
  return blockDocument;
}

export async function createBlock(Block: Block): Promise<Block> {
  const Blocks: Collection<Block> = (await db).collection<Block>("Blocks");
  await Blocks.insertOne(Block);
  return Block;
}

export async function updateBlock(
  BlockId: string,
  Block: Block,
): Promise<void> {
  const Blocks: Collection<Block> = (await db).collection<Block>("Blocks");
  await Blocks.updateOne({ _id: new ObjectId(BlockId) }, { $set: Block });
}

export async function deleteBlock(BlockId: string): Promise<void> {
  const Blocks: Collection<Block> = (await db).collection<Block>("Blocks");
  await Blocks.deleteOne({ _id: new ObjectId(BlockId) });
}

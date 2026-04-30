import { db } from "../index";
import { Collection, Filter, ObjectId, WithId } from "mongodb";

export default interface Block {
  page: ObjectId;
  type: string;
  content: any;
  order: number;
  createdAt: any;
  lastUpdated: Date;
}

function isBlock(doc: WithId<Block> | null): doc is WithId<Block> & Block {
  if (!doc) return false;
  return (
    "page" in doc &&
    "type" in doc &&
    "content" in doc &&
    "order" in doc &&
    "createAt" in doc &&
    "lastUpdated" in doc
  );
}

export async function getBlock(BlockId: string): Promise<Block | null> {
  const Blocks: Collection<Block> = (await db).collection<Block>("Blocks");
  const query: Filter<Block> = {
    _id: new ObjectId(BlockId),
  } as Filter<Block>;
  const BlockDocument: WithId<Block> | any = await Blocks.findOne(query);
  if (!isBlock(BlockDocument)) return null;
  return BlockDocument;
}

export async function getAllBlocks(): Promise<Block[]> {
  const Blocks: Collection<Block> = (await db).collection<Block>("Blocks");
  return Blocks.find().toArray();
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

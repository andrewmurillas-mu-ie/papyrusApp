import mongoose, { Model, Schema, Types } from "mongoose";

type ObjectId = Types.ObjectId;

export default interface Block {
  page: ObjectId;
  type: "heading" | "text" | "checklist" | "table" | "image";
  content: Record<string, unknown>;
  order: number;
  createdAt: Date;
  lastUpdated: Date;
}

const BlockSchema = new Schema<Block>({
  page: { type: Schema.Types.ObjectId, ref: "Page", required: true },
  type: {
    type: String,
    enum: ["heading", "text", "checklist", "table", "image"],
    required: true,
  },
  content: { type: Schema.Types.Mixed, required: true },
  order: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
});

const BlockModel: Model<Block> = mongoose.model<Block>("Block", BlockSchema);

export async function getBlock(blockId: string): Promise<Block | null> {
  return BlockModel.findById(blockId);
}

export async function createBlock(block: Block): Promise<Block> {
  return BlockModel.create(block);
}

export async function updateBlock(
  blockId: string,
  block: Partial<Block>,
): Promise<void> {
  await BlockModel.findByIdAndUpdate(blockId, block);
}

export async function deleteBlock(blockId: string): Promise<void> {
  await BlockModel.findByIdAndDelete(blockId);
}

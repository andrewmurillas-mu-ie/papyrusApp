import mongoose, { Model, Schema, Types } from "mongoose";

type ObjectId = Types.ObjectId;

export default interface Template {
  name: string;
  description: string;
  createdBy: ObjectId;
  blocks: Array<{
    type: string;
    content: Record<string, unknown>;
    order: number;
  }>;
  isPublic: boolean;
  category: "to-do" | "planner" | "expense" | "notes" | "other";
  createdAt: Date;
  lastUpdated: Date;
}

const TemplateSchema = new Schema<Template>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  blocks: [
    {
      type: { type: String, required: true },
      content: { type: Schema.Types.Mixed, required: true },
      order: { type: Number, required: true },
    },
  ],
  isPublic: { type: Boolean, default: false },
  category: {
    type: String,
    enum: ["to-do", "planner", "expense", "notes", "other"],
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
});

const TemplateModel: Model<Template> = mongoose.model<Template>(
  "Template",
  TemplateSchema,
);

export async function getTemplate(
  templateId: string,
): Promise<Template | null> {
  return TemplateModel.findById(templateId);
}

export async function getAllTemplates(): Promise<Template[]> {
  return TemplateModel.find();
}

export async function createTemplate(template: Template): Promise<Template> {
  return TemplateModel.create(template);
}

export async function updateTemplate(
  templateId: string,
  template: Partial<Template>,
): Promise<void> {
  await TemplateModel.findByIdAndUpdate(templateId, template);
}

export async function deleteTemplate(templateId: string): Promise<void> {
  await TemplateModel.findByIdAndDelete(templateId);
}

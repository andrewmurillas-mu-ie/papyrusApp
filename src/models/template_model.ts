import { db } from "../index";
import { Collection, Filter, WithId } from "mongodb";
import { Types } from "mongoose";

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

function isTemplate(
  doc: WithId<Template> | null,
): doc is WithId<Template> & Template {
  if (!doc) return false;
  return (
    "name" in doc &&
    "description" in doc &&
    "createdBy" in doc &&
    "blocks" in doc &&
    "isPublic" in doc &&
    "category" in doc &&
    "createdAt" in doc &&
    "lastUpdated" in doc
  );
}

export async function getTemplate(
  TemplateId: string,
): Promise<Template | null> {
  const Templates: Collection<Template> = (await db).collection<Template>(
    "templates",
  );
  const query: Filter<Template> = {
    _id: new Types.ObjectId(TemplateId),
  } as Filter<Template>;
  const TemplateDocument: WithId<Template> | any =
    await Templates.findOne(query);
  if (!isTemplate(TemplateDocument)) return null;
  return TemplateDocument;
}

export async function getAllTemplates(): Promise<Template[]> {
  const Templates: Collection<Template> = (await db).collection<Template>(
    "Templates",
  );
  return Templates.find().toArray();
}

export async function createTemplate(Template: Template): Promise<Template> {
  const Templates: Collection<Template> = (await db).collection<Template>(
    "Templates",
  );
  await Templates.insertOne(Template);
  return Template;
}

export async function updateTemplate(
  TemplateId: string,
  Template: Template,
): Promise<void> {
  const Templates: Collection<Template> = (await db).collection<Template>(
    "Templates",
  );
  await Templates.updateOne(
    { _id: new Types.ObjectId(TemplateId) },
    { $set: Template },
  );
}

export async function deleteTemplate(TemplateId: string): Promise<void> {
  const Templates: Collection<Template> = (await db).collection<Template>(
    "Templates",
  );
  await Templates.deleteOne({ _id: new Types.ObjectId(TemplateId) });
}

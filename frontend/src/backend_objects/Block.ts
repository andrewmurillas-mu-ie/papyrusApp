export default interface Block {
  _id: string;
  page: string;
  type: "heading" | "text" | "checklist" | "table" | "image";
  content: Record<string, unknown>;
  order: number;
  createdAt: Date;
  lastUpdated: Date;
}

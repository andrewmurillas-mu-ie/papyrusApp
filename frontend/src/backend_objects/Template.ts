export default interface Template {
  _id: string;
  name: string;
  description: string;
  createdBy: string;
  blocks: Array<{ type: string; content: any; order: number }>;
  isPublic: boolean;
  category: "to-do" | "planner" | "expense" | "notes" | "other";
  createdAt: Date;
  lastUpdated: Date;
}

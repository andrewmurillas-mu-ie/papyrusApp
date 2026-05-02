export default interface Workspace {
  _id: string;
  name: string;
  owner: string;
  members: { user: string; permission: "owner" | "editor" | "viewer" }[];
  createdAt: Date;
  lastUpdated: Date;
}

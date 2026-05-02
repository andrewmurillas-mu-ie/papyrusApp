export default interface Page {
  _id: string;
  title: string;
  workspace: string;
  createdBy: string;
  blocks: string[];
  isShared: boolean;
  currentVersion: number;
  createdAt: Date;
  lastUpdate: Date;
}

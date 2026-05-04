export default interface Page {
  _id: string;
  title: string;
  workspace: string;
  createdBy: string;
  blocks: string[];
  contentHtml: string;
  contentText: string;
  isShared: boolean;
  currentVersion: number;
  createdAt: string;
  lastUpdate: string;
}

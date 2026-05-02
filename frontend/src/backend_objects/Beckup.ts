export default interface Backup {
  _id: string;
  user: string;
  workspace: string;
  format: "json" | "markdown" | "csv";
  data: any;
  createdAt: Date;
  lastUpdated: Date;
}

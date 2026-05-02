export default interface Version {
  _id: string;
  page: string;
  versionNumber: number;
  snapshot: any;
  savedBy: string;
  createAt: Date;
  updatedAt: Date;
}

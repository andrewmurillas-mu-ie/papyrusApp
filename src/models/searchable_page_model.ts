import mongoose, { Schema, Document, Model } from 'mongoose';

export interface SearchablePageDocument extends Document {
  title: string;
  contentHtml: string;
  contentText: string;
  ownerId?: string;
  sourceKey: string;
  createdAt: Date;
  updatedAt: Date;
}

const searchablePageSchema = new Schema<SearchablePageDocument>(
  {
    title: {
      type: String,
      default: 'Untitled page',
      trim: true,
    },
    contentHtml: {
      type: String,
      required: true,
    },
    contentText: {
      type: String,
      required: true,
      index: true,
    },
    ownerId: {
      type: String,
      default: '',
      index: true,
    },
    sourceKey: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

searchablePageSchema.index({
  title: 'text',
  contentText: 'text',
});

searchablePageSchema.index({
  ownerId: 1,
  sourceKey: 1,
});

const SearchablePage: Model<SearchablePageDocument> =
  mongoose.models.SearchablePage ||
  mongoose.model<SearchablePageDocument>('SearchablePage', searchablePageSchema);

export default SearchablePage;

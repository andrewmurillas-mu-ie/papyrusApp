import mongoose, { Schema, Document, Model } from 'mongoose';

export interface AiCacheDocument extends Document {
  feature: 'grammar' | 'smart-search';
  inputHash: string;
  inputText: string;
  outputText: string;
  createdAt: Date;
  updatedAt: Date;
}

const aiCacheSchema = new Schema<AiCacheDocument>(
  {
    feature: {
      type: String,
      enum: ['grammar', 'smart-search'],
      required: true,
    },
    inputHash: {
      type: String,
      required: true,
    },
    inputText: {
      type: String,
      required: true,
    },
    outputText: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

aiCacheSchema.index({ feature: 1, inputHash: 1 }, { unique: true });

const AiCache: Model<AiCacheDocument> =
  mongoose.models.AiCache ||
  mongoose.model<AiCacheDocument>('AiCache', aiCacheSchema);

export default AiCache;

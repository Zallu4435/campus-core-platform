import mongoose, { Schema, Document } from 'mongoose';
import { MaterialType, MaterialDifficulty } from '../../../../domain/materials/entities/MaterialTypes';

export interface IMaterialPersistence extends Document {
  title: string;
  description: string;
  subject: string;
  course: string;
  semester: number;
  type: MaterialType;
  fileUrl: string;
  thumbnailUrl: string;
  tags: string[];
  difficulty: MaterialDifficulty;
  estimatedTime: string;
  isNewMaterial: boolean;
  isRestricted: boolean;
  uploadedBy: string;
  uploadedAt: Date;
  views: number;
  downloads: number;
  rating: number;
  bookmarks: { userId: string }[];
  likes: { userId: string }[];
}

const materialSchema = new Schema<IMaterialPersistence>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  subject: { type: String, required: true },
  course: { type: String, required: true },
  semester: { type: Number, required: true },
  type: { type: String, required: true },
  fileUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  tags: [{ type: String }],
  difficulty: { type: String, required: true },
  estimatedTime: { type: String, required: true },
  isNewMaterial: { type: Boolean, default: true },
  isRestricted: { type: Boolean, default: false },
  uploadedBy: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  bookmarks: [{
    userId: { type: String, required: true }
  }],
  likes: [{
    userId: { type: String, required: true }
  }]
});

export const MaterialModel = mongoose.model<IMaterialPersistence>('Material', materialSchema);
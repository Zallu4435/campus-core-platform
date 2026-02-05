import mongoose, { Schema, Document } from "mongoose";
import {
  SportStatus,
  SportRequestStatus,
  SportData,
  SportRequestData
} from "../../../../domain/sports/entities/SportTypes";

export interface ISportDocument extends Omit<SportData, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const teamSchema = new Schema<ISportDocument>(
  {
    title: { type: String, required: true },
    type: { type: String, required: true },
    category: { type: String, required: true },
    organizer: { type: String, required: true },
    organizerType: { type: String, required: true },
    icon: { type: String, default: '⚽' },
    color: { type: String, default: '#8B5CF6' },
    division: { type: String, required: false, default: '' },
    headCoach: { type: String, required: false, default: '' },
    homeGames: { type: Number, required: false, default: 0 },
    record: { type: String, required: false, default: '0-0-0' },
    upcomingGames: [
      {
        date: { type: String, required: false },
        description: { type: String, required: false },
      },
    ],

    participants: { type: Number, required: false, default: 0 },

    status: {
      type: String,
      enum: Object.values(SportStatus),
      default: SportStatus.Active,
    },
  },
  { timestamps: true }
);

export interface ISportRequestDocument extends Omit<SportRequestData, 'id' | '_id' | 'sportId' | 'userId'>, Document {
  _id: mongoose.Types.ObjectId;
  sportId: mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId; title: string; type: string };
  userId: mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId; email: string; firstName?: string; lastName?: string };
}

const sportRequestSchema = new Schema<ISportRequestDocument>(
  {
    sportId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: Object.values(SportRequestStatus),
      default: SportRequestStatus.Pending,
    },
    whyJoin: { type: String, required: true },
    additionalInfo: { type: String, default: "" },
  },
  { timestamps: true }
);

export const TeamModel = mongoose.model<ISportDocument>("Team", teamSchema);
export const SportRequestModel = mongoose.model<ISportRequestDocument>(
  "SportRequest",
  sportRequestSchema
);

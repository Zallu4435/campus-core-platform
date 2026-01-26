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
    icon: { type: String, required: true },
    color: { type: String, required: true },
    division: { type: String, required: true },
    headCoach: { type: String, required: true },
    homeGames: { type: Number, required: true },
    record: { type: String, required: true },
    upcomingGames: [
      {
        date: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
    participants: { type: Number, required: true },
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

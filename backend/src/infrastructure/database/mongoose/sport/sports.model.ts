import mongoose, { Schema } from "mongoose";
import {
  SportStatus,
  SportRequestStatus,
  SportDoc,
  SportRequestDoc
} from "../../../../domain/sports/entities/SportTypes";

const teamSchema = new Schema<SportDoc>(
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
    logo: { type: String },
  },
  { timestamps: true }
);

const sportRequestSchema = new Schema<SportRequestDoc>(
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

export const TeamModel = mongoose.model<SportDoc>("Team", teamSchema);
export const SportRequestModel = mongoose.model<SportRequestDoc>(
  "SportRequest",
  sportRequestSchema
);

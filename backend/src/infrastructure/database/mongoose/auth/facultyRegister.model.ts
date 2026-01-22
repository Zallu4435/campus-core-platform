import mongoose, { Schema } from "mongoose";
import { IFacultyRegister } from '../../../../domain/auth/entities/AuthTypes';

const FacultyRegisterSchema: Schema = new Schema<IFacultyRegister>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    department: { type: String, required: true },
    qualification: { type: String, required: true },
    experience: { type: String, required: true },
    aboutMe: { type: String, required: true },
    password: { type: String, required: false },
    cvUrl: { type: String },
    certificatesUrl: { type: [String] },
    rejectedBy: {
      type: String,
      enum: ["admin", "user", null],
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "offered", "approved", "rejected"],
      default: "pending",
    },
    blocked: { type: Boolean, default: false },
    confirmationToken: { type: String, default: null },
    tokenExpiry: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

export const FacultyRegister = mongoose.model<IFacultyRegister>(
  "FacultyRegister",
  FacultyRegisterSchema
);

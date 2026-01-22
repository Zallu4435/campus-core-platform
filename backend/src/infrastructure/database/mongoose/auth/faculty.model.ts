import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { IFaculty } from "../../../../domain/auth/entities/AuthTypes";

const facultySchema = new Schema<IFaculty>({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
  },
  password: { type: String, required: true, minlength: 8 },
  createdAt: { type: Date, default: Date.now },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[0-9\- ]{7,15}$/, "Please use a valid phone number"],
  },
  profilePicture: {
    type: String,
    trim: true,
  },
  passwordChangedAt: { type: Date },
  fcmTokens: [{ type: String }],
  blocked: { type: Boolean, default: false },
});

facultySchema.pre("save", async function (next) {
  const faculty = this;

  if (!faculty.isModified("password")) return next();

  // If password is already hashed (starts with $2a$, $2b$, or $2y$ and is 60 chars long), skip
  if (/^\$2[aby]\$[\d]+\$/.test(faculty.password) && faculty.password.length === 60) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    faculty.password = await bcrypt.hash(faculty.password, salt);
    faculty.passwordChangedAt = new Date();
    next();
  } catch (err) {
    next(err as Error);
  }
});

export const Faculty = mongoose.model<IFaculty>("Faculty", facultySchema);

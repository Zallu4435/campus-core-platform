import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser } from "../../../../domain/auth/entities/AuthTypes";

const userSchema = new Schema<IUser>({
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
  blocked: { type: Boolean, default: false },
});

userSchema.pre("save", async function (next) {
  const user = this;

  if (!user.isModified("password")) return next();

  if (/^\$2[aby]\$[\d]+\$/.test(user.password) && user.password.length === 60) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    user.passwordChangedAt = new Date();
    next();
  } catch (err) {
    next(err as Error);
  }
});

export const User = mongoose.model<IUser>("User", userSchema);

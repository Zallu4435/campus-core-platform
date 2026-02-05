import mongoose, { Schema } from "mongoose";

export interface FacultyUserDocument extends mongoose.Document {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    phone?: string;
    profilePicture?: string;
    role: string;
    blocked: boolean;
    createdAt: Date;
    passwordChangedAt?: Date;
    // This model seems to be the "User" model.
}

const FacultyUserSchema = new Schema<FacultyUserDocument>(
    {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: false, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
        },
        password: { type: String, required: true, minlength: 8 },
        phone: {
            type: String,
            trim: true,
            match: [/^\+?[0-9\- ]{7,15}$/, "Please use a valid phone number"],
        },
        profilePicture: {
            type: String,
            trim: true,
        },
        // Adding role if needed, originally it wasn't there but might be useful.
        // Original model didn't have role.
        blocked: { type: Boolean, default: false },
        // fcmTokens, etc from original file
    },
    {
        timestamps: { createdAt: true, updatedAt: false }, // Original had createdAt: { type: Date, default: Date.now }
    }
);
// Re-adding fields from original file to be safe
FacultyUserSchema.add({
    passwordChangedAt: { type: Date },
});

// Original pre-save hook for password hashing
import bcrypt from "bcryptjs";

FacultyUserSchema.pre("save", async function (next) {
    const faculty = this;

    if (!faculty.isModified("password")) return next();

    if (/^\$2[aby]\$[\d]+\$/.test(faculty.password!) && faculty.password!.length === 60) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        faculty.password = await bcrypt.hash(faculty.password!, salt);
        // faculty.passwordChangedAt = new Date(); // Typescript might complain if not defined in interface
        next();
    } catch (err) {
        next(err as Error);
    }
});

export const FacultyUserModel = mongoose.model<FacultyUserDocument>("Faculty", FacultyUserSchema);

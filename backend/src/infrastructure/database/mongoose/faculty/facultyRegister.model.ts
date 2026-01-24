import mongoose, { Schema } from "mongoose";
import { FacultyStatus, FacultyRejectedBy } from "../../../../domain/faculty/enums/FacultyEnums";
import { IFacultyProps } from "../../../../domain/faculty/entities/Faculty";

// Omit 'id' and split names because we use fullName in DB for this model
export interface FacultyRegisterDocument extends Omit<IFacultyProps, 'id' | 'firstName' | 'lastName'>, mongoose.Document {
    fullName: string;
    createdAt: Date;
    updatedAt: Date;
}

const FacultyRegisterSchema = new Schema<FacultyRegisterDocument>(
    {
        // firstName removed as we use fullName

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
            enum: Object.values(FacultyRejectedBy),
            default: null,
        },
        status: {
            type: String,
            enum: Object.values(FacultyStatus),
            default: FacultyStatus.PENDING,
        },
        blocked: { type: Boolean, default: false },
        confirmationToken: { type: String, default: null },
        tokenExpiry: { type: Date, default: null },
    },
    {
        timestamps: true,
    }
);

export const FacultyRegisterModel = mongoose.model<FacultyRegisterDocument>(
    "FacultyRegister",
    FacultyRegisterSchema
);

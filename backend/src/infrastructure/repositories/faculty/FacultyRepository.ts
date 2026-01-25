import { IFacultyRepository, IFacultyFilters } from "../../../application/faculty/repositories/IFacultyRepository";
import { Faculty } from "../../../domain/faculty/entities/Faculty";
import { FacultyRegisterModel, FacultyRegisterDocument } from "../../database/mongoose/faculty/facultyRegister.model";
import { FacultyUserModel } from "../../database/mongoose/faculty/faculty.model";
import { FacultyMapper } from "./FacultyMapper";
import mongoose, { FilterQuery } from "mongoose";
import { IFacultySource } from "./infraTypes";

export class FacultyRepository implements IFacultyRepository {
    private _buildQuery(filters: IFacultyFilters): FilterQuery<FacultyRegisterDocument> {
        const query: FilterQuery<FacultyRegisterDocument> = {};

        if (filters.status) {
            query.status = filters.status;
        }
        if (filters.department) {
            query.department = filters.department;
        }
        if (filters.createdAt) {
            query.createdAt = {};
            if (filters.createdAt.start) query.createdAt.$gte = filters.createdAt.start;
            if (filters.createdAt.end) query.createdAt.$lte = filters.createdAt.end;
        }
        if (filters.search) {
            query.$or = [
                { fullName: { $regex: filters.search, $options: "i" } },
                { email: { $regex: filters.search, $options: "i" } }
            ];
        }
        return query;
    }

    async findFaculty(filters: IFacultyFilters, options: { skip?: number; limit?: number; select?: string }): Promise<Faculty[]> {
        const query = this._buildQuery(filters);
        const docs = await FacultyRegisterModel.find(query)
            .sort({ updatedAt: -1, createdAt: -1 })
            .skip(options.skip || 0)
            .limit(options.limit || 0)
            .lean() as unknown as IFacultySource[];

        return docs.map((doc) => FacultyMapper.toDomain(doc));
    }

    async countFaculty(filters: IFacultyFilters): Promise<number> {
        const query = this._buildQuery(filters);
        return await FacultyRegisterModel.countDocuments(query);
    }

    async getFacultyById(id: string): Promise<Faculty | null> {
        if (!mongoose.isValidObjectId(id)) return null;
        const doc = await FacultyRegisterModel.findById(id).lean() as unknown as IFacultySource;
        if (!doc) return null;
        return FacultyMapper.toDomain(doc);
    }

    async getFacultyByToken(token: string): Promise<Faculty | null> {
        const doc = await FacultyRegisterModel.findOne({ confirmationToken: token }).lean() as unknown as IFacultySource;
        if (!doc) return null;
        return FacultyMapper.toDomain(doc);
    }

    async updateFaculty(faculty: Faculty): Promise<Faculty> {
        if (!faculty.id) throw new Error("Faculty ID is required for update");

        // We convert Domain Entity back to Persistence format
        const persistenceData = FacultyMapper.toPersistence(faculty);

        const updatedDoc = await FacultyRegisterModel.findByIdAndUpdate(
            faculty.id,
            { $set: persistenceData },
            { new: true }
        ).lean() as unknown as IFacultySource;

        if (!updatedDoc) throw new Error("Faculty not found to update");
        return FacultyMapper.toDomain(updatedDoc);
    }

    async deleteFaculty(id: string): Promise<boolean> {
        const result = await FacultyRegisterModel.deleteOne({ _id: id });
        return result.deletedCount === 1;
    }

    async saveFaculty(faculty: Faculty): Promise<Faculty> {
        // This method implies creating a new Faculty.
        const persistenceData = FacultyMapper.toPersistence(faculty);
        const newDoc = new FacultyRegisterModel(persistenceData);
        await newDoc.save();
        return FacultyMapper.toDomain(newDoc.toObject() as unknown as IFacultySource);
    }

    async blockFaculty(id: string): Promise<boolean> {
        const result = await FacultyRegisterModel.updateOne({ _id: id }, { blocked: true });
        return result.modifiedCount > 0;
    }

    async createFacultyAccount(data: { firstName: string; lastName: string; email: string; password?: string }): Promise<void> {
        const facultyAccount = new FacultyUserModel(data);
        await facultyAccount.save();
    }
}
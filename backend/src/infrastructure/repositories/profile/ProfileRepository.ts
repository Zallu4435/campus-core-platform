// ProfileRepository.ts
import { User } from "../../database/mongoose/auth/user.model";
import { FacultyUserModel as Faculty } from "../../database/mongoose/faculty/faculty.model";
import { IProfileRepository } from "../../../application/profile/repositories/IProfileRepository";
import { IProfileMapper } from "../../../application/profile/interfaces/IProfileMapper";
import { Profile, ProfileRole } from "../../../domain/profile/entities";
import { IProfileSource } from "./infraTypes";

export class ProfileRepository implements IProfileRepository {
    constructor(private _mapper: IProfileMapper) { }

    async getProfile(userId: string): Promise<Profile | null> {
        let userDocs = await User.findById(userId).lean() as unknown as IProfileSource;
        if (userDocs) {
            return this._mapper.toDomain(userDocs, false);
        }

        let facultyDocs = await Faculty.findById(userId).lean() as unknown as IProfileSource;
        if (facultyDocs) {
            return this._mapper.toDomain(facultyDocs, true);
        }

        return null;
    }

    async findByEmail(email: string): Promise<Profile | null> {
        let userDocs = await User.findOne({ email }).lean() as unknown as IProfileSource;
        if (userDocs) {
            return this._mapper.toDomain(userDocs, false);
        }

        let facultyDocs = await Faculty.findOne({ email }).lean() as unknown as IProfileSource;
        if (facultyDocs) {
            return this._mapper.toDomain(facultyDocs, true);
        }

        return null;
    }

    async checkEmailExists(email: string): Promise<boolean> {
        const userCount = await User.countDocuments({ email });
        if (userCount > 0) return true;
        const facultyCount = await Faculty.countDocuments({ email });
        return facultyCount > 0;
    }

    async save(profile: Profile): Promise<Profile> {
        const persistence = this._mapper.toPersistence(profile);
        const { id: _id, ...updateData } = persistence;

        if (profile.role === ProfileRole.Faculty) {
            const updated = await Faculty.findByIdAndUpdate(_id, updateData, { new: true }).lean() as unknown as IProfileSource;
            if (!updated) throw new Error("Faculty not found to update");
            return this._mapper.toDomain(updated, true);
        } else {
            const updated = await User.findByIdAndUpdate(_id, updateData, { new: true }).lean() as unknown as IProfileSource;
            if (!updated) throw new Error("Student not found to update");
            return this._mapper.toDomain(updated, false);
        }
    }
}
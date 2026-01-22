// UserService.ts
import { IUserService } from "../../../application/admin/services/IUserService";
import { User as UserModel } from "../../database/mongoose/auth/user.model";

export class UserService implements IUserService {
    async createUser(params: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
    }): Promise<{ id: string }> {
        const user = new UserModel({
            firstName: params.firstName,
            lastName: params.lastName,
            email: params.email,
            password: params.password,
            createdAt: new Date(),
        });

        await user.save();
        return { id: user._id.toString() };
    }

    async findByEmail(email: string): Promise<{ id: string; blocked: boolean } | null> {
        const user = await UserModel.findOne({ email }).lean();
        if (!user) return null;

        return {
            id: user._id.toString(),
            blocked: user.blocked || false
        };
    }

    async toggleBlock(userId: string): Promise<{ blocked: boolean }> {
        const user = await UserModel.findById(userId);
        if (!user) throw new Error("User not found");

        user.blocked = !user.blocked;
        await user.save();

        return { blocked: user.blocked };
    }
}

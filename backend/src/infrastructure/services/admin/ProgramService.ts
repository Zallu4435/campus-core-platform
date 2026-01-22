// ProgramService.ts
import { IProgramService } from "../../../application/admin/services/IProgramService";
import { ProgramModel } from "../../database/mongoose/academic/studentProgram.model";

export class ProgramService implements IProgramService {
    async enrollStudent(params: {
        studentId: string;
        degree: string;
        catalogYear: string;
        credits?: number;
    }): Promise<void> {
        await ProgramModel.create({
            studentId: params.studentId,
            degree: params.degree,
            catalogYear: params.catalogYear,
            credits: params.credits || 20,
        });
    }
}

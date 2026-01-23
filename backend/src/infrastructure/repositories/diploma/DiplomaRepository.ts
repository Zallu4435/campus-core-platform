import { IDiplomaRepository } from "../../../application/diploma/repositories/IDiplomaRepository";
import { DiplomaProps, EnrollStudentProps, UnenrollStudentProps } from "../../../domain/diploma/types";
import { Diploma as DiplomaModel } from "../../database/mongoose/diploma/diploma.model";
import mongoose from "mongoose";
import { IDiplomaDocument, DiplomaFilter } from "./infraTypes";
import { DiplomaMapper } from "./mappers/DiplomaMapper";
import {
  GetDiplomasRequestDTO
} from "../../../application/diploma/dtos/DiplomaRequestDTOs";
import {
  DIPLOMA_FILTERS,
  DIPLOMA_SORT
} from "../../../application/diploma/constants/DiplomaConstants";

export class DiplomaRepository implements IDiplomaRepository {
  async getDiplomas(params: GetDiplomasRequestDTO) {
    const { page, limit } = params;
    const skip = (page - 1) * limit;
    const filter = this._buildDiplomaFilter(params);

    const [diplomaDocs, totalItems] = await Promise.all([
      DiplomaModel.find(filter)
        .skip(skip)
        .limit(limit)
        .sort(DIPLOMA_SORT.DEFAULT)
        .lean<IDiplomaDocument[]>({ getters: true }),
      DiplomaModel.countDocuments(filter),
    ]);

    return {
      diplomas: DiplomaMapper.toSummaryDTOList(diplomaDocs),
      totalItems
    };
  }

  async getDiplomaById(id: string) {
    const doc = await DiplomaModel.findById(id).lean<IDiplomaDocument>({ getters: true });
    return doc ? DiplomaMapper.toDetailsDTO(doc) : null;
  }

  async createDiploma(diploma: DiplomaProps) {
    const doc = await DiplomaModel.create({ ...diploma, videoIds: [] });
    return DiplomaMapper.toDetailsDTO(doc as unknown as IDiplomaDocument);
  }

  async updateDiploma(diploma: Partial<DiplomaProps> & { id: string }) {
    const doc = await DiplomaModel.findByIdAndUpdate(
      diploma.id,
      { $set: diploma },
      { new: true }
    ).lean<IDiplomaDocument>({ getters: true });
    return doc ? DiplomaMapper.toDetailsDTO(doc) : null;
  }

  async deleteDiploma(id: string) {
    await DiplomaModel.findByIdAndDelete(id);
  }

  async enrollStudent(enrollStudent: EnrollStudentProps) {
    const exists = await DiplomaModel.exists({ _id: enrollStudent.diplomaId });
    if (!exists) return false;

    await DiplomaModel.findByIdAndUpdate(enrollStudent.diplomaId, {
      $addToSet: { students: new mongoose.Types.ObjectId(enrollStudent.studentId) },
    });
    return true;
  }

  async unenrollStudent(unenrollStudent: UnenrollStudentProps) {
    const exists = await DiplomaModel.exists({ _id: unenrollStudent.diplomaId });
    if (!exists) return false;

    await DiplomaModel.findByIdAndUpdate(unenrollStudent.diplomaId, {
      $pull: { students: new mongoose.Types.ObjectId(unenrollStudent.studentId) },
    });
    return true;
  }

  private _buildDiplomaFilter(params: GetDiplomasRequestDTO): DiplomaFilter {
    const { category, department, status, instructor, dateRange, search, startDate, endDate } = params;
    const filter: DiplomaFilter = {};

    let dept = undefined;
    if (category && category !== DIPLOMA_FILTERS.ALL && category !== 'All' && category !== 'All Categories') {
      dept = category
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    } else if (department && department !== DIPLOMA_FILTERS.ALL && department !== 'All' && department !== 'All Categories') {
      dept = department;
    }

    if (dept) {
      filter.category = dept;
    }

    if (status && status !== 'All' && status !== 'all') {
      if (status.toLowerCase() === 'active') filter.status = true;
      else if (status.toLowerCase() === 'inactive') filter.status = false;
    }

    if (instructor && instructor !== 'All' && instructor !== 'all') {
      filter.instructor = instructor;
    }

    if (dateRange && dateRange !== 'All' && dateRange !== 'all') {
      let start: Date | undefined;
      let end: Date | undefined = new Date();

      if (dateRange === 'custom' && startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
      } else {
        const now = new Date();
        switch (dateRange) {
          case 'last_week':
            start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'last_month':
            start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case 'last_3_months':
            start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          default:
            start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        }
      }
      if (start && end) {
        filter.createdAt = { $gte: start, $lte: end };
      }
    }

    if (search && search.trim()) {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    return filter;
  }
}

import { ICoursesRepository } from "../../../application/courses/repositories/ICoursesRepository";
import { CourseModel, EnrollmentModel } from "../../database/mongoose/courses/CourseModel";
import mongoose from "mongoose";
import {
  GetEnrollmentsRequestDTO,
  ApproveEnrollmentRequestDTO,
  RejectEnrollmentRequestDTO,
  GetCourseRequestDetailsRequestDTO,
} from "../../../application/courses/dtos/EnrollmentRequestDTOs";
import {
  GetCoursesRequestDTO,
  CreateCourseRequestDTO,
  UpdateCourseRequestDTO,
  DeleteCourseRequestDTO,
} from "../../../application/courses/dtos/CourseRequestDTOs";
import { BaseRepository } from "../shared/BaseRepository";
import { ICourseDocument, CourseFilter, PopulatedEnrollmentDocument } from "./infraTypes";
import { CourseMapper } from "./mappers/CourseMapper";
import { EnrollmentMapper } from "./mappers/EnrollmentMapper";
import { COURSE_FILTERS, COURSE_SORT, ENROLLMENT_STATUS } from "../../../application/courses/constants/CourseConstants";

import { Course } from "../../../domain/courses/entities/Course";

export class CoursesRepository extends BaseRepository<ICourseDocument, CreateCourseRequestDTO, UpdateCourseRequestDTO, Record<string, unknown>, ICourseDocument> implements ICoursesRepository {
  constructor() {
    super(CourseModel);
  }

  async getCourses(params: GetCoursesRequestDTO) {
    const { page, limit, search } = params;
    const query: CourseFilter = this._buildCourseQuery(params);

    const skip = (page - 1) * limit;
    const courseDocs = await CourseModel.find(query)
      .select("title specialization faculty term credits currentEnrollment maxEnrollment")
      .sort(search ? {} : COURSE_SORT.DEFAULT)
      .skip(skip)
      .limit(limit)
      .lean<ICourseDocument[]>();
    const totalItems = await CourseModel.countDocuments(query);
    const courses = CourseMapper.toSummaryDTOList(courseDocs);
    return { courses, totalItems, page, limit };
  }

  async getCourseById(id: string): Promise<Course | null> {
    const doc = await CourseModel.findById(id).lean<ICourseDocument | null>();
    return doc ? CourseMapper.toDomain(doc) : null;
  }

  async createCourse(params: CreateCourseRequestDTO): Promise<Course> {
    const course = await CourseModel.create(params);
    return CourseMapper.toDomain(course.toObject());
  }

  async updateCourse(params: UpdateCourseRequestDTO): Promise<Course | null> {
    const { id, ...updateData } = params;
    const course = await CourseModel.findByIdAndUpdate(
      id,
      { $set: { ...updateData, updatedAt: new Date() } },
      { new: true }
    ).lean<ICourseDocument | null>();
    return course ? CourseMapper.toDomain(course) : null;
  }

  async deleteCourse(params: DeleteCourseRequestDTO) {
    await CourseModel.findByIdAndDelete(params.id);
  }

  async getEnrollments(params: GetEnrollmentsRequestDTO) {
    const { page, limit } = params;

    // 1. Get Course IDs matching filters first (if any course implementation needed)
    // For simplicity, we can do this inside the builder or separately.
    // The previous logic was complex mixing course query and enrollment query.
    // Let's keep it clean but functional.

    const courseIds = await this._resolveCourseIdsForEnrollment(params);
    if (courseIds !== undefined && courseIds.length === 0) {
      return { enrollments: [], totalItems: 0, page, limit };
    }

    const query = this._buildEnrollmentQuery(params, courseIds);

    const totalItems = await EnrollmentModel.countDocuments(query);
    const skip = (page - 1) * limit;
    const enrollmentDocs = await EnrollmentModel.find(query)
      .sort(COURSE_SORT.DEFAULT)
      .populate("studentId", "email firstName lastName")
      .populate("courseId", "title specialization term faculty credits")
      .select("courseId status requestedAt studentId reason createdAt updatedAt")
      .skip(skip)
      .limit(limit)
      .lean<PopulatedEnrollmentDocument[]>({ getters: true });
    const enrollments = EnrollmentMapper.toDTOList(enrollmentDocs);
    return { enrollments, totalItems, page, limit };
  }

  async approveEnrollment(params: ApproveEnrollmentRequestDTO) {
    await EnrollmentModel.findByIdAndUpdate(params.enrollmentId, { status: "Approved" });
  }

  async rejectEnrollment(params: RejectEnrollmentRequestDTO) {
    await EnrollmentModel.findByIdAndUpdate(params.enrollmentId, { status: "Rejected" });
  }

  async getCourseRequestDetails(params: GetCourseRequestDetailsRequestDTO) {
    if (!mongoose.isValidObjectId(params.id)) {
      return null;
    }
    const enrollment = await EnrollmentModel.findById(params.id)
      .populate({
        path: "studentId",
        select: "firstName lastName email",
      })
      .populate({
        path: "courseId",
        select: "title specialization term faculty credits",
      })
      .lean<PopulatedEnrollmentDocument>({ getters: true });

    return enrollment ? EnrollmentMapper.toDTO(enrollment) : null;
  }

  private _buildCourseQuery(params: GetCoursesRequestDTO): CourseFilter {
    const { specialization, faculty, term, search } = params;
    const query: CourseFilter = {};

    if (specialization && specialization !== COURSE_FILTERS.ALL) {
      const formattedSpecialization = specialization.replace(/_/g, " ");
      query.specialization = {
        $regex: `^${formattedSpecialization.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      };
    }
    if (faculty && faculty !== COURSE_FILTERS.ALL) {
      const formattedFaculty = faculty
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      query.faculty = {
        $regex: `^${formattedFaculty.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      };
    }
    if (term && term !== COURSE_FILTERS.ALL) {
      const formattedTerm = term
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      query.term = {
        $regex: `^${formattedTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      };
    }
    if (search && search.trim()) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { title: { $regex: escapedSearch, $options: "i" } },
        { specialization: { $regex: escapedSearch, $options: "i" } },
        { faculty: { $regex: escapedSearch, $options: "i" } },
      ];
    }
    return query;
  }

  private async _resolveCourseIdsForEnrollment(params: GetEnrollmentsRequestDTO): Promise<string[] | undefined> {
    const { specialization, faculty, term, search } = params;
    if ((specialization && specialization !== "all") || (faculty && faculty !== "all") || (term && term !== "all") || (search && search.trim())) {
      const courseQuery = this._buildCourseQuery(params as any);
      const courses = await CourseModel.find(courseQuery).select("_id").lean();
      return courses.map((course) => course._id.toString());
    }
    return undefined;
  }

  private _buildEnrollmentQuery(params: GetEnrollmentsRequestDTO, courseIds?: string[]): CourseFilter {
    const { status } = params;
    const query: CourseFilter = {};

    if (status && status.toLowerCase() !== "all") {
      query.status = {
        $regex: `^${status.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}$`,
        $options: "i",
      };
    }

    if (courseIds && courseIds.length > 0) {
      query.courseId = { $in: courseIds };
    }

    return query;
  }
}
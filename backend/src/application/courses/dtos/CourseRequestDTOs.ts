import { CourseProps } from '../../../domain/courses/types/CourseTypes';

export interface GetCoursesRequestDTO {
  page: number;
  limit: number;
  specialization?: string;
  faculty?: string;
  term?: string;
  search?: string;
}

export interface GetCourseByIdRequestDTO {
  id: string;
}

export type CreateCourseRequestDTO = Pick<CourseProps, 'title' | 'specialization' | 'faculty' | 'credits' | 'schedule' | 'maxEnrollment' | 'currentEnrollment' | 'description' | 'term' | 'prerequisites'>;

export type UpdateCourseRequestDTO = { id: string } & Partial<Pick<CourseProps, 'title' | 'specialization' | 'faculty' | 'credits' | 'schedule' | 'maxEnrollment' | 'currentEnrollment' | 'description' | 'term' | 'prerequisites'>>;

export interface DeleteCourseRequestDTO {
  id: string;
}
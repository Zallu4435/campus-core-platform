interface PaginatedResponseDTO<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface CourseSummaryDTO {
  id: string;
  title: string;
  specialization: string;
  faculty: string;
  term: string;
  credits: number;
  currentEnrollment: number;
  maxEnrollment: number;
}

export interface GetCoursesResponseDTO extends PaginatedResponseDTO<CourseSummaryDTO> {
  data: CourseSummaryDTO[];
}

export interface CourseDetailsDTO {
  id: string;
  title: string;
  specialization: string;
  faculty: string;
  credits: number;
  schedule: string;
  maxEnrollment: number;
  currentEnrollment: number;
  description?: string;
  term?: string;
  prerequisites?: string[];
}

export interface GetCourseByIdResponseDTO {
  course: CourseDetailsDTO;
}

export interface CreateCourseResponseDTO {
  course: CourseDetailsDTO;
}

export interface UpdateCourseResponseDTO {
  course: CourseDetailsDTO;
}
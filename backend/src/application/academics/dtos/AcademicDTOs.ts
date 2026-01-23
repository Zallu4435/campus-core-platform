export interface GetStudentInfoRequestDTO {
  userId: string;
}

export interface GetStudentInfoResponseDTO {
  name: string;
  id: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  major: string;
  catalogYear: string;
  academicStanding: string;
  advisor: string;
  pendingCredits: number;
  credits: number;
}

export interface GetGradeInfoRequestDTO {
  userId: string;
}

export interface GetGradeInfoResponseDTO {
  cumulativeGPA: string;
  termGPA: string;
  termName: string;
  creditsEarned: string;
  creditsInProgress: string;
}

export interface GetCoursesRequestDTO {
  search?: string;
  page?: number;
  limit?: number;
  userId?: string
}

export interface CourseWithJoined {
  id: string;
  title: string;
  specialization: string;
  faculty: string;
  credits: number;
  term: string;
  maxEnrollment: number;
  currentEnrollment: number;
  createdAt: string;
  schedule?: string;
  description?: string;
  prerequisites?: string[];
  joined: boolean;
}

export interface GetCoursesResponseDTO {
  courses: CourseWithJoined[];
  totalCourses: number;
  totalPages: number;
  currentPage: number;
}

export interface GetAcademicHistoryRequestDTO {
  userId: string;
  startTerm?: string;
  endTerm?: string;
}

export interface AcademicHistoryDTO {
  term: string;
  credits: string;
  gpa: string;
  id: number;
}

export interface GetAcademicHistoryResponseDTO {
  history: AcademicHistoryDTO[];
}

export interface GetProgramInfoRequestDTO {
  userId: string;
}

export interface GetProgramInfoResponseDTO {
  degree: string;
  catalogYear: string;
}

export interface GetProgressInfoRequestDTO {
  userId: string;
}

export interface GetProgressInfoResponseDTO {
  overallProgress: number;
  totalCredits: number;
  completedCredits: number;
  remainingCredits: number;
  estimatedGraduation: string;
}

export interface GetRequirementsInfoRequestDTO {
  userId: string;
}

export interface GetRequirementsInfoResponseDTO {
  core: { percentage: number; completed: number; total: number };
  elective: { percentage: number; completed: number; total: number };
  general: { percentage: number; completed: number; total: number };
}

export interface RegisterCourseRequestDTO {
  studentId: string;
  courseId: string;
  reason?: string;
}

export interface RegisterCourseResponseDTO {
  success: boolean;
  message: string;
  enrollmentId: string;
}

export interface DropCourseRequestDTO {
  studentId: string;
  courseId: string;
}

export interface DropCourseResponseDTO {
  success: boolean;
  message: string;
}

export interface RequestTranscriptRequestDTO {
  studentId: string;
  deliveryMethod: string;
  address?: string;
  email?: string;
}

export interface RequestTranscriptResponseDTO {
  success: boolean;
  message: string;
  requestId: string;
  estimatedDelivery: string;
}

export interface ResponseDTO<T> {
  data: T | { error: string };
  success: boolean;
}

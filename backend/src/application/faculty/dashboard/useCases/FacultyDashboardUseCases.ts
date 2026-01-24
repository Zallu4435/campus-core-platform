import {
  GetFacultyDashboardStatsRequestDTO,
  GetFacultyDashboardDataRequestDTO,
  GetFacultyWeeklyAttendanceRequestDTO,
  GetFacultyCoursePerformanceRequestDTO,
  GetFacultySessionDistributionRequestDTO,
  GetFacultyRecentActivitiesRequestDTO,
} from "../dtos/FacultyDashboardRequestDTOs";
import {
  GetFacultyDashboardStatsResponseDTO,
  GetFacultyDashboardDataResponseDTO,
  GetFacultyWeeklyAttendanceResponseDTO,
  GetFacultyCoursePerformanceResponseDTO,
  GetFacultySessionDistributionResponseDTO,
  GetFacultyRecentActivitiesResponseDTO,
  ResponseDTO
} from "../dtos/FacultyDashboardResponseDTOs";
import { IFacultyDashboardRepository } from "../repositories/IFacultyDashboardRepository";


export interface IGetFacultyDashboardStatsUseCase {
  execute(params: GetFacultyDashboardStatsRequestDTO): Promise<ResponseDTO<GetFacultyDashboardStatsResponseDTO>>;
}

export interface IGetFacultyDashboardDataUseCase {
  execute(params: GetFacultyDashboardDataRequestDTO): Promise<ResponseDTO<GetFacultyDashboardDataResponseDTO>>;
}

export interface IGetFacultyWeeklyAttendanceUseCase {
  execute(params: GetFacultyWeeklyAttendanceRequestDTO): Promise<ResponseDTO<GetFacultyWeeklyAttendanceResponseDTO>>;
}

export interface IGetFacultyCoursePerformanceUseCase {
  execute(params: GetFacultyCoursePerformanceRequestDTO): Promise<ResponseDTO<GetFacultyCoursePerformanceResponseDTO>>;
}

export interface IGetFacultySessionDistributionUseCase {
  execute(params: GetFacultySessionDistributionRequestDTO): Promise<ResponseDTO<GetFacultySessionDistributionResponseDTO>>;
}

export interface IGetFacultyRecentActivitiesUseCase {
  execute(params: GetFacultyRecentActivitiesRequestDTO): Promise<ResponseDTO<GetFacultyRecentActivitiesResponseDTO>>;
}



export class GetFacultyDashboardStatsUseCase implements IGetFacultyDashboardStatsUseCase {
  constructor(private _facultyDashboardRepository: IFacultyDashboardRepository) { }

  async execute(params: GetFacultyDashboardStatsRequestDTO): Promise<ResponseDTO<GetFacultyDashboardStatsResponseDTO>> {
    const stats = await this._facultyDashboardRepository.getDashboardStats(params.facultyId);
    return { data: { stats }, success: true };
  }
}

export class GetFacultyDashboardDataUseCase implements IGetFacultyDashboardDataUseCase {
  constructor(private _facultyDashboardRepository: IFacultyDashboardRepository) { }

  async execute(params: GetFacultyDashboardDataRequestDTO): Promise<ResponseDTO<GetFacultyDashboardDataResponseDTO>> {
    const dashboardData = await this._facultyDashboardRepository.getDashboardData(params.facultyId);
    return { data: { dashboardData }, success: true };
  }
}

export class GetFacultyWeeklyAttendanceUseCase implements IGetFacultyWeeklyAttendanceUseCase {
  constructor(private _facultyDashboardRepository: IFacultyDashboardRepository) { }

  async execute(params: GetFacultyWeeklyAttendanceRequestDTO): Promise<ResponseDTO<GetFacultyWeeklyAttendanceResponseDTO>> {
    const weeklyAttendance = await this._facultyDashboardRepository.getWeeklyAttendance(params.facultyId);
    return { data: { weeklyAttendance }, success: true };
  }
}

export class GetFacultyCoursePerformanceUseCase implements IGetFacultyCoursePerformanceUseCase {
  constructor(private _facultyDashboardRepository: IFacultyDashboardRepository) { }

  async execute(params: GetFacultyCoursePerformanceRequestDTO): Promise<ResponseDTO<GetFacultyCoursePerformanceResponseDTO>> {
    const assignmentPerformance = await this._facultyDashboardRepository.getAssignmentPerformance(params.facultyId);
    return { data: { assignmentPerformance }, success: true };
  }
}

export class GetFacultySessionDistributionUseCase implements IGetFacultySessionDistributionUseCase {
  constructor(private _facultyDashboardRepository: IFacultyDashboardRepository) { }

  async execute(params: GetFacultySessionDistributionRequestDTO): Promise<ResponseDTO<GetFacultySessionDistributionResponseDTO>> {
    const sessionDistribution = await this._facultyDashboardRepository.getSessionDistribution(params.facultyId);
    return { data: { sessionDistribution }, success: true };
  }
}

export class GetFacultyRecentActivitiesUseCase implements IGetFacultyRecentActivitiesUseCase {
  constructor(private _facultyDashboardRepository: IFacultyDashboardRepository) { }

  async execute(params: GetFacultyRecentActivitiesRequestDTO): Promise<ResponseDTO<GetFacultyRecentActivitiesResponseDTO>> {
    const recentActivities = await this._facultyDashboardRepository.getRecentActivities(params.facultyId);
    return { data: { recentActivities }, success: true };
  }
}


import {
  GetDashboardDataRequestDTO,
  GetDashboardMetricsRequestDTO,
  GetUserGrowthDataRequestDTO,
  GetRevenueDataRequestDTO,
  GetPerformanceDataRequestDTO,
  GetRecentActivitiesRequestDTO,
  GetSystemAlertsRequestDTO,
  RefreshDashboardRequestDTO,
} from "../dtos/DashboardRequestDTOs";
import {
  GetDashboardDataResponseDTO,
  GetDashboardMetricsResponseDTO,
  GetUserGrowthDataResponseDTO,
  GetRevenueDataResponseDTO,
  GetRecentActivitiesResponseDTO,
  GetSystemAlertsResponseDTO,
} from "../dtos/DashboardResponseDTOs";
import { PerformanceData, DashboardDataRaw } from '../../../domain/admindashboard/entities/AdminDashboardTypes';

export interface IGetDashboardDataUseCase {
  execute(params: GetDashboardDataRequestDTO): Promise<GetDashboardDataResponseDTO>;
}

export interface IGetDashboardMetricsUseCase {
  execute(params: GetDashboardMetricsRequestDTO): Promise<GetDashboardMetricsResponseDTO>;
}

export interface IGetUserGrowthDataUseCase {
  execute(params: GetUserGrowthDataRequestDTO): Promise<GetUserGrowthDataResponseDTO>;
}

export interface IGetRevenueDataUseCase {
  execute(params: GetRevenueDataRequestDTO): Promise<GetRevenueDataResponseDTO>;
}

export interface IGetPerformanceDataUseCase {
  execute(params: GetPerformanceDataRequestDTO): Promise<PerformanceData[]>;
}

export interface IGetRecentActivitiesUseCase {
  execute(params: GetRecentActivitiesRequestDTO): Promise<GetRecentActivitiesResponseDTO>;
}

export interface IGetSystemAlertsUseCase {
  execute(params: GetSystemAlertsRequestDTO): Promise<GetSystemAlertsResponseDTO>;
}

export interface IRefreshDashboardUseCase {
  execute(params: RefreshDashboardRequestDTO): Promise<DashboardDataRaw>;
}

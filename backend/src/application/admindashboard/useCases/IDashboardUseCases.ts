import {
  GetDashboardDataResponseDTO,
  GetDashboardMetricsResponseDTO,
  GetUserGrowthDataResponseDTO,
  GetRevenueDataResponseDTO,
  GetPerformanceDataResponseDTO,
  GetRecentActivitiesResponseDTO,
  GetSystemAlertsResponseDTO,
  RefreshDashboardResponseDTO,
  DismissAlertResponseDTO,
  MarkActivityAsReadResponseDTO,
  PerformanceData,
} from "../dtos/DashboardResponseDTOs";
import { DashboardDataRaw } from "../types/DashboardRepositoryTypes";

export interface IGetDashboardDataUseCase {
  execute(): Promise<GetDashboardDataResponseDTO>;
}

export interface IGetDashboardMetricsUseCase {
  execute(): Promise<GetDashboardMetricsResponseDTO>;
}

export interface IGetUserGrowthDataUseCase {
  execute(): Promise<GetUserGrowthDataResponseDTO>;
}

export interface IGetRevenueDataUseCase {
  execute(): Promise<GetRevenueDataResponseDTO>;
}

export interface IGetPerformanceDataUseCase {
  execute(): Promise<PerformanceData[]>;
}

export interface IGetRecentActivitiesUseCase {
  execute(): Promise<GetRecentActivitiesResponseDTO>;
}

export interface IGetSystemAlertsUseCase {
  execute(): Promise<GetSystemAlertsResponseDTO>;
}

export interface IRefreshDashboardUseCase {
  execute(): Promise<DashboardDataRaw>;
}

export interface IDismissAlertUseCase {
  execute(alertId: string): Promise<DismissAlertResponseDTO>;
}

export interface IMarkActivityAsReadUseCase {
  execute(activityId: string): Promise<MarkActivityAsReadResponseDTO>;
}


import {
  GetDashboardDataResponseDTO,
  GetDashboardMetricsResponseDTO,
  GetUserGrowthDataResponseDTO,
  GetRevenueDataResponseDTO,
  GetRecentActivitiesResponseDTO,
  GetSystemAlertsResponseDTO,
  PerformanceData,
} from "../dtos/DashboardResponseDTOs";
import { IDashboardRepository } from "../repositories/IDashboardRepository";
import {
  DashboardDataRaw,
} from '../types/DashboardRepositoryTypes';
import {
  DashboardDataNotFoundError,
  DashboardMetricsError,
  DashboardUserGrowthError,
  DashboardRevenueError,
  DashboardPerformanceError,
  DashboardActivitiesError,
  DashboardAlertsError,
} from '../../../domain/admindashboard/errors/DashboardErrors';
import {
  IGetDashboardDataUseCase,
  IGetDashboardMetricsUseCase,
  IGetUserGrowthDataUseCase,
  IGetRevenueDataUseCase,
  IGetPerformanceDataUseCase,
  IGetRecentActivitiesUseCase,
  IGetSystemAlertsUseCase,
  IRefreshDashboardUseCase
} from './IDashboardUseCases';
import { DashboardMapper } from '../../../infrastructure/repositories/admindashboard/DashboardMapper';


export class GetDashboardDataUseCase implements IGetDashboardDataUseCase {
  constructor(private _dashboardRepository: IDashboardRepository) { }

  async execute(): Promise<GetDashboardDataResponseDTO> {
    const raw: DashboardDataRaw = await this._dashboardRepository.getDashboardData();
    if (!raw || !raw.metricsRaw || !raw.userGrowthRaw || !raw.revenueRaw || !raw.performanceRaw || !raw.activitiesRaw || !raw.alertsRaw) {
      throw new DashboardDataNotFoundError();
    }

    return {
      metrics: DashboardMapper.toDashboardMetrics(raw.metricsRaw),
      userGrowth: DashboardMapper.toUserGrowthDataPoints(raw.userGrowthRaw),
      revenue: DashboardMapper.toRevenueDataPoints(raw.revenueRaw),
      performance: DashboardMapper.toPerformanceMetrics(raw.performanceRaw),
      activities: DashboardMapper.toActivityItems(raw.activitiesRaw),
      alerts: DashboardMapper.toSystemAlerts(raw.alertsRaw),
    };
  }
}

export class GetDashboardMetricsUseCase implements IGetDashboardMetricsUseCase {
  constructor(private _dashboardRepository: IDashboardRepository) { }

  async execute(): Promise<GetDashboardMetricsResponseDTO> {
    const raw = await this._dashboardRepository.getDashboardMetrics();
    if (!raw || !Array.isArray(raw.completedPayments)) {
      throw new DashboardMetricsError();
    }
    return DashboardMapper.toDashboardMetrics(raw);
  }
}

export class GetUserGrowthDataUseCase implements IGetUserGrowthDataUseCase {
  constructor(private _dashboardRepository: IDashboardRepository) { }

  async execute(): Promise<GetUserGrowthDataResponseDTO> {
    const raw = await this._dashboardRepository.getUserGrowthData();
    if (!raw || raw.length === 0) {
      throw new DashboardUserGrowthError();
    }
    return DashboardMapper.toUserGrowthDataPoints(raw);
  }
}

export class GetRevenueDataUseCase implements IGetRevenueDataUseCase {
  constructor(private _dashboardRepository: IDashboardRepository) { }

  async execute(): Promise<GetRevenueDataResponseDTO> {
    const raw = await this._dashboardRepository.getRevenueData();
    if (!raw || raw.length === 0) {
      throw new DashboardRevenueError();
    }
    return DashboardMapper.toRevenueDataPoints(raw);
  }
}

export class GetPerformanceDataUseCase implements IGetPerformanceDataUseCase {
  constructor(private _dashboardRepository: IDashboardRepository) { }

  async execute(): Promise<PerformanceData[]> {
    const raw = await this._dashboardRepository.getPerformanceData();
    if (!raw) {
      throw new DashboardPerformanceError();
    }
    return DashboardMapper.toPerformanceMetrics(raw);
  }
}

export class GetRecentActivitiesUseCase implements IGetRecentActivitiesUseCase {
  constructor(private _dashboardRepository: IDashboardRepository) { }

  async execute(): Promise<GetRecentActivitiesResponseDTO> {
    const raw = await this._dashboardRepository.getRecentActivities();
    if (!raw || !raw.recentAdmissions || !raw.recentPayments || !raw.recentEnquiries || !raw.recentNotifications) {
      throw new DashboardActivitiesError();
    }
    return DashboardMapper.toActivityItems(raw);
  }
}

export class GetSystemAlertsUseCase implements IGetSystemAlertsUseCase {
  constructor(private _dashboardRepository: IDashboardRepository) { }

  async execute(): Promise<GetSystemAlertsResponseDTO> {
    const raw = await this._dashboardRepository.getSystemAlerts();
    if (!raw) {
      throw new DashboardAlertsError();
    }
    return DashboardMapper.toSystemAlerts(raw);
  }
}

export class RefreshDashboardUseCase implements IRefreshDashboardUseCase {
  constructor(private _dashboardRepository: IDashboardRepository) { }

  async execute(): Promise<DashboardDataRaw> {
    const raw = await this._dashboardRepository.refreshDashboard();
    if (!raw) {
      throw new DashboardDataNotFoundError();
    }
    return raw;
  }
}

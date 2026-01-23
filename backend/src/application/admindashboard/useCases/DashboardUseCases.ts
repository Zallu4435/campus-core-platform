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
import { IDashboardRepository } from "../repositories/IDashboardRepository";
import {
  PerformanceData,
  DashboardDataRaw,
} from '../../../domain/admindashboard/entities/AdminDashboardTypes';
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

    const metrics = DashboardMapper.toDashboardMetrics(raw.metricsRaw);
    const userGrowth = DashboardMapper.toUserGrowthDataPoints(raw.userGrowthRaw);
    const revenue = DashboardMapper.toRevenueDataPoints(raw.revenueRaw);
    const performance = DashboardMapper.toPerformanceMetrics(raw.performanceRaw);
    const activities = DashboardMapper.toActivityItems(raw.activitiesRaw);
    const alerts = DashboardMapper.toSystemAlerts(raw.alertsRaw);

    return {
      metrics: metrics.toJSON(),
      userGrowth: userGrowth.map(u => u.toJSON()),
      revenue: revenue.map(r => r.toJSON()),
      performance: performance.map(p => p.toJSON()),
      activities: activities.map(a => a.toJSON()),
      alerts: alerts.map(a => a.toJSON()),
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
    const metrics = DashboardMapper.toDashboardMetrics(raw);
    return metrics.toJSON();
  }
}

export class GetUserGrowthDataUseCase implements IGetUserGrowthDataUseCase {
  constructor(private _dashboardRepository: IDashboardRepository) { }

  async execute(): Promise<GetUserGrowthDataResponseDTO> {
    const raw = await this._dashboardRepository.getUserGrowthData();
    if (!raw || raw.length === 0) {
      throw new DashboardUserGrowthError();
    }
    const userGrowth = DashboardMapper.toUserGrowthDataPoints(raw);
    return userGrowth.map(u => u.toJSON());
  }
}

export class GetRevenueDataUseCase implements IGetRevenueDataUseCase {
  constructor(private _dashboardRepository: IDashboardRepository) { }

  async execute(): Promise<GetRevenueDataResponseDTO> {
    const raw = await this._dashboardRepository.getRevenueData();
    if (!raw || raw.length === 0) {
      throw new DashboardRevenueError();
    }
    const revenue = DashboardMapper.toRevenueDataPoints(raw);
    return revenue.map(r => r.toJSON());
  }
}

export class GetPerformanceDataUseCase implements IGetPerformanceDataUseCase {
  constructor(private _dashboardRepository: IDashboardRepository) { }

  async execute(): Promise<PerformanceData[]> {
    const raw = await this._dashboardRepository.getPerformanceData();
    if (!raw) {
      throw new DashboardPerformanceError();
    }
    const performance = DashboardMapper.toPerformanceMetrics(raw);
    return performance.map(p => p.toJSON());
  }
}

export class GetRecentActivitiesUseCase implements IGetRecentActivitiesUseCase {
  constructor(private _dashboardRepository: IDashboardRepository) { }

  async execute(): Promise<GetRecentActivitiesResponseDTO> {
    const raw = await this._dashboardRepository.getRecentActivities();
    if (!raw || !raw.recentAdmissions || !raw.recentPayments || !raw.recentEnquiries || !raw.recentNotifications) {
      throw new DashboardActivitiesError();
    }
    const activities = DashboardMapper.toActivityItems(raw);
    return activities.map(a => a.toJSON());
  }
}

export class GetSystemAlertsUseCase implements IGetSystemAlertsUseCase {
  constructor(private _dashboardRepository: IDashboardRepository) { }

  async execute(): Promise<GetSystemAlertsResponseDTO> {
    const raw = await this._dashboardRepository.getSystemAlerts();
    if (!raw) {
      throw new DashboardAlertsError();
    }
    const alerts = DashboardMapper.toSystemAlerts(raw);
    return alerts.map(a => a.toJSON());
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

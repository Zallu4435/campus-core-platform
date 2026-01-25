import {
  DashboardMetricsRaw,
  UserGrowthDataRaw,
  RevenueDataRaw,
  PerformanceRawData,
  ActivityItemRaw,
  SystemAlertRaw,
  DashboardDataRaw
} from "../types/DashboardRepositoryTypes";

export interface IDashboardRepository {
  getDashboardData(): Promise<DashboardDataRaw>;
  getDashboardMetrics(): Promise<DashboardMetricsRaw>;
  getUserGrowthData(): Promise<UserGrowthDataRaw[]>;
  getRevenueData(): Promise<RevenueDataRaw[]>;
  getPerformanceData(): Promise<PerformanceRawData>;
  getRecentActivities(): Promise<ActivityItemRaw>;
  getSystemAlerts(): Promise<SystemAlertRaw>;
  refreshDashboard(): Promise<DashboardDataRaw>;
}

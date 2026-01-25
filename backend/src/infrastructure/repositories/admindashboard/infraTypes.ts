import {
    DashboardMetricsRaw,
    UserGrowthDataRaw,
    RevenueDataRaw,
    PerformanceRawData,
    ActivityItemRaw,
    SystemAlertRaw
} from "../../../application/admindashboard/types/DashboardRepositoryTypes";

// Re-exporting for strict infrastructure sourcing
export type IDashboardMetricsSource = DashboardMetricsRaw;
export type IUserGrowthDataSource = UserGrowthDataRaw;
export type IRevenueDataSource = RevenueDataRaw;
export type IPerformanceDataSource = PerformanceRawData;
export type IActivityItemSource = ActivityItemRaw;
export type ISystemAlertSource = SystemAlertRaw;

export interface IDashboardSource {
    metricsRaw: IDashboardMetricsSource;
    userGrowthRaw: IUserGrowthDataSource[];
    revenueRaw: IRevenueDataSource[];
    performanceRaw: IPerformanceDataSource;
    activitiesRaw: IActivityItemSource;
    alertsRaw: ISystemAlertSource;
}

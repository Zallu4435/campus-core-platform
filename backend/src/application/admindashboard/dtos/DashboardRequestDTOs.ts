export interface GetDashboardDataRequestDTO {
  // No specific parameters needed for main dashboard data
}

export interface GetDashboardMetricsRequestDTO {
  // No specific parameters needed for metrics
}

export interface GetUserGrowthDataRequestDTO {
  period?: 'monthly' | 'quarterly' | 'yearly';
  startDate?: string;
  endDate?: string;
}

export interface GetRevenueDataRequestDTO {
  period?: 'monthly' | 'quarterly' | 'yearly';
  startDate?: string;
  endDate?: string;
}

export interface GetPerformanceDataRequestDTO {
  // No specific parameters needed for performance data
}

export interface GetRecentActivitiesRequestDTO {
  limit?: number;
  type?: 'all' | 'success' | 'warning' | 'info' | 'error';
}

export interface GetSystemAlertsRequestDTO {
  priority?: 'all' | 'low' | 'medium' | 'high';
  type?: 'all' | 'success' | 'warning' | 'error' | 'info';
}

export interface RefreshDashboardRequestDTO {
  // No specific parameters needed for refresh
}

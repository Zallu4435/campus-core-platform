import { IHttpRequest, IHttpResponse, HttpErrors, HttpSuccess, IAdminDashboardController } from "../IHttp";
import {
  IGetDashboardDataUseCase,
  IGetDashboardMetricsUseCase,
  IGetUserGrowthDataUseCase,
  IGetRevenueDataUseCase,
  IGetPerformanceDataUseCase,
  IGetRecentActivitiesUseCase,
  IGetSystemAlertsUseCase,
  IRefreshDashboardUseCase,
} from "../../../application/admindashboard/useCases/IDashboardUseCases";

export class AdminDashboardController implements IAdminDashboardController {
  private _httpErrors: HttpErrors;
  private _httpSuccess: HttpSuccess;

  constructor(
    private _getDashboardDataUseCase: IGetDashboardDataUseCase,
    private _getDashboardMetricsUseCase: IGetDashboardMetricsUseCase,
    private _getUserGrowthDataUseCase: IGetUserGrowthDataUseCase,
    private _getRevenueDataUseCase: IGetRevenueDataUseCase,
    private _getPerformanceDataUseCase: IGetPerformanceDataUseCase,
    private _getRecentActivitiesUseCase: IGetRecentActivitiesUseCase,
    private _getSystemAlertsUseCase: IGetSystemAlertsUseCase,
    private _refreshDashboardUseCase: IRefreshDashboardUseCase,

  ) {
    this._httpErrors = new HttpErrors();
    this._httpSuccess = new HttpSuccess();
  }

  async getDashboardData(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const data = await this._getDashboardDataUseCase.execute({});
    return this._httpSuccess.success_200(data);
  }

  async getDashboardMetrics(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const data = await this._getDashboardMetricsUseCase.execute({});
    return this._httpSuccess.success_200(data);
  }

  async getUserGrowthData(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { period, startDate, endDate } = httpRequest.query || {};
    const data = await this._getUserGrowthDataUseCase.execute({
      period: period ? String(period) as 'monthly' | 'quarterly' | 'yearly' : undefined,
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
    });
    return this._httpSuccess.success_200(data);
  }

  async getRevenueData(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { period, startDate, endDate } = httpRequest.query || {};
    const data = await this._getRevenueDataUseCase.execute({
      period: period ? String(period) as 'monthly' | 'quarterly' | 'yearly' : undefined,
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
    });
    return this._httpSuccess.success_200(data);
  }

  async getPerformanceData(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const data = await this._getPerformanceDataUseCase.execute({});
    return this._httpSuccess.success_200(data);
  }

  async getRecentActivities(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { limit, type } = httpRequest.query || {};
    const data = await this._getRecentActivitiesUseCase.execute({
      limit: limit ? Number(limit) : undefined,
      type: type ? String(type) as 'all' | 'success' | 'warning' | 'info' | 'error' : undefined,
    });
    return this._httpSuccess.success_200(data);
  }

  async getSystemAlerts(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { priority, type } = httpRequest.query || {};
    const data = await this._getSystemAlertsUseCase.execute({
      priority: priority ? String(priority) as 'all' | 'low' | 'medium' | 'high' : undefined,
      type: type ? String(type) as 'all' | 'success' | 'warning' | 'error' | 'info' : undefined,
    });
    return this._httpSuccess.success_200(data);
  }

  async refreshDashboard(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const data = await this._refreshDashboardUseCase.execute({});
    return this._httpSuccess.success_200(data);
  }

} 
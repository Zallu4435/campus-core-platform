import { IHttpRequest, IHttpResponse } from "../IHttp";
import {
  IGetSiteSectionsUseCase,
  IGetSiteSectionByIdUseCase,
  ICreateSiteSectionUseCase,
  IUpdateSiteSectionUseCase,
  IDeleteSiteSectionUseCase
} from "../../../application/site-management/useCases/ISiteSectionUseCases";
import { SITE_MANAGEMENT_CONSTANTS } from "../../../application/site-management/constants/SiteManagementConstants";
import { HttpSuccess, HttpErrors } from "../../http/IHttp";
import { SiteSectionKey } from "../../../domain/site-management/entities/SiteSectionTypes";

export class SiteSectionController {
  private _httpSuccess: HttpSuccess;
  private _httpErrors: HttpErrors;

  constructor(
    private readonly _getSiteSectionsUseCase: IGetSiteSectionsUseCase,
    private readonly _getSiteSectionByIdUseCase: IGetSiteSectionByIdUseCase,
    private readonly _createSiteSectionUseCase: ICreateSiteSectionUseCase,
    private readonly _updateSiteSectionUseCase: IUpdateSiteSectionUseCase,
    private readonly _deleteSiteSectionUseCase: IDeleteSiteSectionUseCase
  ) {
    this._httpSuccess = new HttpSuccess();
    this._httpErrors = new HttpErrors();
  }

  async getSections(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const {
      sectionKey,
      page = SITE_MANAGEMENT_CONSTANTS.DEFAULT_QUERY_PARAMS.PAGE,
      limit = SITE_MANAGEMENT_CONSTANTS.DEFAULT_QUERY_PARAMS.LIMIT,
      search,
      category,
      dateRange,
      startDate,
      endDate,
      status
    } = httpRequest.query;

    const result = await this._getSiteSectionsUseCase.execute({
      sectionKey: sectionKey as SiteSectionKey,
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      category: category as string,
      dateRange: dateRange as string,
      startDate: startDate as string,
      endDate: endDate as string,
      status: status as string,
    });

    if (!result.success) {
      return this._httpErrors.error_400();
    }
    return this._httpSuccess.success_200(result.data);
  }

  async getSectionById(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params;
    const result = await this._getSiteSectionByIdUseCase.execute({ id });
    if (!result.success) {
      return this._httpErrors.error_404();
    }
    return this._httpSuccess.success_200(result.data);
  }

  async createSection(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const result = await this._createSiteSectionUseCase.execute({
      ...httpRequest.body,
      image: httpRequest.file?.path
    });

    if (!result.success) {
      return this._httpErrors.error_400();
    }
    return this._httpSuccess.success_201(result.data);
  }

  async updateSection(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params;
    const result = await this._updateSiteSectionUseCase.execute({
      id,
      ...httpRequest.body,
      image: httpRequest.file?.path || httpRequest.body.image
    });

    if (!result.success) {
      return this._httpErrors.error_400();
    }
    return this._httpSuccess.success_200(result.data);
  }

  async deleteSection(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params;
    const result = await this._deleteSiteSectionUseCase.execute({ id });
    if (!result.success) {
      return this._httpErrors.error_400();
    }
    return this._httpSuccess.success_200(null);
  }
}

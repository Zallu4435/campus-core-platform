import { IHttpRequest, IHttpResponse, HttpSuccess, HttpErrors } from "../IHttp";
import { IGetUserSiteSectionsUseCase } from "../../../application/site-management/useCases/IUserSiteSectionUseCases";
import { SITE_MANAGEMENT_CONSTANTS } from "../../../application/site-management/constants/SiteManagementConstants";
import { SiteSectionKey } from "../../../domain/site-management/entities/SiteSectionTypes";

export class UserSiteSectionController {
  private _httpSuccess: HttpSuccess;
  private _httpErrors: HttpErrors;

  constructor(
    private readonly _getUserSiteSectionsUseCase: IGetUserSiteSectionsUseCase
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
      category
    } = httpRequest.query;

    if (!sectionKey) {
      return this._httpErrors.error_400("Section key is required");
    }

    const result = await this._getUserSiteSectionsUseCase.execute({
      sectionKey: sectionKey as SiteSectionKey,
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      category: category as string,
    });

    if (!result.success) {
      return this._httpErrors.error_400();
    }
    return this._httpSuccess.success_200(result.data);
  }
} 
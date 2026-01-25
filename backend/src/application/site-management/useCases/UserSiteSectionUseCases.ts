import { GetUserSiteSectionsRequestDTO, GetUserSiteSectionsResponseDTO, UserSiteSectionDTO } from "../dtos/UserSiteSectionDTOs";
import { SiteSectionFilter } from "../../../domain/site-management/entities/SiteSectionTypes";
import { IUserSiteSectionRepository } from "../repositories/IUserSiteSectionRepository";
import { IGetUserSiteSectionsUseCase } from "./IUserSiteSectionUseCases";
import { SITE_MANAGEMENT_CONSTANTS } from "../constants/SiteManagementConstants";
import { SiteSectionMapper } from "../../../infrastructure/repositories/site-management/mappers/SiteSectionMapper";

export class GetUserSiteSectionsUseCase implements IGetUserSiteSectionsUseCase {
  constructor(private readonly _userSiteSectionRepository: IUserSiteSectionRepository) { }

  async execute(params: GetUserSiteSectionsRequestDTO): Promise<{ success: boolean; data: GetUserSiteSectionsResponseDTO }> {
    const {
      sectionKey,
      page = SITE_MANAGEMENT_CONSTANTS.DEFAULT_QUERY_PARAMS.PAGE,
      limit = SITE_MANAGEMENT_CONSTANTS.DEFAULT_QUERY_PARAMS.LIMIT,
      search,
      category
    } = params;

    const filter: SiteSectionFilter = { sectionKey };

    if (search && search.trim() !== '') {
      filter.search = search.trim();
    }

    if (category && category.trim() !== '' && category !== SITE_MANAGEMENT_CONSTANTS.DEFAULT_QUERY_PARAMS.CATEGORY) {
      filter.category = category;
    }

    const skip = (page - 1) * limit;
    const [docs, total, categories] = await Promise.all([
      this._userSiteSectionRepository.findSectionsRaw(filter, skip, limit),
      this._userSiteSectionRepository.countSectionsRaw(filter),
      this._userSiteSectionRepository.getDistinctCategories(sectionKey),
    ]);

    return {
      success: true,
      data: {
        sections: docs.map((doc) => SiteSectionMapper.toDTO(doc) as unknown as UserSiteSectionDTO),
        categories,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
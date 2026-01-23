import { GetUserSiteSectionsRequestDTO, GetUserSiteSectionsResponseDTO } from "../dtos/UserSiteSectionDTOs";
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

    const query: SiteSectionFilter = { sectionKey };

    if (search && search.trim() !== '') {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ];
    }

    if (category && category.trim() !== '' && category !== SITE_MANAGEMENT_CONSTANTS.DEFAULT_QUERY_PARAMS.CATEGORY) {
      query.category = category;
    }

    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      this._userSiteSectionRepository.findSectionsRaw(query, skip, limit),
      this._userSiteSectionRepository.countSectionsRaw(query),
    ]);

    return {
      success: true,
      data: {
        sections: docs.map((doc) => SiteSectionMapper.docToDTO(doc)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
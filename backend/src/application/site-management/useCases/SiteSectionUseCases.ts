import {
  GetSiteSectionsRequestDTO,
  GetSiteSectionByIdRequestDTO,
  CreateSiteSectionRequestDTO,
  UpdateSiteSectionRequestDTO,
  DeleteSiteSectionRequestDTO,
  GetSiteSectionsResponseDTO,
  GetSiteSectionByIdResponseDTO,
  CreateSiteSectionResponseDTO,
  UpdateSiteSectionResponseDTO,
} from "../dtos/SiteSectionDTOs";
import { ISiteSectionRepository } from "../repositories/ISiteSectionRepository";
import { SiteSectionFilter } from '../../../domain/site-management/entities/SiteSectionTypes';
import { InvalidSectionKeyError, InvalidHighlightError, InvalidVagoNowError, InvalidLeadershipError, SiteSectionNotFoundError } from '../../../domain/site-management/errors/SiteSectionErrors';
import { ICreateSiteSectionUseCase, IDeleteSiteSectionUseCase, IGetSiteSectionByIdUseCase, IGetSiteSectionsUseCase, IUpdateSiteSectionUseCase } from './ISiteSectionUseCases';
import { SITE_MANAGEMENT_CONSTANTS } from "../constants/SiteManagementConstants";
import { SiteSectionMapper } from "../../../infrastructure/repositories/site-management/mappers/SiteSectionMapper";

export class GetSiteSectionsUseCase implements IGetSiteSectionsUseCase {
  constructor(private readonly _siteSectionRepository: ISiteSectionRepository) { }

  async execute(params: GetSiteSectionsRequestDTO): Promise<{ success: boolean; data: GetSiteSectionsResponseDTO }> {
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
    } = params;

    const filter: SiteSectionFilter = {};

    if (sectionKey) filter.sectionKey = sectionKey;

    if (search && search.trim()) {
      filter.search = search.trim();
    }

    if (category && category !== SITE_MANAGEMENT_CONSTANTS.DEFAULT_QUERY_PARAMS.CATEGORY && category !== 'All Categories') {
      filter.category = category;
    }

    if (status && status !== SITE_MANAGEMENT_CONSTANTS.DEFAULT_QUERY_PARAMS.STATUS) {
      if (status === 'active') {
        filter.isActive = true;
      } else if (status === 'inactive') {
        filter.isActive = false;
      }
    }

    if (dateRange && dateRange !== SITE_MANAGEMENT_CONSTANTS.DEFAULT_QUERY_PARAMS.DATE_RANGE) {
      const now = new Date();
      let startDateFilter: Date;
      let endDateFilter: Date;

      switch (dateRange) {
        case 'last_week':
          startDateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          endDateFilter = now;
          break;
        case 'last_month':
          startDateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          endDateFilter = now;
          break;
        case 'last_3_months':
          startDateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          endDateFilter = now;
          break;
        case 'custom':
          if (startDate && endDate) {
            startDateFilter = new Date(startDate);
            endDateFilter = new Date(endDate);
            endDateFilter.setHours(23, 59, 59, 999);
          } else {
            startDateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            endDateFilter = now;
          }
          break;
        default:
          startDateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          endDateFilter = now;
      }

      filter.startDate = startDateFilter;
      filter.endDate = endDateFilter;
    }

    const skip = (page - 1) * limit;
    const allDocs = await this._siteSectionRepository.getSections(filter);

    const sortedDocs = allDocs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = sortedDocs.length;
    const pagedDocs = sortedDocs.slice(skip, skip + limit);

    return {
      success: true,
      data: {
        sections: pagedDocs.map((doc) => SiteSectionMapper.toDTO(doc)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export class GetSiteSectionByIdUseCase implements IGetSiteSectionByIdUseCase {
  constructor(private readonly _siteSectionRepository: ISiteSectionRepository) { }

  async execute(params: GetSiteSectionByIdRequestDTO): Promise<{ success: boolean; data: GetSiteSectionByIdResponseDTO | null }> {
    const doc = await this._siteSectionRepository.getSectionById(params.id);
    if (!doc) {
      return { success: false, data: null };
    }
    return {
      success: true,
      data: { section: SiteSectionMapper.toDTO(doc) }
    };
  }
}

export class CreateSiteSectionUseCase implements ICreateSiteSectionUseCase {
  constructor(private readonly siteSectionRepository: ISiteSectionRepository) { }

  async execute(params: CreateSiteSectionRequestDTO): Promise<{ success: boolean; data: CreateSiteSectionResponseDTO }> {
    if (!params.sectionKey) throw new InvalidSectionKeyError();

    if (params.sectionKey === SITE_MANAGEMENT_CONSTANTS.SECTION_KEYS.HIGHLIGHTS && (!params.title || !params.description)) {
      throw new InvalidHighlightError();
    }
    if (params.sectionKey === SITE_MANAGEMENT_CONSTANTS.SECTION_KEYS.VAGO_NOW && (!params.title || !('content' in params) || !params.content)) {
      throw new InvalidVagoNowError();
    }
    if (params.sectionKey === SITE_MANAGEMENT_CONSTANTS.SECTION_KEYS.LEADERSHIP && (!params.title || !('position' in params) || !params.position)) {
      throw new InvalidLeadershipError();
    }

    const doc = await this.siteSectionRepository.createSection(params);
    return { success: true, data: { section: SiteSectionMapper.toDTO(doc) } };
  }
}

export class UpdateSiteSectionUseCase implements IUpdateSiteSectionUseCase {
  constructor(private readonly _siteSectionRepository: ISiteSectionRepository) { }

  async execute(params: UpdateSiteSectionRequestDTO): Promise<{ success: boolean; data: UpdateSiteSectionResponseDTO | null }> {
    const doc = await this._siteSectionRepository.updateSection(params);
    if (!doc) {
      return { success: false, data: null };
    }
    return {
      success: true,
      data: { section: SiteSectionMapper.toDTO(doc) }
    };
  }
}

export class DeleteSiteSectionUseCase implements IDeleteSiteSectionUseCase {
  constructor(private readonly _siteSectionRepository: ISiteSectionRepository) { }

  async execute(params: DeleteSiteSectionRequestDTO): Promise<{ success: boolean; data: void }> {
    const doc = await this._siteSectionRepository.getSectionById(params.id);
    if (!doc) {
      throw new SiteSectionNotFoundError(params.id);
    }
    await this._siteSectionRepository.deleteSection(params);
    return { success: true, data: undefined };
  }
}
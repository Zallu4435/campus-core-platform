import { IUserMaterialsRepository } from '../repositories/IUserMaterialsRepository';
import {
  GetUserMaterialsRequestDTO,
  GetUserMaterialByIdRequestDTO,
  ToggleBookmarkRequestDTO,
  ToggleLikeRequestDTO,
  DownloadMaterialRequestDTO
} from '../dtos/UserMaterialRequestDTOs';
import {
  GetUserMaterialsResponseDTO,
  GetUserMaterialByIdResponseDTO,
} from '../dtos/UserMaterialResponseDTOs';
import { MaterialValidationError, MaterialNotFoundError } from '../../../domain/materials/errors/MaterialErrors';
import { MATERIAL_CONSTANTS } from '../constants/MaterialConstants';
import { UserMaterialFilter, MaterialSortOptions } from '../../../domain/materials/entities/MaterialTypes';
import {
  IGetUserMaterialsUseCase,
  IGetUserMaterialByIdUseCase,
  IToggleBookmarkUseCase,
  IToggleLikeUseCase,
  IDownloadMaterialUseCase
} from './IUserMaterialUseCases';

export class GetUserMaterialsUseCase implements IGetUserMaterialsUseCase {
  constructor(private _repo: IUserMaterialsRepository) { }

  async execute(params: GetUserMaterialsRequestDTO): Promise<GetUserMaterialsResponseDTO> {
    const {
      page = MATERIAL_CONSTANTS.PAGINATION.DEFAULT_PAGE,
      limit = MATERIAL_CONSTANTS.PAGINATION.DEFAULT_LIMIT,
      userId,
      subject,
      course,
      semester,
      type,
      difficulty,
      search,
      sortBy,
      sortOrder
    } = params;

    const filter: UserMaterialFilter = {
      subject,
      course,
      semester,
      type,
      difficulty,
      search,
    };

    const skip = (page - 1) * limit;
    const sort: MaterialSortOptions = sortBy ? { [sortBy]: sortOrder === 'desc' ? -1 : 1 } : { updatedAt: -1 };

    const materials = await this._repo.find(filter, { skip, limit, sort });
    const total = await this._repo.count(filter);

    const materialsWithStatus = await Promise.all(materials.map(async (m) => {
      const isBookmarked = await this._repo.isBookmarked(userId, m.id!);
      const isLiked = await this._repo.isLiked(userId, m.id!);
      return {
        ...m.toJSON(),
        isBookmarked,
        isLiked
      };
    }));

    return {
      materials: materialsWithStatus,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      bookmarkedMaterials: [],
      likedMaterials: []
    };
  }
}

export class GetUserMaterialByIdUseCase implements IGetUserMaterialByIdUseCase {
  constructor(private _repo: IUserMaterialsRepository) { }

  async execute(params: GetUserMaterialByIdRequestDTO): Promise<GetUserMaterialByIdResponseDTO> {
    const material = await this._repo.findById(params.id);
    if (!material) throw new MaterialNotFoundError(params.id);

    const isBookmarked = await this._repo.isBookmarked(params.userId, params.id);
    const isLiked = await this._repo.isLiked(params.userId, params.id);

    return {
      material: {
        ...material.toJSON(),
        isBookmarked,
        isLiked
      },
      totalPages: 1,
      bookmarkedMaterials: [],
      likedMaterials: []
    };
  }
}

export class ToggleBookmarkUseCase implements IToggleBookmarkUseCase {
  constructor(private _repo: IUserMaterialsRepository) { }

  async execute(params: ToggleBookmarkRequestDTO): Promise<void> {
    if (!params.id || !params.userId) throw new MaterialValidationError('Material ID and User ID are required');
    await this._repo.toggleBookmark(params.id, params.userId);
  }
}

export class ToggleLikeUseCase implements IToggleLikeUseCase {
  constructor(private _repo: IUserMaterialsRepository) { }

  async execute(params: ToggleLikeRequestDTO): Promise<void> {
    if (!params.id || !params.userId) throw new MaterialValidationError('Material ID and User ID are required');
    await this._repo.toggleLike(params.id, params.userId);
  }
}

export class DownloadMaterialUseCase implements IDownloadMaterialUseCase {
  constructor(private _repo: IUserMaterialsRepository) { }

  async execute(params: DownloadMaterialRequestDTO): Promise<string> {
    const material = await this._repo.findById(params.id);
    if (!material) throw new MaterialNotFoundError(params.id);

    await this._repo.incrementDownloads(params.id, params.userId);
    return material.fileUrl;
  }
}

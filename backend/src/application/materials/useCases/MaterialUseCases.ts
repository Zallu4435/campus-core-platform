import { IMaterialsRepository } from '../repositories/IMaterialsRepository';
import {
  GetMaterialsRequestDTO,
  GetMaterialByIdRequestDTO,
  CreateMaterialRequestDTO,
  UpdateMaterialRequestDTO,
  DeleteMaterialRequestDTO
} from '../dtos/MaterialRequestDTOs';
import {
  GetMaterialsResponseDTO,
  GetMaterialByIdResponseDTO,
  CreateMaterialResponseDTO,
  UpdateMaterialResponseDTO
} from '../dtos/MaterialResponseDTOs';
import { Material } from '../../../domain/materials/entities/Material';
import { MaterialFilter, MaterialSortOptions } from '../../../domain/materials/entities/MaterialTypes';
import { MaterialNotFoundError, MaterialValidationError } from '../../../domain/materials/errors/MaterialErrors';
import { MATERIAL_CONSTANTS } from '../constants/MaterialConstants';
import {
  IGetMaterialsUseCase,
  IGetMaterialByIdUseCase,
  ICreateMaterialUseCase,
  IUpdateMaterialUseCase,
  IDeleteMaterialUseCase
} from './IMaterialUseCases';
import { IStorageService } from '../../../application/shared/services/IStorageService';
import Logger from '../../../shared/utils/logger';

export class GetMaterialsUseCase implements IGetMaterialsUseCase {
  constructor(private _repo: IMaterialsRepository) { }

  async execute(params: GetMaterialsRequestDTO): Promise<GetMaterialsResponseDTO> {
    const {
      page = MATERIAL_CONSTANTS.PAGINATION.DEFAULT_PAGE,
      limit = MATERIAL_CONSTANTS.PAGINATION.DEFAULT_LIMIT,
      subject,
      course,
      semester,
      search,
      status,
      dateRange,
      startDate,
      endDate
    } = params;

    const filter: MaterialFilter = {
      subject: (subject && !MATERIAL_CONSTANTS.SUBJECTS.ALL.includes(subject)) ? subject : undefined,
      course: (course && !MATERIAL_CONSTANTS.COURSES.ALL.includes(course)) ? course : undefined,
      semester,
      search,
    };

    if (status && status !== 'all') {
      filter.isRestricted = status === 'restricted';
    }

    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let start: Date;
      let end: Date = now;

      switch (dateRange) {
        case MATERIAL_CONSTANTS.DATE_RANGES.LAST_WEEK:
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case MATERIAL_CONSTANTS.DATE_RANGES.LAST_MONTH:
          start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case MATERIAL_CONSTANTS.DATE_RANGES.LAST_3_MONTHS:
          start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case MATERIAL_CONSTANTS.DATE_RANGES.CUSTOM:
          if (startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
          } else {
            start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          }
          break;
        default:
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
      filter.startDate = start;
      filter.endDate = end;
    }

    const skip = (page - 1) * limit;
    const sort: MaterialSortOptions = { updatedAt: -1 };

    const materials = await this._repo.find(filter, { skip, limit, sort });
    const total = await this._repo.count(filter);
    const totalPages = Math.ceil(total / limit);

    return {
      materials: materials.map(m => m.toJSON()),
      totalPages,
    };
  }
}

export class GetMaterialByIdUseCase implements IGetMaterialByIdUseCase {
  constructor(private _repo: IMaterialsRepository) { }
  async execute(params: GetMaterialByIdRequestDTO): Promise<GetMaterialByIdResponseDTO | null> {
    if (!params.id) throw new MaterialValidationError('Material ID is required');
    const material = await this._repo.findById(params.id);
    if (!material) throw new MaterialNotFoundError(params.id);

    await this._repo.incrementViews(params.id);

    return { material: material.toJSON() };
  }
}

export class CreateMaterialUseCase implements ICreateMaterialUseCase {
  constructor(
    private _repo: IMaterialsRepository,
    private _storageService: IStorageService
  ) { }

  async execute(params: CreateMaterialRequestDTO): Promise<CreateMaterialResponseDTO> {
    try {
      const material = Material.create(params);
      const dbResult = await this._repo.create(material);
      return { material: dbResult.toJSON() };
    } catch (error) {
      // Cleanup: If DB creation fails, delete uploaded files if they exist
      if (params.fileUrl) {
        Logger.warn(`⚠️ DB Creation failed for material. Deleting uploaded file: ${params.fileUrl}`);
        await this._storageService.deleteFile(params.fileUrl);
      }
      if (params.thumbnailUrl && params.thumbnailUrl !== params.fileUrl) {
        Logger.warn(`⚠️ DB Creation failed for material. Deleting uploaded thumbnail: ${params.thumbnailUrl}`);
        await this._storageService.deleteFile(params.thumbnailUrl);
      }
      throw error;
    }
  }
}

export class UpdateMaterialUseCase implements IUpdateMaterialUseCase {
  constructor(
    private _repo: IMaterialsRepository,
    private _storageService: IStorageService
  ) { }

  async execute(params: UpdateMaterialRequestDTO): Promise<UpdateMaterialResponseDTO | null> {
    if (!params.id) throw new MaterialValidationError('Material ID is required');

    const existingMaterial = await this._repo.findById(params.id);
    if (!existingMaterial) throw new MaterialNotFoundError(params.id);

    const { id, ...updateData } = params;

    // Identify if new files are being uploaded
    const newFileUrl = updateData.fileUrl && updateData.fileUrl !== existingMaterial.fileUrl ? updateData.fileUrl : null;
    const newThumbnailUrl = updateData.thumbnailUrl && updateData.thumbnailUrl !== existingMaterial.thumbnailUrl ? updateData.thumbnailUrl : null;

    try {
      const updatedMaterial = Material.update(existingMaterial.props, updateData);
      const dbResult = await this._repo.update(params.id, updatedMaterial);

      if (!dbResult) throw new MaterialNotFoundError(params.id);

      // Success: Delete OLD files if they were replaced
      if (newFileUrl && existingMaterial.fileUrl) {
        Logger.info('🗑️ Deleting old material file after update...');
        await this._storageService.deleteFile(existingMaterial.fileUrl);
      }
      if (newThumbnailUrl && existingMaterial.thumbnailUrl) {
        Logger.info('🗑️ Deleting old material thumbnail after update...');
        await this._storageService.deleteFile(existingMaterial.thumbnailUrl);
      }

      return { material: dbResult.toJSON() };

    } catch (error) {
      // Failure: Delete NEW files if DB update failed
      if (newFileUrl) {
        Logger.warn('⚠️ DB Update failed. Deleting newly uploaded file...');
        await this._storageService.deleteFile(newFileUrl);
      }
      if (newThumbnailUrl) {
        Logger.warn('⚠️ DB Update failed. Deleting newly uploaded thumbnail...');
        await this._storageService.deleteFile(newThumbnailUrl);
      }
      throw error;
    }
  }
}

export class DeleteMaterialUseCase implements IDeleteMaterialUseCase {
  constructor(
    private _repo: IMaterialsRepository,
    private _storageService: IStorageService
  ) { }

  async execute(params: DeleteMaterialRequestDTO): Promise<void> {
    if (!params.id) throw new MaterialValidationError('Material ID is required');
    const material = await this._repo.findById(params.id);
    if (!material) throw new MaterialNotFoundError(params.id);

    await this._repo.delete(params.id);

    // Post-delete cleanup
    if (material.fileUrl) {
      await this._storageService.deleteFile(material.fileUrl);
    }
    if (material.thumbnailUrl) {
      await this._storageService.deleteFile(material.thumbnailUrl);
    }
  }
}
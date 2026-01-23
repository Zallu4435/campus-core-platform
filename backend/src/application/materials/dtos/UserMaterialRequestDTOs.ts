import { MaterialType, MaterialDifficulty, MaterialProps, CreateMaterialProps, UpdateMaterialProps } from "../../../domain/materials/entities/MaterialTypes";

export interface GetUserMaterialsRequestDTO {
  userId: string;
  subject?: string;
  course?: string;
  semester?: number;
  type?: string;
  difficulty?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface GetUserMaterialByIdRequestDTO {
  userId: string;
  id: string;
}

export type ToggleBookmarkRequestDTO = Pick<GetUserMaterialByIdRequestDTO, 'userId' | 'id'>;
export type ToggleLikeRequestDTO = Pick<GetUserMaterialByIdRequestDTO, 'userId' | 'id'>;
export type DownloadMaterialRequestDTO = Pick<GetUserMaterialByIdRequestDTO, 'userId' | 'id'>; 
import { MaterialType, MaterialDifficulty, MaterialProps, CreateMaterialProps, UpdateMaterialProps } from "../../../domain/materials/entities/MaterialTypes";

export interface GetMaterialsRequestDTO {
  subject?: string;
  course?: string;
  semester?: number;
  search?: string;
  status?: string;
  dateRange?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}
export interface GetMaterialByIdRequestDTO { id: string; }
export type CreateMaterialRequestDTO = CreateMaterialProps;
export type UpdateMaterialRequestDTO = UpdateMaterialProps;
export interface DeleteMaterialRequestDTO { id: string; } 
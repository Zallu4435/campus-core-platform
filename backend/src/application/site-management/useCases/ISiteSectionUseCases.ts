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

export interface IGetSiteSectionsUseCase {
  execute(params: GetSiteSectionsRequestDTO): Promise<{ success: boolean; data: GetSiteSectionsResponseDTO }>;
}

export interface IGetSiteSectionByIdUseCase {
  execute(params: GetSiteSectionByIdRequestDTO): Promise<{ success: boolean; data: GetSiteSectionByIdResponseDTO | null }>;
}

export interface ICreateSiteSectionUseCase {
  execute(params: CreateSiteSectionRequestDTO): Promise<{ success: boolean; data: CreateSiteSectionResponseDTO }>;
}

export interface IUpdateSiteSectionUseCase {
  execute(params: UpdateSiteSectionRequestDTO): Promise<{ success: boolean; data: UpdateSiteSectionResponseDTO | null }>;
}

export interface IDeleteSiteSectionUseCase {
  execute(params: DeleteSiteSectionRequestDTO): Promise<{ success: boolean; data: void }>;
}



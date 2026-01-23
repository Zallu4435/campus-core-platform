import { GetUserSiteSectionsRequestDTO, GetUserSiteSectionsResponseDTO } from "../dtos/UserSiteSectionDTOs";

export interface IGetUserSiteSectionsUseCase {
  execute(params: GetUserSiteSectionsRequestDTO): Promise<{ success: boolean; data: GetUserSiteSectionsResponseDTO }>;
}

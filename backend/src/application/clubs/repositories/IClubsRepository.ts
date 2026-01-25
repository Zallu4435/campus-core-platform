import {
  GetClubsRequestDTO,
  CreateClubRequestDTO,
  UpdateClubRequestDTO,
  GetClubRequestsRequestDTO,
  GetClubRequestDetailsRequestDTO,
} from "../dtos/ClubRequestDTOs";
import {
  GetClubsResponseDTO,
  GetClubRequestsResponseDTO,
  GetClubRequestDetailsResponseDTO
} from "../dtos/ClubResponseDTOs";
import { ClubDataDTO } from "../dtos/ClubBaseDTOs";
import { IBaseRepository } from "../../repositories/IBaseRepository";
import { ClubData, ClubRequestStatus } from "../../../domain/clubs/entities/ClubTypes";

export interface IClubsRepository extends
  IBaseRepository<ClubData, CreateClubRequestDTO, Partial<ClubDataDTO>, Record<string, unknown>, ClubData> {

  getClubs(params: GetClubsRequestDTO): Promise<GetClubsResponseDTO>;
  getClubRequests(params: GetClubRequestsRequestDTO): Promise<GetClubRequestsResponseDTO>;
  updateClubRequestStatus(id: string, status: ClubRequestStatus): Promise<void>;
  incrementClubMembers(clubId: string): Promise<void>;
  getClubRequestDetails(params: GetClubRequestDetailsRequestDTO): Promise<GetClubRequestDetailsResponseDTO>;
}
import {
  GetSportsRequestDTO,
  CreateSportRequestDTO,
  GetSportRequestsRequestDTO,
  GetSportRequestDetailsRequestDTO,
} from "../dtos/SportRequestDTOs";
import {
  GetSportsResponseDTO,
  GetSportRequestsResponseDTO,
  GetSportRequestDetailsResponseDTO
} from "../dtos/SportResponseDTOs";
import { SportDataDTO, SportRequestDataDTO } from "../dtos/SportBaseDTOs";
import { IBaseRepository } from "../../repositories/IBaseRepository";
import { Sport, SportRequestStatus } from "../../../domain/sports/entities/SportTypes";

export interface ISportsRepository extends
  IBaseRepository<Sport, CreateSportRequestDTO, Partial<SportDataDTO>, Record<string, unknown>, Sport> {

  getSports(params: GetSportsRequestDTO): Promise<GetSportsResponseDTO>;
  getSportRequests(params: GetSportRequestsRequestDTO): Promise<GetSportRequestsResponseDTO>;
  updateSportRequestStatus(id: string, status: SportRequestStatus): Promise<void>;
  incrementSportParticipants(sportId: string): Promise<void>;
  getSportRequestDetails(params: GetSportRequestDetailsRequestDTO): Promise<GetSportRequestDetailsResponseDTO>;
  sendRequestApprovalNotification(type: string, id: string, userId: string, title: string): Promise<void>;
  sendRequestRejectionNotification(type: string, id: string, userId: string, title: string): Promise<void>;
  createSportRequest(params: SportRequestDataDTO & { status: SportRequestStatus }): Promise<void>;
}
import {
  GetSportRequestsRequestDTO,
  ApproveSportRequestRequestDTO,
  RejectSportRequestRequestDTO,
  GetSportRequestDetailsRequestDTO,
  JoinSportRequestDTO
} from "../dtos/SportRequestDTOs";
import {
  GetSportRequestsResponseDTO,
  GetSportRequestDetailsResponseDTO
} from "../dtos/SportResponseDTOs";

export interface IGetSportRequestsUseCase {
  execute(params: GetSportRequestsRequestDTO): Promise<GetSportRequestsResponseDTO>;
}

export interface IApproveSportRequestUseCase {
  execute(params: ApproveSportRequestRequestDTO): Promise<{ message: string }>;
}

export interface IRejectSportRequestUseCase {
  execute(params: RejectSportRequestRequestDTO): Promise<{ message: string }>;
}

export interface IGetSportRequestDetailsUseCase {
  execute(params: GetSportRequestDetailsRequestDTO): Promise<GetSportRequestDetailsResponseDTO>;
}

export interface IJoinSportUseCase {
  execute(params: JoinSportRequestDTO): Promise<{ message: string }>;
}

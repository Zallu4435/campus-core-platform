import { GetCampusLifeOverviewRequestDTO, CampusLifeOverviewResponseDTO } from "../dtos/CampusLifeOverviewDTOs";
import {
  GetEventsRequestDTO,
  GetEventsResponseDTO,
  GetEventByIdRequestDTO,
  GetEventByIdResponseDTO,
  JoinEventRequestDTO,
  JoinEventResponseDTO
} from "../dtos/CampusEventDTOs";
import {
  GetSportsRequestDTO,
  GetSportsResponseDTO,
  GetSportByIdRequestDTO,
  GetSportByIdResponseDTO,
  JoinSportRequestDTO,
  JoinSportResponseDTO
} from "../dtos/SportDTOs";
import {
  GetClubsRequestDTO,
  GetClubsResponseDTO,
  GetClubByIdRequestDTO,
  GetClubByIdResponseDTO,
  JoinClubRequestDTO,
  JoinClubResponseDTO
} from "../dtos/ClubDTOs";
import { ResponseDTO } from "../dtos/ResponseDTO";

export interface IGetCampusLifeOverviewUseCase {
  execute(params: GetCampusLifeOverviewRequestDTO): Promise<ResponseDTO<CampusLifeOverviewResponseDTO>>;
}

export interface IGetEventsUseCase {
  execute(params: GetEventsRequestDTO): Promise<ResponseDTO<GetEventsResponseDTO>>;
}

export interface IGetEventByIdUseCase {
  execute(params: GetEventByIdRequestDTO): Promise<ResponseDTO<GetEventByIdResponseDTO>>;
}

export interface IGetSportsUseCase {
  execute(params: GetSportsRequestDTO): Promise<ResponseDTO<GetSportsResponseDTO>>;
}

export interface IGetSportByIdUseCase {
  execute(params: GetSportByIdRequestDTO): Promise<ResponseDTO<GetSportByIdResponseDTO>>;
}

export interface IGetClubsUseCase {
  execute(params: GetClubsRequestDTO): Promise<ResponseDTO<GetClubsResponseDTO>>;
}

export interface IGetClubByIdUseCase {
  execute(params: GetClubByIdRequestDTO): Promise<ResponseDTO<GetClubByIdResponseDTO>>;
}

export interface IJoinClubUseCase {
  execute(params: JoinClubRequestDTO): Promise<ResponseDTO<JoinClubResponseDTO>>;
}

export interface IJoinSportUseCase {
  execute(params: JoinSportRequestDTO): Promise<ResponseDTO<JoinSportResponseDTO>>;
}

export interface IJoinEventUseCase {
  execute(params: JoinEventRequestDTO): Promise<ResponseDTO<JoinEventResponseDTO>>;
}

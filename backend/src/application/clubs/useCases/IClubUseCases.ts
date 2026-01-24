import {
  GetClubsRequestDTO,
  GetClubByIdRequestDTO,
  CreateClubRequestDTO,
  UpdateClubRequestDTO,
  DeleteClubRequestDTO,
} from "../dtos/ClubRequestDTOs";
import {
  GetClubsResponseDTO,
  GetClubByIdResponseDTO,
  CreateClubResponseDTO,
  UpdateClubResponseDTO,
} from "../dtos/ClubResponseDTOs";

export interface IGetClubsUseCase {
  execute(dto: GetClubsRequestDTO): Promise<GetClubsResponseDTO>;
}

export interface IGetClubByIdUseCase {
  execute(dto: GetClubByIdRequestDTO): Promise<GetClubByIdResponseDTO>;
}

export interface ICreateClubUseCase {
  execute(dto: CreateClubRequestDTO): Promise<CreateClubResponseDTO>;
}

export interface IUpdateClubUseCase {
  execute(dto: UpdateClubRequestDTO): Promise<UpdateClubResponseDTO>;
}

export interface IDeleteClubUseCase {
  execute(dto: DeleteClubRequestDTO): Promise<{ message: string }>;
}

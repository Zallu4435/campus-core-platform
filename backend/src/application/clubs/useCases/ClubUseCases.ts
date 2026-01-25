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
import { RepositoryClubData } from "../dtos/ClubBaseDTOs";
import { IClubsRepository } from "../repositories/IClubsRepository";
import {
  IGetClubsUseCase,
  IGetClubByIdUseCase,
  ICreateClubUseCase,
  IUpdateClubUseCase,
  IDeleteClubUseCase
} from "./IClubUseCases";

function isValidObjectId(id: string): boolean {
  return typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);
}

export class GetClubsUseCase implements IGetClubsUseCase {
  constructor(private _clubsRepository: IClubsRepository) { }

  async execute(dto: GetClubsRequestDTO): Promise<GetClubsResponseDTO> {
    if (isNaN(dto.page) || dto.page < 1 || isNaN(dto.limit) || dto.limit < 1) {
      throw new Error("Invalid page or limit parameters");
    }
    return await this._clubsRepository.getClubs(dto);
  }
}

export class GetClubByIdUseCase implements IGetClubByIdUseCase {
  constructor(private _clubsRepository: IClubsRepository) { }

  async execute(dto: GetClubByIdRequestDTO): Promise<GetClubByIdResponseDTO> {
    if (!isValidObjectId(dto.id)) {
      throw new Error("Invalid club ID");
    }
    const club = await this._clubsRepository.getById(dto.id);
    if (!club) {
      throw new Error("Club not found!");
    }

    const clubData: RepositoryClubData = {
      ...club,
      id: club.id
    };

    return { club: clubData };
  }
}

export class CreateClubUseCase implements ICreateClubUseCase {
  constructor(private _clubsRepository: IClubsRepository) { }

  async execute(dto: CreateClubRequestDTO): Promise<CreateClubResponseDTO> {
    const newClub = await this._clubsRepository.create(dto);

    const clubData: RepositoryClubData = {
      ...newClub,
      id: newClub.id
    };

    return { club: clubData };
  }
}

export class UpdateClubUseCase implements IUpdateClubUseCase {
  constructor(private _clubsRepository: IClubsRepository) { }

  async execute(dto: UpdateClubRequestDTO): Promise<UpdateClubResponseDTO> {
    if (!isValidObjectId(dto.id)) {
      throw new Error("Invalid club ID");
    }
    const { id, ...updateData } = dto;
    const updatedClub = await this._clubsRepository.updateById(id, updateData);
    if (!updatedClub) {
      throw new Error("Club not found!");
    }

    const clubData: RepositoryClubData = {
      ...updatedClub,
      id: updatedClub.id
    };

    return { club: clubData };
  }
}

export class DeleteClubUseCase implements IDeleteClubUseCase {
  constructor(private _clubsRepository: IClubsRepository) { }

  async execute(dto: DeleteClubRequestDTO): Promise<{ message: string }> {
    if (!isValidObjectId(dto.id)) {
      throw new Error("Invalid club ID");
    }
    await this._clubsRepository.deleteById(dto.id);
    return { message: "Club deleted successfully" };
  }
}
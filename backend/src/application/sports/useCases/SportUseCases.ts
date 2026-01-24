import { GetSportsRequestDTO, GetSportByIdRequestDTO, CreateSportRequestDTO, UpdateSportRequestDTO, DeleteSportRequestDTO } from "../dtos/SportRequestDTOs";
import { GetSportsResponseDTO, GetSportByIdResponseDTO, CreateSportResponseDTO, UpdateSportResponseDTO } from "../dtos/SportResponseDTOs";
import { RepositorySportData } from "../dtos/SportBaseDTOs";
import { ISportsRepository } from "../repositories/ISportsRepository";
import { Sport } from "../../../domain/sports/entities/Sport";
import { SportStatus } from "../../../domain/sports/entities/SportTypes";
import {
  IGetSportsUseCase,
  IGetSportByIdUseCase,
  ICreateSportUseCase,
  IUpdateSportUseCase,
  IDeleteSportUseCase
} from './ISportUseCases';

function isValidObjectId(id: string): boolean {
  return typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);
}

export class GetSportsUseCase implements IGetSportsUseCase {
  constructor(private sportsRepository: ISportsRepository) { }

  async execute(params: GetSportsRequestDTO): Promise<GetSportsResponseDTO> {
    if (isNaN(params.page) || params.page < 1 || isNaN(params.limit) || params.limit < 1) {
      throw new Error("Invalid page or limit parameters");
    }
    return await this.sportsRepository.getSports(params);
  }
}

export class GetSportByIdUseCase implements IGetSportByIdUseCase {
  constructor(private _sportsRepository: ISportsRepository) { }

  async execute(params: GetSportByIdRequestDTO): Promise<GetSportByIdResponseDTO> {
    if (!isValidObjectId(params.id)) {
      throw new Error("Invalid sport ID");
    }
    const sport = await this._sportsRepository.getById(params.id);
    if (!sport) {
      throw new Error("Sport not found");
    }

    const sportData: RepositorySportData = {
      ...sport,
      _id: sport._id?.toString() || ""
    };

    return { sport: sportData };
  }
}

export class CreateSportUseCase implements ICreateSportUseCase {
  constructor(private _sportsRepository: ISportsRepository) { }

  async execute(params: CreateSportRequestDTO): Promise<CreateSportResponseDTO> {
    // Basic validation via Domain Entity
    Sport.create({
      ...params,
      status: params.status as SportStatus || SportStatus.Active
    });

    const newSport = await this._sportsRepository.create(params);

    return {
      sport: {
        ...newSport,
        _id: newSport._id?.toString() || ""
      }
    };
  }
}

export class UpdateSportUseCase implements IUpdateSportUseCase {
  constructor(private _sportsRepository: ISportsRepository) { }

  async execute(params: UpdateSportRequestDTO): Promise<UpdateSportResponseDTO> {
    if (!isValidObjectId(params.id)) {
      throw new Error("Invalid sport ID");
    }
    const { id, ...updateData } = params;
    const updatedSport = await this._sportsRepository.updateById(id, updateData);
    if (!updatedSport) {
      throw new Error("Sport not found");
    }

    return {
      sport: {
        ...updatedSport,
        _id: updatedSport._id?.toString() || ""
      }
    };
  }
}

export class DeleteSportUseCase implements IDeleteSportUseCase {
  constructor(private _sportsRepository: ISportsRepository) { }

  async execute(params: DeleteSportRequestDTO): Promise<{ message: string }> {
    if (!isValidObjectId(params.id)) {
      throw new Error("Invalid sport ID");
    }
    await this._sportsRepository.deleteById(params.id);
    return { message: "Sport deleted successfully" };
  }
} 
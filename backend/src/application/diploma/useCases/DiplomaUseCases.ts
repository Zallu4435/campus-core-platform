import { IDiplomaRepository } from "../repositories/IDiplomaRepository";
import {
  GetDiplomasRequestDTO,
  GetDiplomaByIdRequestDTO,
  CreateDiplomaRequestDTO,
  UpdateDiplomaRequestDTO,
  DeleteDiplomaRequestDTO,
  EnrollStudentRequestDTO,
  UnenrollStudentRequestDTO
} from "../dtos/DiplomaRequestDTOs";
import {
  GetDiplomasResponseDTO,
  GetDiplomaByIdResponseDTO,
  CreateDiplomaResponseDTO,
  UpdateDiplomaResponseDTO,
  EnrollStudentResponseDTO,
  UnenrollStudentResponseDTO
} from "../dtos/DiplomaResponseDTOs";
import { DiplomaNotFoundError } from "../../../domain/diploma/errors/DiplomaErrors";
import {
  IGetDiplomasUseCase,
  IGetDiplomaByIdUseCase,
  ICreateDiplomaUseCase,
  IUpdateDiplomaUseCase,
  IDeleteDiplomaUseCase,
  IEnrollStudentUseCase,
  IUnenrollStudentUseCase
} from "./IDiplomaUseCases";
import { DIPLOMA_MESSAGES, USER_DIPLOMA_MESSAGES } from "../constants/DiplomaConstants";

export class GetDiplomasUseCase implements IGetDiplomasUseCase {
  constructor(private readonly _diplomaRepository: IDiplomaRepository) { }

  async execute(params: GetDiplomasRequestDTO): Promise<GetDiplomasResponseDTO> {
    const { diplomas, totalItems } = await this._diplomaRepository.getDiplomas(params);
    return {
      data: diplomas,
      totalPages: Math.ceil(totalItems / params.limit),
      currentPage: params.page,
      totalItems,
    };
  }
}

export class GetDiplomaByIdUseCase implements IGetDiplomaByIdUseCase {
  constructor(private readonly _diplomaRepository: IDiplomaRepository) { }

  async execute(params: GetDiplomaByIdRequestDTO): Promise<GetDiplomaByIdResponseDTO> {
    const diploma = await this._diplomaRepository.getDiplomaById(params.id);
    if (!diploma) {
      throw new DiplomaNotFoundError(params.id);
    }
    return { diploma };
  }
}

export class CreateDiplomaUseCase implements ICreateDiplomaUseCase {
  constructor(private readonly _diplomaRepository: IDiplomaRepository) { }

  async execute(params: CreateDiplomaRequestDTO): Promise<CreateDiplomaResponseDTO> {
    const diploma = await this._diplomaRepository.createDiploma(params);
    return { diploma };
  }
}

export class UpdateDiplomaUseCase implements IUpdateDiplomaUseCase {
  constructor(private readonly _diplomaRepository: IDiplomaRepository) { }

  async execute(params: UpdateDiplomaRequestDTO): Promise<UpdateDiplomaResponseDTO> {
    const diploma = await this._diplomaRepository.updateDiploma(params);
    if (!diploma) {
      throw new DiplomaNotFoundError(params.id);
    }
    return { diploma };
  }
}

export class DeleteDiplomaUseCase implements IDeleteDiplomaUseCase {
  constructor(private readonly _diplomaRepository: IDiplomaRepository) { }

  async execute(params: DeleteDiplomaRequestDTO): Promise<{ message: string }> {
    await this._diplomaRepository.deleteDiploma(params.id);
    return { message: DIPLOMA_MESSAGES.DELETED };
  }
}

export class EnrollStudentUseCase implements IEnrollStudentUseCase {
  constructor(private readonly _diplomaRepository: IDiplomaRepository) { }

  async execute(params: EnrollStudentRequestDTO): Promise<EnrollStudentResponseDTO> {
    const result = await this._diplomaRepository.enrollStudent(params);
    if (!result) {
      throw new DiplomaNotFoundError(params.diplomaId);
    }
    return { message: USER_DIPLOMA_MESSAGES.ENROLLED };
  }
}

export class UnenrollStudentUseCase implements IUnenrollStudentUseCase {
  constructor(private readonly _diplomaRepository: IDiplomaRepository) { }

  async execute(params: UnenrollStudentRequestDTO): Promise<UnenrollStudentResponseDTO> {
    const result = await this._diplomaRepository.unenrollStudent(params);
    if (!result) {
      throw new DiplomaNotFoundError(params.diplomaId);
    }
    return { message: USER_DIPLOMA_MESSAGES.UNENROLLED };
  }
}


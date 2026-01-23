import { GetDiplomasRequestDTO, GetDiplomaByIdRequestDTO, CreateDiplomaRequestDTO, UpdateDiplomaRequestDTO, DeleteDiplomaRequestDTO, EnrollStudentRequestDTO, UnenrollStudentRequestDTO } from "../dtos/DiplomaRequestDTOs";
import { GetDiplomasResponseDTO, GetDiplomaByIdResponseDTO, CreateDiplomaResponseDTO, UpdateDiplomaResponseDTO, EnrollStudentResponseDTO, UnenrollStudentResponseDTO } from "../dtos/DiplomaResponseDTOs";

export interface IGetDiplomasUseCase {
  execute(params: GetDiplomasRequestDTO): Promise<GetDiplomasResponseDTO>;
}

export interface IGetDiplomaByIdUseCase {
  execute(params: GetDiplomaByIdRequestDTO): Promise<GetDiplomaByIdResponseDTO>;
}

export interface ICreateDiplomaUseCase {
  execute(params: CreateDiplomaRequestDTO): Promise<CreateDiplomaResponseDTO>;
}

export interface IUpdateDiplomaUseCase {
  execute(params: UpdateDiplomaRequestDTO): Promise<UpdateDiplomaResponseDTO>;
}

export interface IDeleteDiplomaUseCase {
  execute(params: DeleteDiplomaRequestDTO): Promise<{ message: string }>;
}

export interface IEnrollStudentUseCase {
  execute(params: EnrollStudentRequestDTO): Promise<EnrollStudentResponseDTO>;
}

export interface IUnenrollStudentUseCase {
  execute(params: UnenrollStudentRequestDTO): Promise<UnenrollStudentResponseDTO>;
}


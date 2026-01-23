import { DiplomaProps, EnrollStudentProps, UnenrollStudentProps } from "../../../domain/diploma/types";
import { GetDiplomasRequestDTO } from "../dtos/DiplomaRequestDTOs";
import { DiplomaSummaryDTO, DiplomaDetailsDTO } from "../dtos/DiplomaResponseDTOs";

export interface IDiplomaRepository {
  getDiplomas(params: GetDiplomasRequestDTO): Promise<{ diplomas: DiplomaSummaryDTO[]; totalItems: number }>;
  getDiplomaById(id: string): Promise<DiplomaDetailsDTO | null>;
  createDiploma(params: DiplomaProps): Promise<DiplomaDetailsDTO>;
  updateDiploma(params: Partial<DiplomaProps> & { id: string }): Promise<DiplomaDetailsDTO | null>;
  deleteDiploma(id: string): Promise<void>;
  enrollStudent(params: EnrollStudentProps): Promise<boolean>;
  unenrollStudent(params: UnenrollStudentProps): Promise<boolean>;
}

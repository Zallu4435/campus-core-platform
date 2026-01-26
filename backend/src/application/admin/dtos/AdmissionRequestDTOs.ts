import { AdminAdmissionStatus } from '../../../domain/admin/entities/AdminAdmissionTypes';

export interface GetAdmissionsRequestDTO {
  page: number;
  limit: number;
  status?: AdminAdmissionStatus | "all";
  program?: string;
  dateRange?: "all" | "last_week" | "last_month" | "last_3_months" | "custom";
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface GetAdmissionByIdRequestDTO {
  id: string;
}

export interface GetAdmissionByTokenRequestDTO {
  admissionId: string;
  token: string;
}

export interface ApproveAdmissionRequestDTO {
  id: string;
  additionalInfo?: {
    programDetails?: string;
    startDate?: string;
    scholarshipInfo?: string;
    additionalNotes?: string;
  };
}

export interface RejectAdmissionRequestDTO {
  id: string;
  reason?: string;
}

export interface DeleteAdmissionRequestDTO {
  id: string;
}

export interface ConfirmAdmissionOfferRequestDTO {
  admissionId: string;
  token: string;
  action: "accept" | "reject";
}
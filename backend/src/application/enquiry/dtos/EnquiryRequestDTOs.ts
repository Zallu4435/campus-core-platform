import { EnquiryStatus } from "../../../domain/enquiry/entities/EnquiryTypes";

export interface CreateEnquiryRequestDTO {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface GetEnquiriesRequestDTO {
  page?: number;
  limit?: number;
  status?: EnquiryStatus;
  search?: string;
  subject?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetEnquiryByIdRequestDTO {
  id: string;
}

export interface UpdateEnquiryStatusRequestDTO {
  id: string;
  status: EnquiryStatus;
}

export interface DeleteEnquiryRequestDTO {
  id: string;
}

export interface SendEnquiryReplyRequestDTO {
  id: string;
  replyMessage: string;
} 
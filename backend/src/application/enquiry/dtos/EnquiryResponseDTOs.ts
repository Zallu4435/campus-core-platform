import { EnquiryProps } from "../../../domain/enquiry/entities/EnquiryTypes";

export interface CreateEnquiryResponseDTO {
  enquiry: EnquiryProps;
}

export interface GetEnquiriesResponseDTO {
  enquiries: EnquiryProps[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetEnquiryByIdResponseDTO {
  enquiry: EnquiryProps;
}

export interface UpdateEnquiryStatusResponseDTO {
  enquiry: EnquiryProps;
}

export interface DeleteEnquiryResponseDTO {
  success: boolean;
  message: string;
}

export interface SendEnquiryReplyResponseDTO {
  success: boolean;
  message: string;
} 
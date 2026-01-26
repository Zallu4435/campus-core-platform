import httpClient from '../../frameworks/api/httpClient';
import {
  Enquiry,
  EnquiryApiResponse,
  CreateEnquiryData
} from '../../domain/types/management/enquirymanagement';
import { isAxiosErrorWithApiError } from '../../shared/types/apiError';

class EnquiryService {
  private baseUrl = '/enquiries';

  async getEnquiries(
    page: number = 1,
    limit: number = 10,
    status?: string,
    search?: string,
    startDate?: string,
    endDate?: string
  ): Promise<EnquiryApiResponse> {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());
      if (status && status !== 'All Statuses') params.append('status', status);
      if (search) params.append('search', search);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const response = await httpClient.get(`${this.baseUrl}?${params.toString()}`);
      return response.data.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch enquiries');
      }
      throw new Error('Failed to fetch enquiries');
    }
  }

  async getEnquiryById(id: string): Promise<Enquiry> {
    try {
      const response = await httpClient.get(`${this.baseUrl}/${id}`);
      return response.data.enquiry;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch enquiry');
      }
      throw new Error('Failed to fetch enquiry');
    }
  }

  async createEnquiry(data: CreateEnquiryData): Promise<Enquiry> {
    try {
      const response = await httpClient.post(this.baseUrl, data);
      return response.data.enquiry;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to create enquiry');
      }
      throw new Error('Failed to create enquiry');
    }
  }

  async updateEnquiryStatus(id: string, status: string): Promise<Enquiry> {
    try {
      const response = await httpClient.patch(`${this.baseUrl}/${id}/status`, { status });
      return response.data.enquiry;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to update enquiry status');
      }
      throw new Error('Failed to update enquiry status');
    }
  }

  async deleteEnquiry(id: string): Promise<void> {
    try {
      await httpClient.delete(`${this.baseUrl}/${id}`);
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to delete enquiry');
      }
      throw new Error('Failed to delete enquiry');
    }
  }

  async sendReply(id: string, replyMessage: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await httpClient.post(`${this.baseUrl}/${id}/reply`, { replyMessage });
      return response.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to send reply');
      }
      throw new Error('Failed to send reply');
    }
  }
}

export const enquiryService = new EnquiryService(); 
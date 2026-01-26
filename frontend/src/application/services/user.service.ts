import { AdmissionApiResponse, AdmissionDetails, AdmissionDetailsResponse } from '../../domain/types/management/usermanagement';
import httpClient from '../../frameworks/api/httpClient';
import { isAxiosErrorWithApiError } from '../../shared/types/apiError';

class UserService {
  async getAdmissions(
    page: number,
    limit: number,
    status?: string,
    program?: string,
    dateRange?: string,
    startDate?: string,
    endDate?: string,
    search?: string
  ): Promise<AdmissionApiResponse['data']> {
    try {
      const response = await httpClient.get<AdmissionApiResponse>('/admin/admissions', {
        params: { page, limit, status, program, dateRange, startDate, endDate, search },
      });
      return response.data.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to fetch admissions');
      }
      throw new Error('Failed to fetch admissions');
    }
  }

  async getAdmissionDetails(id: string): Promise<AdmissionDetails> {
    try {
      const response = await httpClient.get<AdmissionDetailsResponse>(`/admin/admissions/${id}`);
      return response.data.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to fetch admission details');
      }
      throw new Error('Failed to fetch admission details');
    }
  }

  async approveAdmission(id: string, data: {
    programDetails: string;
    startDate: string;
    scholarshipInfo: string;
    additionalNotes: string;
  }): Promise<void> {
    try {
      await httpClient.post(`/admin/admissions/${id}/approve`, data);
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to approve admission');
      }
      throw new Error('Failed to approve admission');
    }
  }

  async rejectAdmission(id: string, reason: string): Promise<void> {
    try {
      await httpClient.post(`/admin/admissions/${id}/reject`, { reason });
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to reject admission');
      }
      throw new Error('Failed to reject admission');
    }
  }

  async deleteAdmission(id: string): Promise<void> {
    try {
      await httpClient.delete(`/admin/admissions/${id}`);
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to delete admission');
      }
      throw new Error('Failed to delete admission');
    }
  }

  async blockAdmission(id: string): Promise<{ message: string }> {
    try {
      const response = await httpClient.post(`/admin/admissions/${id}/block`);
      return response.data.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to block/unblock admission');
      }
      throw new Error('Failed to block/unblock admission');
    }
  }
}

export const userService = new UserService();
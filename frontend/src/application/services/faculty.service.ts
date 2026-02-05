import { DocumentUploadResult, DocumentViewResult, Faculty, FacultyApiResponse, FacultyApprovalData, MultipleDocumentUploadResult } from '../../domain/types/management/facultyManagement';
import httpClient from '../../frameworks/api/httpClient';
import { isAxiosErrorWithApiError } from '../../shared/types/apiError';

class FacultyService {
  async getFaculty(
    page: number,
    limit: number,
    status?: string,
    department?: string,
    dateRange?: string,
    startDate?: string,
    endDate?: string,
    search?: string
  ): Promise<FacultyApiResponse['data']> {
    try {
      const params: Record<string, string | number> = {
        page,
        limit
      };

      if (status) params.status = status;
      if (department) params.department = department;
      if (dateRange) params.dateRange = dateRange;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (search) params.search = search;

      const response = await httpClient.get<FacultyApiResponse>('/admin/faculty', {
        params
      });
      return response.data.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to fetch faculty');
      }
      throw new Error('Failed to fetch faculty');
    }
  }

  async getFacultyDetails(id: string) {
    try {
      const response = await httpClient.get(`/admin/faculty/${id}`);
      return response.data.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to fetch faculty details');
      }
      throw new Error('Failed to fetch faculty details');
    }
  }

  async getFacultyDocument(facultyId: string, type: string, documentUrl: string) {
    try {
      const response = await httpClient.get(`/admin/faculty/${facultyId}/documents?type=${type}&documentUrl=${encodeURIComponent(documentUrl)}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Handle both { data: { ... } } and { data: { data: { ... } } } structures for safety
      const responseData = response.data;
      if (responseData.data && responseData.data.pdfData) {
        return responseData.data;
      }
      return responseData.data?.data || responseData.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        console.error('Error fetching faculty document:', error);
        throw new Error(error.response?.data?.error || 'Failed to fetch faculty document');
      }
      console.error('Error fetching faculty document:', error);
      throw new Error('Failed to fetch faculty document');
    }
  }

  async approveFaculty(
    id: string,
    approvalData: FacultyApprovalData
  ): Promise<{ message: string; faculty: Faculty }> {
    try {
      const response = await httpClient.post<{ message: string; faculty: Faculty }>(
        `/admin/faculty/${id}/approve`,
        approvalData
      );
      return response.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to approve faculty request');
      }
      throw new Error('Failed to approve faculty request');
    }
  }

  async rejectFaculty(
    id: string,
    reason: string
  ): Promise<{ message: string }> {
    try {
      const response = await httpClient.post<{ message: string }>(
        `/admin/faculty/${id}/reject`,
        { reason }
      );
      return response.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to reject faculty request');
      }
      throw new Error('Failed to reject faculty request');
    }
  }

  async deleteFaculty(id: string): Promise<{ message: string }> {
    try {
      const response = await httpClient.delete<{ message: string }>(`/admin/faculty/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to delete faculty request');
      }
      throw new Error('Failed to delete faculty request');
    }
  }

  async updateFacultyStatus(
    id: string,
    status: string
  ): Promise<{ message: string; faculty: Faculty }> {
    try {
      const response = await httpClient.patch<{ message: string; faculty: Faculty }>(
        `/admin/faculty/${id}/status`,
        { status }
      );
      return response.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to update faculty status');
      }
      throw new Error('Failed to update faculty status');
    }
  }

  async blockFaculty(id: string): Promise<{ message: string; faculty: Faculty }> {
    try {
      const response = await httpClient.post<{ message: string; faculty: Faculty }>(
        `/admin/faculty/${id}/block`
      );
      return response.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to block/unblock faculty');
      }
      throw new Error('Failed to block/unblock faculty');
    }
  }
}

export const facultyService = new FacultyService();


class DocumentUploadService {
  private baseUrl = '/admission';

  async uploadDocument(applicationId: string, documentType: string, file: File): Promise<DocumentUploadResult> {
    if (!applicationId || applicationId === '') {
      throw new Error('Application ID is required for document upload');
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('applicationId', applicationId);
      formData.append('documentType', documentType);

      const response = await httpClient.post(`${this.baseUrl}/documents/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.data?.document;
    } catch (error: unknown) {
      console.error('Error uploading document:', error);
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const err = error as { response?: { data?: { error?: string }, status?: number }, message?: string };
        console.error('Error response:', err.response?.data);
        console.error('Error status:', err.response?.status);
        throw new Error(err.response?.data?.error || err.message || 'Failed to upload document');
      }
      throw new Error('Failed to upload document');
    }
  }

  async uploadMultipleDocuments(applicationId: string, files: File[], documentTypes: string[]): Promise<MultipleDocumentUploadResult> {
    try {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append('files', file);
      });

      formData.append('applicationId', applicationId);
      documentTypes.forEach((documentType) => {
        formData.append('documentTypes', documentType);
      });

      const response = await httpClient.post(`${this.baseUrl}/documents/upload-multiple`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: unknown) {
      console.error('Error uploading multiple documents:', error);
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const err = error as { response?: { data?: { error?: string } }, message?: string };
        throw new Error(err.response?.data?.error || err.message || 'Failed to upload documents');
      }
      throw new Error('Failed to upload documents');
    }
  }

  async getDocument(documentId: string): Promise<DocumentViewResult> {
    try {
      const response = await httpClient.get(`${this.baseUrl}/documents/${documentId}`);
      return response.data.data;
    } catch (error: unknown) {
      console.error('Error fetching document:', error);
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const err = error as { response?: { data?: { error?: string } }, message?: string };
        throw new Error(err.response?.data?.error || err.message || 'Failed to fetch document');
      }
      throw new Error('Failed to fetch document');
    }
  }

  async getAdminDocument(documentId: string, admissionId: string) {
    try {
      const response = await httpClient.get(`/admin/admissions/documents/${documentId}?admissionId=${admissionId}`);

      return response.data.data;
    } catch (error: unknown) {
      console.error('Error fetching admin document:', error);
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const err = error as { response?: { data?: { error?: string }, status?: number }, message?: string };
        console.error('Error response:', err.response?.data);
        console.error('Error status:', err.response?.status);
        throw new Error(err.response?.data?.error || err.message || 'Failed to fetch admin document');
      }
      throw new Error('Failed to fetch admin document');
    }
  }
}

export const documentUploadService = new DocumentUploadService();
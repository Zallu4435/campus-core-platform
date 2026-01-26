import { Assignment, NewAssignment } from '../../../../../domain/types/faculty/assignment';
import httpClient from '../../../../../frameworks/api/httpClient';
import { isAxiosErrorWithApiError } from '../../../../../shared/types/apiError';

export const assignmentService = {
  getAssignments: async (params = {}) => {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined && value !== null && value !== '' && value !== 'all')
    );
    const queryString = Object.keys(filteredParams).length
      ? '?' + new URLSearchParams(filteredParams as any).toString()
      : '';
    const response = await httpClient.get(`/faculty/assignments${queryString}`);
    const data = response.data.data;
    if (data && Array.isArray(data.data)) {
      data.data = data.data.map((item: any) => ({
        ...item,
        _id: item._id || item.id,
        id: item.id || item._id
      }));
    }
    return data;
  },

  getAssignmentById: async (id: string) => {
    const response = await httpClient.get(`/faculty/assignments/${id}`);
    const data = response.data.data;
    if (data) {
      const assignment = data.assignment || data;
      const normalizedAssignment = {
        ...assignment,
        _id: assignment._id || assignment.id,
        id: assignment.id || assignment._id
      };
      if (data.assignment) {
        data.assignment = normalizedAssignment;
      } else {
        return normalizedAssignment;
      }
    }
    return data;
  },

  createAssignment: async (assignment: NewAssignment) => {
    const formData = new FormData();
    formData.append('title', assignment.title);
    formData.append('subject', assignment.subject);
    formData.append('dueDate', assignment.dueDate);
    formData.append('maxMarks', assignment.maxMarks);
    formData.append('description', assignment.description);

    assignment.files.forEach((file) => {
      formData.append(`files`, file);
    });

    try {
      const response = await httpClient.post('/faculty/assignments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || 'Error uploading assignment');
      }
      throw new Error('Error uploading assignment');
    }
  },

  updateAssignment: async (id: string, assignment: Partial<Omit<Assignment, 'files'>> & { files?: File[] }) => {
    if (assignment.files && assignment.files.length > 0) {
      const formData = new FormData();
      if (assignment.title) formData.append('title', assignment.title);
      if (assignment.subject) formData.append('subject', assignment.subject);
      if (assignment.dueDate) formData.append('dueDate', assignment.dueDate);
      if (assignment.maxMarks) formData.append('maxMarks', assignment.maxMarks.toString());
      if (assignment.description) formData.append('description', assignment.description);
      assignment.files.forEach((file) => {
        formData.append('files', file);
      });
      const response = await httpClient.put(`/faculty/assignments/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      const response = await httpClient.put(`/faculty/assignments/${id}`, assignment);
      return response.data;
    }
  },

  deleteAssignment: async (id: string) => {
    const response = await httpClient.delete(`/faculty/assignments/${id}`);
    return response.data;
  },

  getSubmissions: async (assignmentId: string, options: { search?: string; status?: string } = {}) => {
    const filteredParams = Object.fromEntries(
      Object.entries(options).filter(([_, value]) => value !== undefined && value !== null && value !== '' && value !== 'all')
    );
    const queryString = Object.keys(filteredParams).length
      ? '?' + new URLSearchParams(filteredParams).toString()
      : '';
    const response = await httpClient.get(`/faculty/assignments/${assignmentId}/submissions${queryString}`);
    const data = response.data.data;
    if (data && Array.isArray(data.data)) {
      data.data = data.data.map((item: any) => ({
        ...item,
        _id: item._id || item.id,
        id: item.id || item._id
      }));
    }
    return data;
  },

  getSubmissionById: async (assignmentId: string, submissionId: string) => {
    const response = await httpClient.get(`/faculty/assignments/${assignmentId}/submissions/${submissionId}`);
    return response.data;
  },

  reviewSubmission: async (assignmentId: string, submissionId: string, reviewData: {
    marks: number;
    feedback: string;
    status: 'reviewed' | 'pending' | 'needs_correction';
    isLate: boolean;
  }) => {
    const response = await httpClient.put(
      `/faculty/assignments/${assignmentId}/submissions/${submissionId}/review`,
      reviewData
    );
    return response.data;
  },

  getAllAnalytics: async () => {
    const response = await httpClient.get('/faculty/assignments/analytics');
    return response.data.data;
  },

  getFileDownloadUrl: async (fileUrl: string, fileName: string) => {
    try {
      const response = await httpClient.get('/faculty/assignments/download-submission-file', {
        params: { fileUrl, fileName },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  downloadSubmissionFile: async (fileUrl: string, fileName: string) => {
    try {
      const blob = await assignmentService.getFileDownloadUrl(fileUrl, fileName);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      return blob;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || 'Error downloading submission file');
      }
      throw new Error('Error downloading submission file');
    }
  },
}; 
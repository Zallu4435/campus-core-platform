import httpClient from '../../frameworks/api/httpClient';
import { ProfileData, PasswordChangeData } from '../../domain/types/settings/user';
import { isAxiosErrorWithApiError } from '../../shared/types/apiError';
import { formatErrorMessage } from '../../shared/utils/errorFormatter';

class ProfileService {
  async updateProfile(data: ProfileData): Promise<void> {
    try {
      await httpClient.put('/profile', data);
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        const remoteError = error.response?.data?.error ||
          error.response?.data?.body?.error ||
          error.response?.data?.message ||
          'Failed to update profile';
        throw new Error(formatErrorMessage(remoteError));
      }
      throw new Error('Failed to update profile');
    }
  }

  async changePassword(data: PasswordChangeData): Promise<void> {
    try {
      await httpClient.post('/profile/password', data);
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        const remoteError = error.response?.data?.error ||
          error.response?.data?.body?.error ||
          error.response?.data?.message ||
          'Failed to change password';
        throw new Error(formatErrorMessage(remoteError));
      }
      throw new Error('Failed to change password');
    }
  }

  async updateProfilePicture(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      const response = await httpClient.post<{ url: string }>('/profile/profile-picture', formData);
      return response.data.url;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        const remoteError = error.response?.data?.error ||
          error.response?.data?.body?.error ||
          error.response?.data?.message ||
          'Failed to update profile picture';
        throw new Error(formatErrorMessage(remoteError));
      }
      throw new Error('Failed to update profile picture');
    }
  }

  async getProfile(): Promise<ProfileData> {
    try {
      const response = await httpClient.get<{ data: ProfileData }>('/profile');
      return response.data.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch profile data');
      }
      throw new Error('Failed to fetch profile data');
    }
  }
}

export const profileService = new ProfileService();
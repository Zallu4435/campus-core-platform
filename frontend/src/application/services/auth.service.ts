import httpClient from '../../frameworks/api/httpClient';
import { ApiResponseWrapper, LoginResponse } from '../../domain/types/auth/Login';
import { RegisterResponse } from '../../domain/types/auth/Register';
import { isAxiosErrorWithApiError } from '../../shared/types/apiError';

class AuthService {
  async registerUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<RegisterResponse> {
    try {
      const response = await httpClient.post<RegisterResponse>('/auth/register', data);
      return response.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to register user');
      }
      throw new Error('Failed to register user');
    }
  }

  async loginUser(data: { email: string; password: string }): Promise<LoginResponse> {
    try {
      const response = await httpClient.post<ApiResponseWrapper<LoginResponse>>('/auth/login', data);
      return response.data.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to login');
      }
      throw new Error('Failed to login');
    }
  }

  async sendEmailOtp(email: string): Promise<{ message: string }> {
    try {
      const response = await httpClient.post('/auth/send-email-otp', { email });
      return response.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to send OTP');
      }
      throw new Error('Failed to send OTP');
    }
  }

  async verifyEmailOtp(email: string, otp: string): Promise<{ resetToken: string }> {
    try {
      const response = await httpClient.post<ApiResponseWrapper<{ resetToken: string }>>('/auth/verify-email-otp', { email, otp });
      return response.data.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to verify OTP');
      }
      throw new Error('Failed to verify OTP');
    }
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<{ token: string; user: unknown; collection: string }> {
    try {
      const response = await httpClient.post('/auth/reset-password', { resetToken, newPassword });
      return response.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to reset password');
      }
      throw new Error('Failed to reset password');
    }
  }

  async confirmRegistration(token: string): Promise<{ message: string }> {
    try {
      const response = await httpClient.post('/auth/confirm-registration', { token });
      return response.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to confirm registration');
      }
      throw new Error('Failed to confirm registration');
    }
  }

  async logout(): Promise<void> {
    try {
      await httpClient.post('/auth/logout');
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to logout');
      }
      throw new Error('Failed to logout');
    }
  }

  async logoutAll(): Promise<void> {
    try {
      await httpClient.post('/auth/logout-all');
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to logout from all devices');
      }
      throw new Error('Failed to logout from all devices');
    }
  }
}

export const authService = new AuthService();
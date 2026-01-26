import { Message, MessageForm, User, Admin } from '../../domain/types/user/communication';
import httpClient from '../../frameworks/api/httpClient';
type RecipientType = '' | 'all_students' | 'all_faculty' | 'all_users' | 'individual_students' | 'individual_faculty';

export class CommunicationService {
  private static instance: CommunicationService;
  private readonly userBaseUrl = '/communication';
  private readonly adminBaseUrl = '/communication/admin';

  private constructor() { }

  public static getInstance(): CommunicationService {
    if (!CommunicationService.instance) {
      CommunicationService.instance = new CommunicationService();
    }
    return CommunicationService.instance;
  }

  private getBaseUrl(isAdmin: boolean): string {
    return isAdmin ? this.adminBaseUrl : this.userBaseUrl;
  }

  async getInboxMessages(params: {
    page: number;
    limit: number;
    search?: string;
    status?: 'read' | 'unread';
    from?: string;
    isAdmin?: boolean;
  }): Promise<{ messages: Message[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
    try {
      const baseUrl = this.getBaseUrl(!!params.isAdmin);
      const response = await httpClient.get(`${baseUrl}/inbox`, { params });
      return response.data.data;
    } catch (error) {
      throw new Error('Failed to fetch inbox messages');
    }
  }

  async getSentMessages(params: {
    page: number;
    limit: number;
    search?: string;
    status?: 'read' | 'unread' | 'delivered' | 'opened';
    to?: string;
    isAdmin?: boolean;
  }): Promise<{ messages: Message[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
    try {
      const baseUrl = this.getBaseUrl(!!params.isAdmin);
      const response = await httpClient.get(`${baseUrl}/sent`, { params });
      return response.data.data;
    } catch (error) {
      throw new Error('Failed to fetch sent messages');
    }
  }

  async fetchUsers(type: RecipientType, search?: string): Promise<User[]> {
    if (!type) {
      return [];
    }

    const response = await httpClient.get(`/communication/admin/users`, {
      params: {
        type,
        search,
      },
    });
    return response.data.data;
  }

  async sendMessage(form: MessageForm): Promise<Message> {
    try {
      const formData = new FormData();
      formData.append('to', JSON.stringify(form.to));
      formData.append('subject', form.subject);
      formData.append('message', form.message);

      const endpoint = form.isAdmin ? '/communication/admin/messages' : '/communication/send';

      const response = await httpClient.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
        throw new Error(`Failed to send message: ${err.response?.status} - ${err.response?.data?.message || err.message}`);
      }
      throw new Error('Failed to send message');
    }
  }

  async deleteMessage(messageId: string, isAdmin: boolean = false): Promise<void> {
    try {
      const baseUrl = this.getBaseUrl(isAdmin);
      await httpClient.delete(`${baseUrl}/messages/${messageId}`);
    } catch (error) {
      throw new Error('Failed to delete message');
    }
  }

  async markAsRead(messageId: string, isAdmin: boolean = false): Promise<void> {
    try {
      const baseUrl = this.getBaseUrl(isAdmin);
      const endpoint = `${baseUrl}/messages/${messageId}/read`;

      await httpClient.put(endpoint);
    } catch (error) {
      console.error('Mark as read API call failed:', error);
      throw new Error('Failed to mark message as read');
    }
  }

  async getAllAdmins(): Promise<Admin[]> {
    try {
      const response = await httpClient.get(`${this.userBaseUrl}/all-admins`);
      return response.data.data.admins;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
        throw new Error(`Failed to fetch admins: ${err.response?.status} - ${err.response?.data?.message || err.message}`);
      }
      throw new Error('Failed to fetch admins');
    }
  }
}

export const communicationService = CommunicationService.getInstance();
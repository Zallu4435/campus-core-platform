import { EventApiResponse, EventApiResponseSingle, EventRequestApiResponseSingle, Event, EventServiceResponse, EventRequestsServiceResponse, EventRequestsApiResponse, EventDTO, EventRequestDTO } from '../../domain/types/management/eventmanagement';
import httpClient from '../../frameworks/api/httpClient';
import { isAxiosErrorWithApiError } from '../../shared/types/apiError';

class EventService {
  async getEvents(
    page: number,
    limit: number,
    type?: string,
    status?: string,
    dateRange?: string,
    search?: string,
    organizerType?: string
  ): Promise<EventServiceResponse> {
    try {
      const params: Record<string, string | number> = {
        page,
        limit
      };

      if (type && type !== 'All') {
        params.type = type;
      }
      if (status && status !== 'All') {
        params.status = status;
      }
      if (dateRange && dateRange !== 'All') {
        const [startDate, endDate] = dateRange.split(',');
        params.startDate = startDate;
        params.endDate = endDate;
      }
      if (search && search.trim()) {
        params.search = search.trim();
      }
      if (organizerType && organizerType !== 'All') {
        params.organizerType = organizerType;
      }

      const response = await httpClient.get<EventApiResponse>('/admin/events', {
        params
      });
      return response.data.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch events');
      }
      throw new Error('Failed to fetch events');
    }
  }

  async getEventDetails(id: string): Promise<EventDTO> {
    try {
      const response = await httpClient.get<EventApiResponseSingle>(`/admin/events/${id}`);
      return response.data.data.event as unknown as EventDTO;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch event details');
      }
      throw new Error('Failed to fetch event details');
    }
  }

  async createEvent(data: Omit<Event, 'id' | 'participants'>): Promise<Event> {
    try {
      const response = await httpClient.post<Event>('/admin/events', data);
      return response.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to create event');
      }
      throw new Error('Failed to create event');
    }
  }

  async updateEvent(id: string, data: Partial<Event>): Promise<Event> {
    try {
      const response = await httpClient.put<Event>(`/admin/events/${id}`, data);
      return response.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to update event');
      }
      throw new Error('Failed to update event');
    }
  }

  async deleteEvent(id: string): Promise<void> {
    try {
      await httpClient.delete(`/admin/events/${id}`);
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to delete event');
      }
      throw new Error('Failed to delete event');
    }
  }

  async getEventRequests(
    page: number,
    limit: number,
    type?: string,
    status?: string,
    dateRange?: string,
    search?: string,
    organizerType?: string
  ): Promise<EventRequestsServiceResponse> {
    try {
      const params: Record<string, string | number> = {
        page,
        limit
      };

      if (type && type !== 'All') {
        params.type = type;
      }
      if (status && status !== 'All') {
        params.status = status;
      }
      if (dateRange && dateRange !== 'All') {
        const [startDate, endDate] = dateRange.split(',');
        params.startDate = startDate;
        params.endDate = endDate;
      }
      if (search && search.trim()) {
        params.search = search.trim();
      }
      if (organizerType && organizerType !== 'All') {
        params.organizerType = organizerType;
      }

      const response = await httpClient.get<EventRequestsApiResponse>('/admin/event-requests', {
        params
      });
      return response.data.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch event requests');
      }
      throw new Error('Failed to fetch event requests');
    }
  }

  async approveEventRequest(id: string): Promise<void> {
    try {
      await httpClient.post(`/admin/event-requests/${id}/approve`);
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to approve event request');
      }
      throw new Error('Failed to approve event request');
    }
  }

  async rejectEventRequest(id: string): Promise<void> {
    try {
      await httpClient.post(`/admin/event-requests/${id}/reject`);
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to reject event request');
      }
      throw new Error('Failed to reject event request');
    }
  }

  async getEventRequestDetails(id: string): Promise<EventRequestDTO> {
    try {
      const response = await httpClient.get<EventRequestApiResponseSingle>(`/admin/event-requests/${id}`);
      return response.data.data.eventRequest as unknown as EventRequestDTO;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch event request details');
      }
      throw new Error('Failed to fetch event request details');
    }
  }
}

export const eventService = new EventService();
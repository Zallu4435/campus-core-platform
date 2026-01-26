import { Diploma } from '../../domain/types/management/diplomamanagement';
import { Video } from '../../domain/types/management/videomanagement';
import httpClient from '../../frameworks/api/httpClient';

export const diplomaBackendService = {
    async getDiplomas(params: {
        page: number;
        limit: number;
        category?: string;
        status?: string;
        search?: string;
        dateRange?: string;
        instructor?: string;
        department?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<{ diplomas: Diploma[]; totalPages: number }> {
        const response = await httpClient.get('/admin/diploma-courses', { params });
        return {
            diplomas: response.data.data.data,
            totalPages: response.data.data.totalPages,
        };
    },

    async getVideos(category?: string, page: number = 1, limit: number = 10, status?: string, search?: string, dateRange?: string, startDate?: string, endDate?: string): Promise<{ videos: Video[]; totalPages: number; statusCounts: { all: number; published: number; drafts: number } }> {
        const params: Record<string, string | number> = { page, limit };
        if (status && status !== 'all') params.status = status;
        if (category && category !== 'all') params.category = category;
        if (search && search.trim()) params.search = search.trim();
        if (dateRange && dateRange !== 'all') params.dateRange = dateRange;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await httpClient.get('/admin/vedio', { params });
        return {
            videos: response.data.data.data,
            totalPages: response.data.data.totalPages,
            statusCounts: response.data.data.statusCounts
        };
    },

    async getVideoById(videoId: string): Promise<Video> {
        const response = await httpClient.get(`/admin/vedio/${videoId}`);
        return response.data.data.video;
    },

    async createVideo(category: string, videoData: FormData): Promise<Video> {
        if (!category) {
            throw new Error('Category is required for video creation');
        }

        // Ensure category is included in the FormData
        if (!videoData.has('category')) {
            videoData.append('category', category);
        }

        const response = await httpClient.post(`/admin/vedio`, videoData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 60000,
        });
        return response.data.data.video;
    },

    async updateVideo(videoId: string, videoData: Partial<Video> | FormData): Promise<Video> {
        if (!videoId) {
            throw new Error('Video ID is required for updates');
        }

        const isFormData = videoData instanceof FormData;

        if (isFormData) {
            const keys: string[] = [];
            (videoData as FormData).forEach((_, key) => keys.push(key));
        }

        const config = isFormData ? {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 60000,
        } : {};

        const response = await httpClient.put(`/admin/vedio/${videoId}`, videoData, config);
        return response.data.data.video;
    },

    async deleteVideo(videoId: string): Promise<void> {
        if (!videoId) {
            throw new Error('Video ID is required for deletion');
        }
        await httpClient.delete(`/admin/vedio/${videoId}`);
    },

    async getDiplomaDetails(diplomaId: string): Promise<Diploma> {
        const response = await httpClient.get(`/admin/diploma-courses/${diplomaId}`);
        return response.data.data.diploma;
    },

    async createDiploma(data: Omit<Diploma, '_id' | 'createdAt' | 'updatedAt'>): Promise<Diploma> {
        const response = await httpClient.post('/admin/diploma-courses', data);
        return response.data.data.diploma;
    },

    async updateDiploma(id: string, data: Partial<Diploma>): Promise<Diploma> {
        const response = await httpClient.put(`/admin/diploma-courses/${id}`, data);
        return response.data.data.diploma;
    },

    async deleteDiploma(id: string): Promise<void> {
        await httpClient.delete(`/admin/diploma-courses/${id}`);
    },
}; 
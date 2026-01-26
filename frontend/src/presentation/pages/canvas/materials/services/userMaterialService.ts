import httpClient from '../../../../../frameworks/api/httpClient';

export const userMaterialService = {
  getMaterials: async (filters: any) => {
    const activeFilters = Object.entries(filters).reduce((acc: any, [key, value]) => {
      if (value !== '' && value !== undefined && value !== null) {
        acc[key] = key === 'semester' ? Number(value) : value;
      }
      return acc;
    }, {});
    const response = await httpClient.get('/materials', { params: activeFilters });
    return response.data.data;
  },

  getMaterialById: async (id: string) => {
    const response = await httpClient.get(`/materials/${id}`);
    return response.data;
  },

  toggleBookmark: async (id: string) => {
    const response = await httpClient.post(`/materials/${id}/bookmark`);
    return response.data;
  },

  toggleLike: async (id: string) => {
    const response = await httpClient.post(`/materials/${id}/like`);
    return response.data;
  },

  downloadMaterial: async (id: string) => {
    const response = await httpClient.get(`/materials/${id}/download-file`, { responseType: 'blob' });
    return response.data;
  }
};
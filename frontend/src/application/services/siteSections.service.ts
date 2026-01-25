import httpClient from '../../frameworks/api/httpClient';

export interface SiteSection {
  id: string;
  sectionKey: 'highlights' | 'vagoNow' | 'leadership';
  title: string;
  description: string;
  category?: string;
  image: string;
  link: string;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSectionsResponse {
  data: {
    sections: SiteSection[];
    categories: string[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SiteSectionsParams {
  limit?: number;
  page?: number;
  search?: string;
  category?: string;
}

class SiteSectionsService {
  // Get highlights for home page
  async getHighlights(params?: SiteSectionsParams): Promise<SiteSectionsResponse['data']> {
    const urlParams = new URLSearchParams();
    urlParams.append('sectionKey', 'highlights');
    if (params?.limit) urlParams.append('limit', params.limit.toString());
    if (params?.page) urlParams.append('page', params.page.toString());
    if (params?.search) urlParams.append('search', params.search);
    if (params?.category) urlParams.append('category', params.category);

    const response = await httpClient.get<SiteSectionsResponse>(`/site-sections?${urlParams.toString()}`);
    return response.data.data;
  }

  // Get VAGO Now for home page
  async getVagoNow(params?: SiteSectionsParams): Promise<SiteSectionsResponse['data']> {
    const urlParams = new URLSearchParams();
    urlParams.append('sectionKey', 'vagoNow');
    if (params?.limit) urlParams.append('limit', params.limit.toString());
    if (params?.page) urlParams.append('page', params.page.toString());
    if (params?.search) urlParams.append('search', params.search);
    if (params?.category) urlParams.append('category', params.category);

    const response = await httpClient.get<SiteSectionsResponse>(`/site-sections?${urlParams.toString()}`);
    return response.data.data;
  }

  // Get leadership for home page
  async getLeadership(params?: SiteSectionsParams): Promise<SiteSectionsResponse['data']> {
    const urlParams = new URLSearchParams();
    urlParams.append('sectionKey', 'leadership');
    if (params?.limit) urlParams.append('limit', params.limit.toString());
    if (params?.page) urlParams.append('page', params.page.toString());
    if (params?.search) urlParams.append('search', params.search);
    if (params?.category) urlParams.append('category', params.category);

    const response = await httpClient.get<SiteSectionsResponse>(`/site-sections?${urlParams.toString()}`);
    return response.data.data;
  }

  // Get all sections by type (generic method)
  async getSectionsByType(sectionKey: 'highlights' | 'vagoNow' | 'leadership', params?: SiteSectionsParams): Promise<SiteSectionsResponse['data']> {
    const urlParams = new URLSearchParams();
    urlParams.append('sectionKey', sectionKey);
    if (params?.limit) urlParams.append('limit', params.limit.toString());
    if (params?.page) urlParams.append('page', params.page.toString());
    if (params?.search) urlParams.append('search', params.search);
    if (params?.category) urlParams.append('category', params.category);

    const response = await httpClient.get<SiteSectionsResponse>(`/site-sections?${urlParams.toString()}`);
    return response.data.data;
  }
}

export const siteSectionsService = new SiteSectionsService(); 
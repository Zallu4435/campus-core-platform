export enum SiteSectionKey {
  Highlights = 'highlights',
  VagoNow = 'vagoNow',
  Leadership = 'leadership',
}

export interface ISiteSectionBase {
  id: string;
  sectionKey: SiteSectionKey;
  title: string;
  description: string;
  image: string;
  link: string;
  category?: string;
  content?: string;
  position?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHighlightSection extends ISiteSectionBase {
  sectionKey: SiteSectionKey.Highlights;
}

export interface IVagoNowSection extends ISiteSectionBase {
  sectionKey: SiteSectionKey.VagoNow;
  content: string;
}

export interface ILeadershipSection extends ISiteSectionBase {
  sectionKey: SiteSectionKey.Leadership;
  position: string;
  bio?: string;
  photo?: string;
}

export interface ISiteSectionDocument extends ISiteSectionBase {
  // This is used for mapping. No longer extends Mongoose Document.
}

export type ISiteSection = IHighlightSection | IVagoNowSection | ILeadershipSection;

export interface SiteSectionFilter {
  sectionKey?: SiteSectionKey;
  search?: string;
  category?: string;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
  id?: string;
}

// Request Types
export type CreateSiteSectionRequest = Omit<ISiteSectionBase, 'id' | 'createdAt' | 'updatedAt'>;

export interface UpdateSiteSectionRequest {
  id: string;
  title?: string;
  description?: string;
  content?: string;
  bio?: string;
  image?: string;
  photo?: string;
  link?: string;
  position?: string;
  category?: string;
}

export interface DeleteSiteSectionRequest {
  id: string;
}

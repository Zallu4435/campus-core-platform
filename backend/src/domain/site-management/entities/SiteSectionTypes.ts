import { Document } from 'mongoose';

export enum SiteSectionKey {
  Highlights = 'highlights',
  VagoNow = 'vagoNow',
  Leadership = 'leadership',
}

export interface ISiteSectionBase {
  id?: string;
  sectionKey: SiteSectionKey;
  title?: string;
  description?: string;
  content?: string;
  bio?: string;
  image?: string;
  photo?: string;
  link?: string;
  position?: string;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IHighlightSection extends ISiteSectionBase {
  sectionKey: SiteSectionKey.Highlights;
  title: string;
  description: string;
  image?: string;
  link?: string;
  category?: string;
}

export interface IVagoNowSection extends ISiteSectionBase {
  sectionKey: SiteSectionKey.VagoNow;
  title: string;
  content: string;
  image?: string;
  link?: string;
  category?: string;
  description?: string; // Optional if needed for base compat
}

export interface ILeadershipSection extends ISiteSectionBase {
  sectionKey: SiteSectionKey.Leadership;
  title: string;
  position: string;
  bio?: string;
  photo?: string;
  link?: string;
  category?: string;
}

export interface ISiteSectionDocument extends Document {
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

export type ISiteSection = IHighlightSection | IVagoNowSection | ILeadershipSection;

export interface SiteSectionFilter {
  sectionKey?: SiteSectionKey;
  $or?: Array<{
    title?: { $regex: string; $options: string } | RegExp;
    description?: { $regex: string; $options: string } | RegExp;
    category?: { $regex: string; $options: string } | RegExp;
  }>;
  category?: string | { $regex: string; $options: string } | RegExp;
  isActive?: boolean;
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
  [key: string]: unknown;
}

// Request Types
export type CreateSiteSectionRequest = ISiteSection;

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

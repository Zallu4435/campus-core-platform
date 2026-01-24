import { IVideoBase } from "../../../domain/video/entities/VideoTypes";

export interface GetVideosRequestDTO {
    category?: string;
    page: number;
    limit: number;
    status?: string;
    search?: string;
    dateRange?: string;
    startDate?: string;
    endDate?: string;
}

export interface GetVideoByIdRequestDTO {
    id: string;
}

export interface CreateVideoRequestDTO extends Omit<IVideoBase, 'id' | 'uploadedAt'> {
    videoFile?: Express.Multer.File;
}

export interface UpdateVideoRequestDTO extends Partial<Omit<IVideoBase, 'uploadedAt'>> {
    id: string;
    videoFile?: Express.Multer.File;
    diplomaId?: string;
}

export interface DeleteVideoRequestDTO {
    id: string;
}
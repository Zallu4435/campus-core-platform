import { IVideoBase } from "../../../domain/video/entities/VideoTypes";
import { IFile } from "../../../domain/shared/types/FileTypes";

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
    videoFile?: IFile;
}

export interface UpdateVideoRequestDTO extends Partial<Omit<IVideoBase, 'uploadedAt'>> {
    id: string;
    videoFile?: IFile;
    diplomaId?: string;
}

export interface DeleteVideoRequestDTO {
    id: string;
}
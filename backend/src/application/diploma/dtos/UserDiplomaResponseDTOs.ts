import { DiplomaCourse, Chapter } from '../../../domain/diploma/types/DiplomaTypes';

export interface GetUserDiplomasResponseDTO {
    data: DiplomaCourse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export type GetUserDiplomaByIdResponseDTO = DiplomaCourse;

export type GetUserDiplomaChapterResponseDTO = Chapter;

export interface UpdateVideoProgressResponseDTO {
    message: string;
    progress: number;
}

export interface MarkChapterCompleteResponseDTO {
    message: string;
    completed: boolean;
}

export interface ToggleBookmarkResponseDTO {
    message: string;
    bookmarked: boolean;
}

export interface GetCompletedChaptersResponseDTO {
    chapters: string[];
}

export interface GetBookmarkedChaptersResponseDTO {
    chapters: string[];
}

export interface GetUserDiplomasRequestDTO {
    userId: string;
    page: number;
    limit: number;
    category?: string;
    status?: string;
    dateRange?: string;
}

export interface GetUserDiplomaByIdRequestDTO {
    id: string;
}

export interface GetUserDiplomaChapterRequestDTO {
    courseId: string;
    chapterId: string;
}

export interface UpdateVideoProgressRequestDTO {
    userId: string;
    courseId: string;
    chapterId: string;
    progress: number;
}

export interface MarkChapterCompleteRequestDTO {
    userId: string;
    courseId: string;
    chapterId: string;
}

export interface ToggleBookmarkRequestDTO {
    userId: string;
    courseId: string;
    chapterId: string;
}

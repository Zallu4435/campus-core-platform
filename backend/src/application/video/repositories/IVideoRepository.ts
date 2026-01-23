import { Video, VideoFilter } from "../../../domain/video/entities/Video";

export interface IRepoDiploma {
    _id?: string;
    title: string;
    description: string;
    price: number;
    category: string;
    thumbnail: string;
    duration: string;
    prerequisites: string[];
    status: boolean;
    createdAt: Date;
    updatedAt: Date;
    videoIds: string[];
    students?: string[];
}

export interface IVideoRepository {
    findVideos(query: VideoFilter, page: number, limit: number): Promise<Video[]>;
    countVideos(query: VideoFilter): Promise<number>;
    findDiplomaByCategory(category: string): Promise<IRepoDiploma | null>;
    getVideoById(id: string): Promise<Video | null>;
    createVideo(video: Partial<Video>): Promise<Video>;
    updateVideo(id: string, video: Partial<Video>): Promise<Video | null>;
    deleteVideo(id: string): Promise<void>;
    findDiplomaById(id: string): Promise<IRepoDiploma | null>;
    addVideoToDiploma(diplomaId: string, videoId: string): Promise<void>;
    removeVideoFromDiploma(diplomaId: string, videoId: string): Promise<void>;
}
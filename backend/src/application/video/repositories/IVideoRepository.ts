import { Video, VideoFilter } from "../../../domain/video/entities/Video";
import { IDiplomaInfo } from "../../../domain/video/entities/VideoTypes";

// If IRepoDiploma is significant, we should define a Domain Entity for Diploma or use IDiplomaInfo
// For now, mapping to a structured type that fits the Domain or a specialized DTO for repo interaction
export interface RepoDiplomaInfo {
    _id?: string;
    title: string;
    category: string;
    videoIds: string[];
}

export interface IVideoRepository {
    findVideos(query: VideoFilter, page: number, limit: number): Promise<Video[]>;
    countVideos(query: VideoFilter): Promise<number>;
    findDiplomaByCategory(category: string): Promise<RepoDiplomaInfo | null>;
    getVideoById(id: string): Promise<Video | null>;
    createVideo(video: Partial<Video>): Promise<Video>;
    updateVideo(id: string, video: Partial<Video>): Promise<Video | null>;
    deleteVideo(id: string): Promise<void>;
    findDiplomaById(id: string): Promise<RepoDiplomaInfo | null>;
    addVideoToDiploma(diplomaId: string, videoId: string): Promise<void>;
    removeVideoFromDiploma(diplomaId: string, videoId: string): Promise<void>;
}
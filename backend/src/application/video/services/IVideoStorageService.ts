export interface IVideoStorageService {
    uploadVideo(filePath: string): Promise<string>;
    deleteVideo(videoUrl: string): Promise<void>;
}

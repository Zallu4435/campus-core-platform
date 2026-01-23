import { IVideoStorageService } from "../../../application/video/services/IVideoStorageService";
import { cloudinary } from "../../../config/cloudinary.config";
import { VideoConstants } from "../../../application/video/constants/VideoConstants";
import { VideoUploadError } from "../../../domain/video/errors/VideoErrors";
import Logger from "../../../shared/utils/logger";

export class VideoStorageService implements IVideoStorageService {
    async uploadVideo(filePath: string): Promise<string> {
        try {
            const result = await cloudinary.uploader.upload(filePath, {
                resource_type: VideoConstants.Upload.RESOURCE_TYPE,
                folder: VideoConstants.Upload.FOLDER_VIDEOS,
                quality: 'auto',
                timeout: VideoConstants.Upload.TIMEOUT
            });
            return result.secure_url;
        } catch (error) {
            Logger.error('Cloudinary upload error:', error);
            throw new VideoUploadError();
        }
    }

    async deleteVideo(videoUrl: string): Promise<void> {
        try {
            const publicId = videoUrl.split('/').pop()?.split('.')[0];
            if (publicId) {
                await cloudinary.uploader.destroy(publicId, {
                    resource_type: VideoConstants.Upload.RESOURCE_TYPE
                });
            }
        } catch (error) {
            Logger.error('Cloudinary delete error:', error);
            // We might not want to throw here to allow data cleanup to proceed, 
            // or we could throw a non-critical error.
            // For now, logging effectively handles "cleanup" failure without blocking DB delete.
        }
    }
}

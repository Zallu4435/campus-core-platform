import { IVideoStorageService } from "../../../application/video/services/IVideoStorageService";
import { cloudinary } from "../../../config/cloudinary.config";
import { VideoConstants } from "../../../application/video/constants/VideoConstants";
import { VideoUploadError } from "../../../domain/video/errors/VideoErrors";
import Logger from "../../../shared/utils/logger";

export class VideoStorageService implements IVideoStorageService {
    async uploadVideo(filePath: string): Promise<string> {
        // This method is now redundant for the main flow as Multer handles the upload,
        // but kept for compatibility or manual uploads if needed.
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
            throw new VideoUploadError("Failed to upload video");
        }
    }

    async deleteVideo(videoUrl: string): Promise<void> {
        try {
            // Extract public ID from URL
            // Format: https://res.cloudinary.com/<cloud_name>/video/upload/v<version>/<public_id>.<extension>
            // or without version: .../upload/<public_id>.<extension>

            // Regex to capture everything after 'upload/' (and optional version) until the file extension
            const regex = /\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/;
            const match = videoUrl.match(regex);

            if (match && match[1]) {
                const publicId = match[1];
                Logger.info(`🗑️ Deleting video from Cloudinary. Public ID: ${publicId}`);

                const result = await cloudinary.uploader.destroy(publicId, {
                    resource_type: VideoConstants.Upload.RESOURCE_TYPE
                });

                Logger.info(`✅ Cloudinary deletion result: ${JSON.stringify(result)}`);
            } else {
                Logger.warn(`⚠️ Could not extract public ID from URL: ${videoUrl}`);
            }
        } catch (error) {
            Logger.error('❌ Cloudinary delete error:', error);
            // Non-blocking error for DB operations, but logged for manual cleanup
        }
    }
}

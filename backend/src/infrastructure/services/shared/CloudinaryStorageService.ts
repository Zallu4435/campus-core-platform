import { Readable } from "stream";
import { v2 as cloudinary } from "cloudinary";
import axios from "axios";
import { IStorageService } from "../../../application/shared/services/IStorageService";
import { config } from "../../../config/config";

/**
 * Concrete implementation using Cloudinary and Axios
 */
export class CloudinaryStorageService implements IStorageService {
    constructor() {
        cloudinary.config({
            cloud_name: config.cloudinary.cloudName,
            api_key: config.cloudinary.apiKey,
            api_secret: config.cloudinary.apiSecret,
        });
    }

    generateSignedUrl(publicId: string, options: Record<string, unknown> = {}): string {
        console.log(`🔗 [Storage] Generating signed URL for: ${publicId}`, options);
        const url = cloudinary.url(publicId, {
            secure: true,
            sign_url: true,
            ...(options as any)
        });
        console.log(`🔗 [Storage] Generated URL: ${url}`);
        return url;
    }

    async fetchFileAsBuffer(url: string): Promise<Buffer> {
        console.log(`📥 [Storage] Fetching file from: ${url}`);
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    }

    async fetchFileAsStream(url: string): Promise<Readable> {
        console.log(`📥 [Storage] Fetching stream from: ${url}`);
        const response = await axios.get(url, { responseType: 'stream' });
        return response.data;
    }

    getPublicIdFromUrl(url: string): { publicId: string; resourceType: string } {
        console.log(`🔍 [Storage] Parsing public ID from: ${url}`);
        // Regex to capture resource_type and public_id
        // Format: .../cloud_name/<resource_type>/upload/v<version>/<public_id>.<extension>
        const regex = /\/([^/]+)\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/;
        const match = url.match(regex);

        if (match && match[1] && match[2]) {
            console.log(`✅ [Storage] Parsed: resourceType=${match[1]}, publicId=${match[2]}`);
            return {
                resourceType: match[1],
                publicId: match[2]
            };
        }

        console.warn(`⚠️ [Storage] Failed to parse URL: ${url}`);
        return { publicId: '', resourceType: 'image' };
    }

    async deleteFile(url: string): Promise<void> {
        try {
            const { publicId, resourceType } = this.getPublicIdFromUrl(url);

            if (publicId) {
                console.log(`🗑️ [Storage] Deleting file from Cloudinary. Public ID: ${publicId}, Type: ${resourceType}`);
                await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
                console.log(`✅ [Storage] Deletion successful for: ${publicId}`);
            } else {
                console.warn(`⚠️ [Storage] Could not extract public ID from URL: ${url}`);
            }
        } catch (error) {
            console.error('❌ [Storage] Delete error:', error);
        }
    }
}

export const storageService = new CloudinaryStorageService();

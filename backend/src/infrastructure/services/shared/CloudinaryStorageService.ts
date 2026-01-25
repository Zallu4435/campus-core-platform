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
        return cloudinary.url(publicId, {
            secure: true,
            sign_url: true,
            ...(options as any)
        });
    }

    async fetchFileAsBuffer(url: string): Promise<Buffer> {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    }

    async fetchFileAsStream(url: string): Promise<Readable> {
        const response = await axios.get(url, { responseType: 'stream' });
        return response.data;
    }

    getPublicIdFromUrl(url: string): string {
        // Logic extracted from existing code
        const urlParts = url.split('/');
        return urlParts.slice(-2).join('/').replace(/\.[^/.]+$/, '');
    }
}

export const storageService = new CloudinaryStorageService();

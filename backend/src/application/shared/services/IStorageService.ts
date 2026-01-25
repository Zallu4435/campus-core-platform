
import { Readable } from 'stream';

export interface IStorageService {
    /**
     * Generates a signed URL for viewing/downloading a file
     */
    generateSignedUrl(publicId: string, options?: Record<string, unknown>): string;

    /**
     * Fetches file data as a Buffer
     */
    fetchFileAsBuffer(url: string): Promise<Buffer>;

    /**
     * Fetches file data as a Stream
     */
    fetchFileAsStream(url: string): Promise<Readable>;

    /**
     * Extracts public ID from a storage URL
     */
    getPublicIdFromUrl(url: string): string;
}

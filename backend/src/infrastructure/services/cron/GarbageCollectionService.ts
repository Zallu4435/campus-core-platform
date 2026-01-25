import cron from 'node-cron';
import { v2 as cloudinary } from 'cloudinary';
import { AdmissionDraft } from '../../database/mongoose/admission/AdmissionDraftModel';
import { Admission } from '../../database/mongoose/admission/AdmissionModel';
import Logger from '../../../shared/utils/logger';
import { config } from '../../../config/config';

export class GarbageCollectionService {
    private static readonly JOB_SCHEDULE = '0 3 * * *'; // Run at 3:00 AM every day
    private static readonly FOLDER_NAME = 'admission-documents';
    private static readonly MAX_AGE_HOURS = 24;

    public static initialize(): void {
        if (process.env.NODE_ENV === 'test') return;

        Logger.info(`[GarbageCollection] Initializing Admission GC Service. Schedule: ${this.JOB_SCHEDULE}`);

        // Configure Cloudinary (re-using config/defaults if not globally set, though it should be by app init)
        cloudinary.config({
            cloud_name: config.cloudinary.cloudName,
            api_key: config.cloudinary.apiKey,
            api_secret: config.cloudinary.apiSecret,
        });

        cron.schedule(this.JOB_SCHEDULE, async () => {
            try {
                await this.runCleanup();
            } catch (error) {
                Logger.error('[GarbageCollection] Error during cleanup cycle:', error);
            }
        });
    }

    private static async runCleanup(): Promise<void> {
        Logger.info('[GarbageCollection] Starting cleanup of orphaned admission documents...');
        const startTime = Date.now();

        try {
            // 1. Fetch all resources from Cloudinary folder
            const cloudinaryResources = await this.fetchCloudinaryResources();
            Logger.info(`[GarbageCollection] Found ${cloudinaryResources.length} files in Cloudinary folder: ${this.FOLDER_NAME}`);

            if (cloudinaryResources.length === 0) {
                Logger.info('[GarbageCollection] No files found in Cloudinary. Cleanup complete.');
                return;
            }

            // 2. Filter for files older than 24 hours
            const cutoffTime = new Date(Date.now() - this.MAX_AGE_HOURS * 60 * 60 * 1000);
            const staleResources = cloudinaryResources.filter(res => new Date(res.created_at) < cutoffTime);
            Logger.info(`[GarbageCollection] Found ${staleResources.length} stale files (older than ${this.MAX_AGE_HOURS} hours).`);

            if (staleResources.length === 0) {
                Logger.info('[GarbageCollection] No stale files found. Cleanup complete.');
                return;
            }

            // 3. Fetch all valid document URLs from MongoDB
            const validUrls = await this.fetchAllValidUrls();
            Logger.info(`[GarbageCollection] Found ${validUrls.size} valid document URLs in database.`);

            // 4. Identify orphans
            const orphans = staleResources.filter(res => !validUrls.has(res.secure_url));
            Logger.info(`[GarbageCollection] Identified ${orphans.length} orphaned files to delete.`);

            if (orphans.length > 0) {
                // 5. Bulk Delete
                const publicIds = orphans.map(o => o.public_id);
                const result = await cloudinary.api.delete_resources(publicIds);
                Logger.info(`[GarbageCollection] Deletion result: ${JSON.stringify(result)}`);
            }

            const duration = (Date.now() - startTime) / 1000;
            Logger.info(`[GarbageCollection] Cleanup finished in ${duration}s. Deleted ${orphans.length} files.`);

        } catch (error) {
            Logger.error('[GarbageCollection] Fatal error during cleanup execution:', error);
            throw error;
        }
    }

    private static async fetchCloudinaryResources(): Promise<Array<{ public_id: string; created_at: string; secure_url: string }>> {
        let resources: Array<{ public_id: string; created_at: string; secure_url: string }> = [];
        let nextCursor = null;

        do {
            const result = await cloudinary.api.resources({
                type: 'upload',
                prefix: this.FOLDER_NAME,
                max_results: 500,
                next_cursor: nextCursor,
            });

            resources = resources.concat(result.resources);
            nextCursor = result.next_cursor;
        } while (nextCursor);

        return resources;
    }

    private static async fetchAllValidUrls(): Promise<Set<string>> {
        const validUrls = new Set<string>();

        /* 
           Scanning AdmissionDrafts 
           The 'documents' field is stored as an object, often like:
           {
             documents: [ { url: '...', ... }, { url: '...', ... } ]
           }
           or sometimes dynamic keys. We need to be aggressive in extracting URLs.
        */
        const drafts = await AdmissionDraft.find({}, { documents: 1 }).lean();
        for (const draft of drafts) {
            this.extractUrlsRecursively(draft.documents, validUrls);
        }

        /* Scanning Admissions */
        const admissions = await Admission.find({}, { documents: 1 }).lean();
        for (const admission of admissions) {
            this.extractUrlsRecursively(admission.documents, validUrls);
        }

        return validUrls;
    }

    private static extractUrlsRecursively(obj: unknown, collected: Set<string>): void {
        if (!obj) return;

        if (typeof obj === 'string') {
            if (obj.includes('cloudinary.com') && obj.startsWith('http')) {
                collected.add(obj);
            }
            return;
        }

        if (Array.isArray(obj)) {
            for (const item of obj) {
                this.extractUrlsRecursively(item, collected);
            }
            return;
        }

        if (typeof obj === 'object') {
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    // Common key patterns for URLs
                    if (key === 'url' || key === 'secure_url' || key === 'fileUrl' || key === 'cloudinaryUrl') {
                        const val = obj[key];
                        if (typeof val === 'string' && val.includes('cloudinary.com')) {
                            collected.add(val);
                        }
                    } else {
                        this.extractUrlsRecursively(obj[key], collected);
                    }
                }
            }
        }
    }
}

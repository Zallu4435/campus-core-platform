
import { GarbageCollectionService } from './GarbageCollectionService';
import Logger from '../../../shared/utils/logger';

export class CronManager {
    public static initializeAll(): void {
        Logger.info('⏳ Initializing Cron Jobs...');

        // Register all cron jobs here
        GarbageCollectionService.initialize();

        // Example: SubscriptionRenewalService.initialize();
        // Example: EmailDigestService.initialize();

        Logger.info('✅ All Cron Jobs Initialized');
    }
}

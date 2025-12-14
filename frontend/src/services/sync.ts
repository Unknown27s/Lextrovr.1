import { offlineService } from './offline';
import { localStorageApi } from '../api/client';

class SyncService {
    private isSyncing = false;
    private syncInterval: NodeJS.Timeout | null = null;

    async init(): Promise<void> {
        await offlineService.init();

        // Check connectivity and sync if online
        window.addEventListener('online', () => this.syncQueue());
        window.addEventListener('offline', () => console.log('📡 Offline mode'));

        // Try to sync periodically
        this.syncInterval = setInterval(() => {
            if (navigator.onLine) {
                this.syncQueue();
            }
        }, 30000); // Every 30 seconds

        console.log('✅ Sync service initialized');
    }

    async syncQueue(): Promise<void> {
        if (this.isSyncing) return;

        this.isSyncing = true;

        try {
            const queue = await offlineService.getQueue();

            if (queue.length === 0) {
                this.isSyncing = false;
                return;
            }

            console.log(`🔄 Syncing ${queue.length} items...`);

            for (const item of queue) {
                try {
                    await this.processQueueItem(item);
                    await offlineService.removeFromQueue(item.id);
                    console.log(`✅ Synced: ${item.action}`);
                } catch (error) {
                    // Update attempts
                    await offlineService.updateQueueItem(item.id, {
                        attempts: item.attempts + 1,
                    });

                    // Remove if max attempts reached
                    if (item.attempts >= item.maxAttempts) {
                        console.error(`❌ Max attempts reached for: ${item.id}`);
                        await offlineService.removeFromQueue(item.id);
                    }
                }
            }

            console.log('✅ Sync completed');
        } catch (error) {
            console.error('❌ Sync error:', error);
        } finally {
            this.isSyncing = false;
        }
    }

    private async processQueueItem(item: any): Promise<void> {
        // Since we're using localStorage now, all operations are instant
        // This method is kept for offline queue processing compatibility
        switch (item.action) {
            case 'save_vocab':
                localStorageApi.saveVocab(item.data.vocab_item_id, item.data.vocab_item, item.data.status);
                break;

            case 'update_status': {
                // Update status in localStorage
                const userVocab = localStorageApi.getUserVocab();
                const vocabItem = userVocab.find((uv: any) => uv.id === item.data.user_vocab_id);
                if (vocabItem) {
                    vocabItem.status = item.data.status;
                    localStorage.setItem('userVocab', JSON.stringify(userVocab));
                }
                break;
            }

            case 'remove_vocab':
                localStorageApi.removeVocab(item.data.user_vocab_id);
                break;

            default:
                console.warn(`Unknown action: ${item.action}`);
        }
    }

    async addToSyncQueue(action: string, data: any): Promise<void> {
        await offlineService.addToQueue(action, data);

        if (navigator.onLine) {
            // Sync immediately if online
            await this.syncQueue();
        }
    }

    destroy(): void {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
    }
}

export const syncService = new SyncService();

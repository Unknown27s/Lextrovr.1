import Dexie, { Table } from 'dexie';

interface SyncQueueItem {
    id: string;
    action: string;
    data: any;
    timestamp: number;
    attempts: number;
    maxAttempts: number;
}

interface CachedVocabFeed {
    cursor: string;
    items: any[];
    timestamp: number;
    expiresAt: number;
}

interface OfflineDB extends Dexie {
    syncQueue: Table<SyncQueueItem>;
    vocabCache: Table<CachedVocabFeed>;
    userVocabLocal: Table<any>;
}

class OfflineService {
    private db: OfflineDB | null = null;

    async init() {
        if (this.db) return;

        try {
            const db = new Dexie('AuthorCompanion') as OfflineDB;

            db.version(1).stores({
                syncQueue: 'id, timestamp',
                vocabCache: 'cursor, timestamp',
                userVocabLocal: 'id, vocab_item_id'
            });

            this.db = db;

            console.log('✅ Offline database initialized');
        } catch (error) {
            console.error('Failed to initialize offline DB:', error);
        }
    }

    // Sync queue operations
    async addToQueue(action: string, data: any): Promise<void> {
        if (!this.db) await this.init();

        const item: SyncQueueItem = {
            id: `${action}-${Date.now()}`,
            action,
            data,
            timestamp: Date.now(),
            attempts: 0,
            maxAttempts: 3,
        };

        await this.db?.add('syncQueue', item);
    }

    async getQueue(): Promise<SyncQueueItem[]> {
        if (!this.db) await this.init();
        return (await this.db?.getAll('syncQueue')) || [];
    }

    async removeFromQueue(id: string): Promise<void> {
        if (!this.db) await this.init();
        await this.db?.delete('syncQueue', id);
    }

    async updateQueueItem(id: string, updates: Partial<SyncQueueItem>): Promise<void> {
        if (!this.db) await this.init();

        const item = await this.db?.get('syncQueue', id);
        if (item) {
            await this.db?.put('syncQueue', { ...item, ...updates });
        }
    }

    // Cache operations
    async cacheVocabFeed(cursor: string, items: any[], ttlSeconds = 3600): Promise<void> {
        if (!this.db) await this.init();

        const cached: CachedVocabFeed = {
            cursor,
            items,
            timestamp: Date.now(),
            expiresAt: Date.now() + ttlSeconds * 1000,
        };

        await this.db?.put('vocabCache', cached);
    }

    async getCachedVocabFeed(cursor?: string): Promise<CachedVocabFeed | undefined> {
        if (!this.db) await this.init();

        const key = cursor || 'initial';
        const cached = await this.db?.get('vocabCache', key);

        if (cached && cached.expiresAt > Date.now()) {
            return cached;
        }

        return undefined;
    }

    async clearExpiredCache(): Promise<void> {
        if (!this.db) await this.init();

        const allCached = await this.db?.getAll('vocabCache');
        const now = Date.now();

        if (allCached) {
            for (const item of allCached) {
                if (item.expiresAt < now) {
                    await this.db?.delete('vocabCache', item.cursor);
                }
            }
        }
    }

    // User vocab local
    async saveUserVocabLocal(userVocab: any): Promise<void> {
        if (!this.db) await this.init();
        await this.db?.put('userVocabLocal', userVocab);
    }

    async getUserVocabLocal(): Promise<any[]> {
        if (!this.db) await this.init();
        return (await this.db?.getAll('userVocabLocal')) || [];
    }

    async clearDatabase(): Promise<void> {
        if (!this.db) await this.init();
        await this.db?.clear('syncQueue');
        await this.db?.clear('vocabCache');
        await this.db?.clear('userVocabLocal');
    }
}

export const offlineService = new OfflineService();

/**
 * Offline Sync Service
 * Handles local data persistence and syncing
 */

export interface SyncQueue {
    id: string;
    action: 'save' | 'delete' | 'update';
    data: any;
    timestamp: number;
    synced: boolean;
}

const SYNC_QUEUE_KEY = 'syncQueue';
const LAST_SYNC_KEY = 'lastSyncTime';

export const offlineSyncService = {
    /**
     * Add action to sync queue
     */
    queueAction: (action: 'save' | 'delete' | 'update', data: any): SyncQueue => {
        const item: SyncQueue = {
            id: `sync_${Date.now()}`,
            action,
            data,
            timestamp: Date.now(),
            synced: false,
        };

        const queue = getSyncQueue();
        queue.push(item);
        localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));

        return item;
    },

    /**
     * Get pending sync actions
     */
    getPendingActions: (): SyncQueue[] => {
        const queue = getSyncQueue();
        return queue.filter((item) => !item.synced);
    },

    /**
     * Mark actions as synced
     */
    markAsSynced: (ids: string[]): void => {
        const queue = getSyncQueue();
        const updated = queue.map((item) =>
            ids.includes(item.id) ? { ...item, synced: true } : item
        );
        localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(updated));
    },

    /**
     * Clear synced items
     */
    clearSyncedItems: (): void => {
        const queue = getSyncQueue();
        const filtered = queue.filter((item) => !item.synced);
        localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(filtered));
    },

    /**
     * Get last sync time
     */
    getLastSyncTime: (): number => {
        const stored = localStorage.getItem(LAST_SYNC_KEY);
        return stored ? parseInt(stored) : 0;
    },

    /**
     * Update last sync time
     */
    updateLastSyncTime: (): void => {
        localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
    },

    /**
     * Check if offline
     */
    isOffline: (): boolean => {
        return !navigator.onLine;
    },

    /**
     * Setup online/offline listeners
     */
    setupListeners: (
        onOnline: () => void,
        onOffline: () => void
    ): (() => void) => {
        const handleOnline = () => {
            console.log('🔗 Back online');
            onOnline();
        };

        const handleOffline = () => {
            console.log('🔗 Gone offline');
            onOffline();
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    },

    /**
     * Get offline stats
     */
    getStats: () => {
        const queue = getSyncQueue();
        const pending = queue.filter((item) => !item.synced);
        const synced = queue.filter((item) => item.synced);

        return {
            totalActions: queue.length,
            pendingActions: pending.length,
            syncedActions: synced.length,
            isOnline: navigator.onLine,
            lastSyncTime: offlineSyncService.getLastSyncTime(),
        };
    },

    /**
     * Clear all sync data
     */
    clearAllData: (): void => {
        localStorage.removeItem(SYNC_QUEUE_KEY);
        localStorage.removeItem(LAST_SYNC_KEY);
    },
};

/**
 * Helper: Get all sync queue items
 */
const getSyncQueue = (): SyncQueue[] => {
    const stored = localStorage.getItem(SYNC_QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
};

import { PushNotifications } from '@capacitor/push-notifications';

export interface NotificationPayload {
    title: string;
    body: string;
    data?: {
        type: string;
        vocab_item_id?: string;
        [key: string]: any;
    };
}

class PushNotificationService {
    async init(): Promise<void> {
        try {
            // Request permission
            let permStatus = await PushNotifications.checkPermissions();

            if (permStatus.receive === 'prompt') {
                permStatus = await PushNotifications.requestPermissions();
            }

            if (permStatus.receive !== 'granted') {
                console.warn('❌ Push notification permission not granted');
                return;
            }

            // Register with FCM
            await PushNotifications.register();
            console.log('✅ Push notifications registered');

            // Get the token
            const token = await PushNotifications.getDeliveredNotifications();
            console.log('📱 Notifications token:', token);

            // Listen for notifications
            PushNotifications.addListener('registration', (token) => {
                console.log('Push registration token:', token.value);
                // Send this token to backend
                this.sendTokenToBackend(token.value);
            });

            PushNotifications.addListener('pushNotificationReceived', (notification) => {
                console.log('📬 Push notification received:', notification);
                this.handleNotification(notification);
            });

            PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
                console.log('🔔 Push notification action:', notification);
                this.handleNotificationTap(notification);
            });
        } catch (error) {
            console.error('❌ Failed to initialize push notifications:', error);
        }
    }

    private sendTokenToBackend(token: string): void {
        // Send to backend via API
        fetch('http://localhost:3000/push/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            },
            body: JSON.stringify({
                token,
                platform: 'android',
            }),
        }).catch((err) => console.error('Failed to register push token:', err));
    }

    private handleNotification(notification: any): void {
        console.log('Handling notification:', notification);
        // Update UI, show toast, etc.
    }

    private handleNotificationTap(notification: any): void {
        const data = notification.notification.data;

        if (data?.type === 'daily_word' && data?.vocab_item_id) {
            // Navigate to vocab item
            window.location.hash = `/vocab/${data.vocab_item_id}`;
        }
    }

    async requestDailyNotifications(): Promise<void> {
        try {
            // In a PWA, use service worker; in Android, handled by backend
            console.log('Daily notifications enabled');
        } catch (error) {
            console.error('Failed to enable daily notifications:', error);
        }
    }
}

export const pushNotificationService = new PushNotificationService();

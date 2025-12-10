import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.authorcompanion.app',
    appName: 'Author Vocabulary Companion',
    webDir: 'dist',
    server: {
        androidScheme: 'https',
    },
    plugins: {
        PushNotifications: {
            presentationOption: 'toast',
        },
        SplashScreen: {
            launchShowDuration: 0,
        },
    },
};

export default config;

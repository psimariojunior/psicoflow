import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.psihumanis.app',
  appName: 'PsiHumanis',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    url: 'https://psihumanis.com.br',
    cleartext: false,
    allowNavigation: ['*'],
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1500,
      backgroundColor: '#2563EB',
      showSpinner: true,
      spinnerColor: '#FFFFFF',
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#2563EB',
    },
    Keyboard: {
      resize: 'body',
      style: 'DARK',
    },
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#2563EB',
  },
};

export default config;

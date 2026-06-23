import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.psicoflow.app',
  appName: 'PsicoFlow',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    url: 'https://psicoflow-iota.vercel.app',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#2563EB',
      showSpinner: true,
      spinnerColor: '#FFFFFF',
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
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
    allowMixedContent: false,
    backgroundColor: '#2563EB',
  },
};

export default config;

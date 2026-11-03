import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gutta.gdc3',
  appName: 'GDC 3.0',
  webDir: 'dist/frontend/browser',
  server: { androidScheme: 'https' },
  plugins: {
    CapacitorSQLite: {
      androidIsEncryption: true,
      androidBiometric: { biometricAuth: false }
    }
  }
};

export default config;

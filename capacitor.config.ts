import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.loginapp',
  appName: 'LoginApp',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;

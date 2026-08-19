import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pulse.invest',
  appName: 'Pulse',
  webDir: 'public',
  server: {
    url: process.env.CAPACITOR_SERVER_URL || 'https://pulse-invest-97w2cvmjt-lancegumunyu-droids-projects.vercel.app',
    cleartext: false,
  },
};

export default config;

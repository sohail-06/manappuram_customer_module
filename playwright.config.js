// const { defineConfig } = require('@playwright/test');

// module.exports = defineConfig({
//   testDir: './tests',
//   timeout: 60 * 1000,

//   expect: {
//     timeout: 5000,
//   },

//   fullyParallel: false,
//   workers: 1,

//   reporter: [['html', { open: 'never' }]],

//   projects: [
//     {
//       name: 'Chrome (Installed)',
//       use: {
//         browserName: 'chromium',
//         channel: 'chrome',
//         headless: false,
//         slowMo: 800,

//         // ✅ AUTO‑ALLOW CAMERA & MIC
//         permissions: ['camera', 'microphone'],

//         launchOptions: {
//           args: [
//            // auto‑click Allow
//             '--use-fake-device-for-media-stream', // fake camera device
//           ],
//         },

//         CUSTOMER_APP_URL: 'https://uatonpay.manappuram.com/hyperverge/#/login',
//         CGL_APP_URL: 'https://uatonpay.manappuram.com/cglvapt/index.html',

//         credentials: {
//           customerEmployeeId: '406653',
//           customerPassword: 'soft1234',
//           CGL_employeeId: '98118',
//           CGL_employeePassword: 'soft1234',
//         },
//       },
//     },
//   ],
// });

import { defineConfig } from '@playwright/test';
import path from 'path';

export default defineConfig({
  globalSetup: './global-setup.js',
  testDir: './tests',

  // ✅ ABSOLUTE path to global-setup.js
  globalSetup: path.resolve(__dirname, 'global-setup.js'),

  use: {
    storageState: 'loginState.json',
    headless: false,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  workers: 1,

  projects: [
    {
      name: 'firefox',
      use: {
        browserName: 'firefox',
        channel: 'firefox',
      },
    },
  ],
}); 
const { chromium } = require('@playwright/test');
const fs = require('fs');

module.exports = async () => {
  const browser = await chromium.launch({ headless: true });

  if (!fs.existsSync('./storage')) {
    fs.mkdirSync('./storage');
  }

  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();

  page.setDefaultTimeout(60000);

  await page.goto(
    'https://uatonpay.manappuram.com/cglvapt/index.html',
    { waitUntil: 'domcontentloaded' }
  );

  await page.waitForSelector('#employeeId');

  await page.fill('#employeeId', '98118');
  await page.fill('#password', 'soft1234');

  await page.click('button:has-text("Login")');

  await page.waitForLoadState('domcontentloaded');

  await context.storageState({
    path: 'storage/cgl-state.json',
  });

  console.log('✅ CGL state saved');

  await browser.close();
};
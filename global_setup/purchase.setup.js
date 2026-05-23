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
    'https://uatapp.manappuram.net/purchase/Login.aspx',
    { waitUntil: 'domcontentloaded' }
  );

  await page.waitForSelector('input[placeholder="Username"]');

  await page.getByPlaceholder('Username').fill('50292');
  await page.getByPlaceholder('Password').fill('soft1234');

  page.on('dialog', async dialog => {
    await dialog.accept();
  });

  await page.getByRole('button', { name: /login|sign in/i }).click();

  await page.waitForURL(/Index\/Index\.aspx/i);

  await context.storageState({
    path: 'storage/purchase-state.json',
  });

  console.log('✅ Purchase state saved');

  await browser.close();
};
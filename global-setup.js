import { chromium, expect } from '@playwright/test';

export default async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // ✅ Handle any alerts immediately
  page.on('dialog', async dialog => {
    console.log('✅ Alert:', dialog.message());
    await dialog.accept();
  });

  await page.goto(
    'https://uatapp.manappuram.net/purchase/Login.aspx',
    { waitUntil: 'domcontentloaded' }
  );

  // ✅ Fill credentials
  await page.locator('input[placeholder="Username"]').fill('50292');
  await page.locator('input[placeholder="Password"]').fill('soft1234');

  // ✅ SAFEST selector for ASP.NET Login
  const loginButton = page.getByRole('button', { name: 'Sign In' });

  // ✅ Wait until clickable
  await expect(loginButton).toBeVisible({ timeout: 30000 });

  // ✅ Force click (required for ASP.NET)
  await loginButton.click({ force: true });

  // ✅ Wait for dashboard element (NOT page load)
  // await page.getByRole('link', { name: 'VENDOR MANAGEMENT' })
  //   .waitFor({ timeout: 30000 });

  // ✅ Verify URL changed
  await expect(page).toHaveURL(/Index\/Index\.aspx/i);

  // ✅ Save session
  await context.storageState({ path: 'loginState.json' });

  await browser.close();
  console.log('✅ global-setup completed successfully');
};
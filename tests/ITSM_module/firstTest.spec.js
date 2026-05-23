import { test, expect } from '@playwright/test';

test('ITSM TOOL - Incident Creation', async ({ page }) => {

  // ✅ Handle popup BEFORE clicking Submit
  let ticketNumber = '';

  page.on('dialog', async dialog => {
    const message = dialog.message();
    console.log('✅ Popup Message:', message);

    // ✅ Extract ticket number from popup text
    const match = message.match(/IN\d+/);
    if (match) {
      ticketNumber = match[0];
      console.log('✅ Extracted Ticket:', ticketNumber);
    }

    await dialog.accept(); // ✅ Click OK
  });

  // ✅ Open application
  await page.goto('https://uatapp.manappuram.net/ITSM_NEW/Login.aspx', {
    waitUntil: 'domcontentloaded'
  });

  // ✅ Login
  await page.locator('#password').waitFor();
  await page.locator('input[placeholder="Username"]').fill('370261');
  await page.locator('#password').fill('soft1234');
  await page.getByRole('button', { name: 'SIGN IN' }).click();

  await expect(page).not.toHaveURL(/Login.aspx/);

  // ✅ Navigate
  await page.getByRole('link', { name: 'TICKET MANAGEMENT' }).click();
  await page.getByRole('link', { name: 'INCIDENT CREATION' }).click();

  await expect(page.getByRole('heading', { name: 'INCIDENT CREATION' })).toBeVisible();

  // ✅ Fill form
  await page.getByLabel('Person').check({ force: true });

  await page.locator('#txt_Empcode').fill('377228');
  await page.locator('#btnempcode').click();

  await page.locator('#txt_Email').fill('377228@manappuram.com');

  await page.locator('#ddlImpact').selectOption('1');
  await page.locator('#ddlClassification').selectOption('121');

  // ✅ Wait for subcategory load
  await page.waitForFunction(() => {
    const el = document.querySelector('#ddlsubCategory');
    return el && el.options.length > 1;
  });

  await page.locator('#ddlsubCategory').selectOption('151');
  await page.locator('#ddlSeverity').selectOption('1');

  await page.locator('#txt_Subject').fill('ITSM incident ticket creation');
  await page.locator('#txt_Description').fill(
    'Ticketing software allows organizations to resolve internal IT issues efficiently.'
  );

  console.log('✅ Form filled successfully');

  // ✅ Click Submit (popup will trigger here)
  await page.getByRole('button', { name: 'Submit' }).click();

  // ✅ Wait a moment to ensure dialog handled
  await page.waitForTimeout(2000);

  // ✅ Validate ticket number
  expect(ticketNumber).toMatch(/^IN\d+$/);

  console.log('✅ Final Ticket Number:', ticketNumber);

  // ✅ Screenshot after submit
  await page.screenshot({ path: 'ticket-created.png' });

});
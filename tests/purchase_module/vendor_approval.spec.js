import { test,expect } from '@playwright/test';
import { type } from 'node:os';

const INDEX_URL = 'https://uatapp.manappuram.net/purchase/Index/Index.aspx';

test.describe.serial('Vendor Management approval Flow', () => {

  test.skip('Test-1: Site approval – vendor first, then site', async ({ page }) => {

    await page.goto(INDEX_URL);

    // Navigate
    await page.getByRole('link', { name: 'VENDOR MANAGEMENT' }).click();
    await page
      .locator('//a[@href="../Purchase/VendorManagmnt.aspx?frmid=2"]')
      .click();

    // Open Site tab
    await page.getByRole('tab', { name: 'Site' }).click();

    /* ✅ STEP 1: WAIT UNTIL VENDOR DROPDOWN IS POPULATED */
    await page.waitForFunction(() => {
      const ddl = document.querySelector('#ddlVendor1');
      return ddl && ddl.options && ddl.options.length > 1;
    }, { timeout: 30000 });

    /* ✅ STEP 2: SELECT VENDOR (PARTIAL MATCH) */
    await page.evaluate(() => {
      const vendorPartialName = 'TEST_1780053177512'; // use PARTIAL text
      const ddl = document.querySelector('#ddlVendor1');

      const match = Array.from(ddl.options).find(o =>
        o.text.toLowerCase().includes(vendorPartialName.toLowerCase())
      );

      if (!match) {
        throw new Error('Vendor not found containing: ' + vendorPartialName);
      }

      ddl.value = match.value;
      ddl.dispatchEvent(new Event('change', { bubbles: true }));
    });

    /* ✅ STEP 3: WAIT UNTIL SITE DROPDOWN IS POPULATED (DEPENDENT) */
    await page.waitForFunction(() => {
      const ddl = document.querySelector('#ddlSite');
      return ddl && ddl.options && ddl.options.length > 1;
    }, { timeout: 30000 });

    /* ✅ STEP 4: SELECT SITE */
    await page.evaluate(() => {
      const sitePartialName = 'CHENNAI SITE';
      const ddl = document.querySelector('#ddlSite');

      const match = Array.from(ddl.options).find(o =>
        o.text.toLowerCase().includes(sitePartialName.toLowerCase())
      );

      if (!match) {
        throw new Error('Site not found containing: ' + sitePartialName);
      }

      ddl.value = match.value;
      ddl.dispatchEvent(new Event('change', { bubbles: true }));
    });

    /* ✅ STEP 5: CONTINUE APPROVAL */
    await page.getByRole('button', { name: 'OK' }).click();
    await page.locator('#txtRejectRemark1').fill('test');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await page.getByRole('button', { name: 'OK' }).click();
  });
 test('Test-2: Bank Details approval – vendor first, then site', async ({ page }) => {

    await page.goto(INDEX_URL);

    // Navigate
    await page.getByRole('link', { name: 'VENDOR MANAGEMENT' }).click();
    await page
      .locator('//a[@href="../Purchase/VendorManagmnt.aspx?frmid=2"]')
      .click();

    // Open Site tab
    await page.getByRole('tab', { name: 'Bank Details' }).click();
    await page.getByPlaceholder('Vendor ....').type('TEST');
    await page.locator('#ddlVendor2autocomplete-list').waitFor({ state: 'visible', timeout: 30000 });
    await page.locator('#ddlVendor2autocomplete-list').getByText('TEST_1777698444815').click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Search' }).click({ force: true });

    await page.waitForFunction(() => {
      const d = document.querySelector('#ddlSites');
      return d && d.options.length > 1;
    });

    await page.selectOption('#ddlSites', { label: 'CHENNAI SITE' });
    await page.waitForTimeout(1000);
    await page.locator('#txtRejectRemark2').fill('test roll')
    await page.getByRole('button', { name: 'Add NEFT' }).click();
    //await page.getByRole('button', { name: 'OK' }).click();

});

test('Test-3: Documents approval', async ({ page }) => {

    await page.goto(INDEX_URL);

    // Navigate
    await page.getByRole('link', { name: 'VENDOR MANAGEMENT' }).click();
    await page
      .locator('//a[@href="../Purchase/VendorManagmnt.aspx?frmid=2"]')
      .click();

    // Open Site tab
    await page.getByRole('tab', { name: 'Documents' }).click();

await page.selectOption('#ddlVendorDoc', {
  label: 'ABE ADVERTISING'
});
await page.waitForTimeout(2000);

// Loop until no "Verify" buttons left
while (await page.locator('#tblVendorDoc button:has-text("Verify")').count() > 0) {

  const row = page.locator('#tblVendorDoc tr')
    .filter({ has: page.locator('button:has-text("Verify")') })
    .first();

  // Click View
  await row.locator('button:has-text("View")').click();
  await page.waitForLoadState('networkidle');

  // Click Verify
  await row.locator('button:has-text("Verify")').click();
  await page.waitForLoadState('networkidle');
 }

 await expect(page.getByRole('button', { name: 'Exit' })).toBeVisible({ timeout: 30000 });

  await page.getByRole('button', { name: 'Exit' }).click();

     

   // await page.getByRole('button', { name: 'Exit' }).click();

});
});

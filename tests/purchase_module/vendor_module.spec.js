import { test, expect } from '@playwright/test';
import { generateAccountNo } from '../utils/accountUtils';

const INDEX_URL = 'https://uatapp.manappuram.net/purchase/Index/Index.aspx';

let vendorId = '';
let uniquePhone = '';
let uniqueEmail = '';
let vendorName = '';
//let accountNo = '';

function makeUniqueData() {
  const ts = Date.now();
  uniquePhone = '9' + String(ts).slice(-9);            // 10-digit
  uniqueEmail = `vendor_${ts}@gmail.com`;
  vendorName = `Test_${Date.now()}`;
}

async function selectSuggestionStartingWith(page, textStartsWith) {
  // Suggestions typically like "MA25825--SARIKA..." or "679304"
  const suggestion = page.getByText(new RegExp(`^${textStartsWith}`, 'i')).first();
  await expect(suggestion).toBeVisible({ timeout: 15000 });
  await suggestion.click();
}

test.describe.serial('Vendor Management Flow (Login once, multiple tests)', () => {

  test('Test-1: Create Vendor and capture Vendor ID', async ({ page }) => {
    makeUniqueData();

    console.log('✅ Phone:', uniquePhone);
    console.log('✅ Email:', uniqueEmail);
    console.log('✅ Vendor Name:', vendorName);

    // Already logged in via storageState
    await page.goto(INDEX_URL);

    // Navigate to Vendor Management
    await page.getByRole('link', { name: 'VENDOR MANAGEMENT' }).click();
    await page.locator('//a[@href="../Purchase/VendorManagmnt.aspx?frmid=1"]').click();

    // Open menu
    await page.locator("(//div[@class='bar1'])[1]").click();

    // Add New Vendor
    await page.locator("//a[contains(.,'Add New Vendor')]").hover();
    await page.locator("//a[contains(.,'Add New Vendor')]").click();

    // Form fill
    await page.locator('#ddl_vendor').selectOption('2');
    await page.locator('#GlobalNo').check();
    await page.locator('#rbNotComposite').check();
    await page.locator('#NOesi').check();

    await page.selectOption('#VENDORCAT1', { label: 'ELECTRICAL VENDORS' });
    await page.locator('#UANN').check();
    await page.locator('#relation_no').check();
    await page.selectOption('#ddl_msme', { label: 'NORMAL VENDOR' });

    await page.getByPlaceholder("ENTER VENDOR NAME").fill(vendorName);
    await page.getByPlaceholder("ADD CONTACT NAME").fill(`${vendorName} test`);
    await page.getByPlaceholder("Enter Contact Email").fill(uniqueEmail);
    await page.getByPlaceholder("Add Contact No").fill(uniquePhone);

    await page.getByPlaceholder("Add Door No & Building Name").fill('126 A MAIN ROAD');
    await page.selectOption('#ddl_Country', { label: 'INDIA' });

    // Scroll container
    await page.locator('#content').evaluate(el => { el.scrollTop = el.scrollHeight; });

    // Pincode
    await page.click('//div[contains(.,"Pincode")]/input[@type="radio"]');

    await page.locator('#PinSearch').type('679304');
    await page.waitForTimeout(1000);

    await selectSuggestionStartingWith(page, '679304');
    await page.waitForTimeout(1000);

    await page.getByPlaceholder("Add City").fill('KANNUR');
    await page.getByPlaceholder("Enter Street & Area").fill('126 A MAIN ROAD');

    await page.getByPlaceholder("Add Email id").fill(uniqueEmail);
    await page.getByPlaceholder("Add Phone Number").fill(uniquePhone);
    
    await page.getByPlaceholder("Add PAN No").fill('ATFPA2435D');
    await page.waitForTimeout(2000);
  //  
    const popUp = page.locator('test = PAN FETAILS').toBeVisible({ timeout: 2000 });
    await popUp.waitFor({ state: 'visible', timeout: 5000 });
    await expect(page.locator('text = Shri MD SOHAIL AHMAD')).toBeVisible();
    await expect(page.locator('text = VALID')).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByPlaceholder("Add Annual Turnover").fill('1000');
    // Date picker
    await page.getByPlaceholder("Client Registration Date").click();
    await page.waitForTimeout(2000);
    await page.locator('.ui-datepicker-calendar a:text-is("7")').click();

    await page.selectOption('#ddl_EST', { label: 'Individual/ sole proprietorship' });

    await page.locator('#VendorDateOfBirth').click();
    await page.waitForTimeout(2000);
    await page.locator('.ui-datepicker-calendar a:text-is("7")').click();
    await page.pause();

    // Confirm vendor
    const confirmBtn = page.getByRole('button', { name: /Confirm/i });
    await confirmBtn.scrollIntoViewIfNeeded();
    await confirmBtn.click({ force: true });
    // Capture vendor ID
    const successLocator = page.getByText('Vendor Created Vendor ID is:');
    await expect(successLocator).toBeVisible({ timeout: 15000 });
    const successText = (await successLocator.textContent()) || '';
    // Extract ID after colon
    vendorId = (successText.split(':')[1] || '').trim();
    console.log('✅ Captured Vendor ID:', vendorId);
    expect(vendorId).not.toBe('');
    // Close popup
    await page.getByRole('button', { name: 'OK' }).click();
  });
  test('Test-2: Site Creation using captured Vendor ID', async ({ page }) => {
    expect(vendorId).not.toBe('');
    await page.goto(INDEX_URL);
    await page.getByRole('link', { name: 'VENDOR MANAGEMENT' }).click();
    await page.locator('//a[@href="../Purchase/VendorManagmnt.aspx?frmid=1"]').click();
    //await page.locator("(//div[@class='bar1'])[1]").click();
    await page.getByRole('tab', { name: 'Site' }).click();
    await page.waitForTimeout(1000);
    // open site menu & add site details
    await page.locator('#divMenuSite .bar2').click();
    await page.getByRole('link', { name: 'Add Site Details' }).click();
    //await page.pause();
    // Search vendor in site

    const searchBox = page.getByRole('textbox', { name: 'Search..' });

    await searchBox.type(vendorId, { delay: 100 });

    await page.getByText(vendorId).first().click();

    //await page.getByText(vendorId).first().click();
    await page.waitForSelector('input[onclick="SearchVendor1(0)"]', { timeout: 4000 });
    await page.locator('input[onclick="SearchVendor1(0)"]').click({ force: true });
    await page.waitForSelector('#txtVendrid3', { toHaveValue: vendorId, timeout: 2000 });
    // Fill site details // 
    await page.locator('#txtDoorAddress').fill('SITE ADDRESS');
    await page.locator('#ddlState1').selectOption('17');
    await page.locator('#ddlDistrict').selectOption('474');
    await page.getByRole('combobox').nth(2).selectOption('10577');
    await page.locator('#txtLocation').fill('CHENNAI SITE');
    await page.locator('#txtPhone').fill(uniquePhone);
    // Confirm site creation
    await page.getByRole('button', { name: 'Confirm' }).click();
    await page.getByRole('button', { name: 'OK' }).click();
    //await page.pause();

  });
  test('Test-3: Bank Details / NEFT using captured Vendor ID', async ({ page }) => {
    expect(vendorId).not.toBe('');
    await page.goto(INDEX_URL);
    await page.getByRole('link', { name: 'VENDOR MANAGEMENT' }).click();
    await page.locator('//a[@href="../Purchase/VendorManagmnt.aspx?frmid=1"]').click();
    await page.getByRole('tab', { name: 'Bank Details' }).click();
    await page.waitForTimeout(1000);
    await page.locator('#MenuNeftDetails .bar2').click();
    await page.waitForTimeout(1000);
    await page.getByRole('link', { name: 'Add New Neft' }).click();
    await page.waitForTimeout(1000);
    // Search vendor in NEFT
    // Click Search
    const searchBox = page.getByRole('textbox', { name: 'Search..' });

    await searchBox.type(vendorId, { delay: 200 });

    await page.getByText(vendorId).first().click();
    await page.waitForSelector('input[onclick="SearchVendorNeft()"]', { timeout: 2000 });
    await page.locator('input[onclick="SearchVendorNeft()"]').click({ force: true });

    await page.waitForFunction(() => {
      const d = document.querySelector('#ddlSites');
      return d && d.options.length > 1;
    });

    await page.selectOption('#ddlSites', { label: 'CHENNAI SITE' });
    await page.waitForTimeout(1000);

    // Add New NEFT
    await page.getByRole('radio', { name: 'Add New Neft' }).check();
    await page.selectOption('#ddl_state2', {label: 'KERALA'});
    //await page.waitForTimeout(1000);
    await page.selectOption('#ddl_dist', {label: 'KOLLAM'});
    //await page.waitForTimeout(1000);
    await page.selectOption('#ddl_bank', {label: 'INDIAN BANK'}); 
    //await page.waitForTimeout(3000);
    await page.selectOption('#ddl_branch', { label: 'KOLLAM' });
    await page.waitForTimeout(3000);
    await page.selectOption('#ddl_acct', { label: 'SAVINGS BANK' });
    await page.waitForTimeout(3000);
                                             
const accNo = generateAccountNo();

await page.locator('#txtaccno').fill(accNo);
await page.locator('#txtaccno').press('Tab');

await page.locator('#txtaccno1').fill(accNo);
await page.locator('#txtaccno1').press('Tab');

await expect(page.locator('#txtaccno')).toHaveValue(accNo, { timeout: 2000 });
await expect(page.locator('#txtaccno1')).toHaveValue(accNo, { timeout: 2000 });

    await page.locator('#txtmoblno').fill(uniquePhone);
    await page.locator('#txtpbname').fill('Test Bank');
    await page.locator('#txtRemark').fill('NEFT details for testing');
    await page.locator('#imgPassBook')
      .setInputFiles('tests/image/cheque.pdf');
      await page.waitForTimeout(1000);
      await  page.locator('#cpbtnSubmit1').click();
  });

  // TEST 4 – DOCUMENT UPLOAD (FIXED ✅)
  // ==================================================
  test('Test-4: Documents Upload', async ({ page }) => {
    expect(vendorId).not.toBe('');

    await page.goto(INDEX_URL);
    await page.getByRole('link', { name: 'VENDOR MANAGEMENT' }).click();
    await page.locator('//a[@href="../Purchase/VendorManagmnt.aspx?frmid=1"]').click();
    await page.getByRole('tab', { name: 'Documents' }).click();

    await page.waitForTimeout(1000);
    const searchBox = page.getByRole('textbox', { name: 'Search..' });

    await searchBox.type(vendorId, { delay: 200 });

    await page.getByText(vendorId).first().click();
    await page.waitForSelector('input[onclick="SearchVendorDocument()"]', { timeout: 2000 });
    await page.locator('input[onclick="SearchVendorDocument()"]').click({ force: true });
    await page.locator('#ddl_doc').selectOption('8');
    await page.waitForTimeout(3000);
    await page.locator('#kycType').selectOption('4');
    await page.waitForTimeout(2000);
    await page.getByRole('textbox', { name: 'Enter Aadharcard Number' }).fill('35323453563452');
    await page.locator('#imgFileType').setInputFiles('tests/image/cheque.pdf');
    await page.getByRole('button', { name: 'Upload' }).click();
    await page.getByRole('button', { name: 'OK' }).click();
    page.on('dialog', async dialog => {
      console.log('✅ Alert:', dialog.message());
      await dialog.dismiss();
    });


  //   const uploadDoc = async (docType) => {
  //     await page.locator('#ddl_doc').selectOption(docType);
  //     await page
  //       .locator('#imgFileType')
  //       .setInputFiles('tests/image/cheque.pdf');
  //     await page.getByRole('button', { name: 'Upload' }).click();
  //     await page.waitForTimeout(1000);
  //   };
  //   page.on('dialog', async dialog => {
  //     console.log('✅ Alert:', dialog.message());
  //     await dialog.dismiss();
  //   });


  //   await uploadDoc('2');
  //   page.on('dialog', async dialog => {
  //     console.log('✅ Alert:', dialog.message());
  //     await dialog.dismiss();
  //   });

  //   await uploadDoc('3');
  //   page.on('dialog', async dialog => {
  //     console.log('✅ Alert:', dialog.message());
  //     await dialog.dismiss();
  //   });

  //   await uploadDoc('6');
  //   page.on('dialog', async dialog => {
  //     console.log('✅ Alert:', dialog.message());
  //     await dialog.dismiss();
  //   });


  //   await page.locator('#ddl_doc').selectOption('8');
  //   await page.waitForTimeout(1000);
  //   await page.locator('#kycType').selectOption('4');
  //   await page.waitForTimeout(2000);
  //   await page
  //     .getByRole('textbox', { name: 'Enter Aadharcard Number' })
  //     .fill('35323453563452');
  //     page.on('dialog', async dialog => {
  //     console.log('✅ Alert:', dialog.message());
  //     await dialog.dismiss();
  //   });


  //   await uploadDoc('8');
  //   page.on('dialog', async dialog => {
  //     console.log('✅ Alert:', dialog.message());
  //     await dialog.dismiss();
  //   });

  //   await uploadDoc('10');
  //   page.on('dialog', async dialog => {
  //     console.log('✅ Alert:', dialog.message());
  //     await dialog.dismiss();
  //   });


  //   await page.getByRole('button', { name: 'Exit' }).click();
  });

});



// import { test, expect } from '@playwright/test';
// import { generateAccountNo } from '../utils/accountUtils';

// test.use({ storageState: 'loginState.json' });

// const INDEX_URL =
//   'https://uatapp.manappuram.net/purchase/Index/Index.aspx';

// let vendorId = '';
// let vendorName = '';
// let uniquePhone = '';
// let uniqueEmail = '';

// function makeUniqueData() {
//   const ts = Date.now();
//   vendorName = `Test_${ts}`;
//   uniquePhone = '9' + String(ts).slice(-9);
//   uniqueEmail = `vendor_${ts}@gmail.com`;
// }

// test.describe.serial('Vendor Management End‑to‑End Flow', () => {

//   /* ===================================================================== */
//   test('Test‑1: Create Vendor', async ({ page }) => {

//     makeUniqueData();
//     await page.goto(INDEX_URL);

//     page.on('dialog', async d => await d.accept());

//     await page.locator('//a[@href="../Purchase/VendorManagmnt.aspx?frmid=1"]').click();
//     await page.locator("(//div[@class='bar1'])[1]").click();
//     await page.locator("//a[contains(.,'Add New Vendor')]").click();

//     await page.selectOption('#ddl_vendor', '2');
//     await page.locator('#GlobalNo').check();
//     await page.locator('#rbNotComposite').check();
//     await page.locator('#NOesi').check();
//     await page.selectOption('#VENDORCAT1', { label: 'ELECTRICAL VENDORS' });

//     await page.getByPlaceholder("ENTER VENDOR NAME").fill(vendorName);
//     await page.getByPlaceholder("Enter Contact Email").fill(uniqueEmail);
//     await page.getByPlaceholder("Add Contact No").fill(uniquePhone);

//     await page.getByRole('button', { name: /confirm/i }).click();

//     const successText =
//       await page.getByText('Vendor Created Vendor ID is:').textContent();

//     vendorId = successText?.split(':')[1].trim() || '';
//     expect(vendorId).not.toBe('');

//     console.log('✅ Vendor ID:', vendorId);
//     await page.getByRole('button', { name: 'OK' }).click();
//   });

//   /* ===================================================================== */
//   test('Test‑2: Site Creation', async ({ page }) => {
//     expect(vendorId).not.toBe('');

//     await page.goto(INDEX_URL);
//     await page.locator('//a[@href="../Purchase/VendorManagmnt.aspx?frmid=1"]').click();
//     await page.getByRole('tab', { name: 'Site' }).click();

//     await page.waitForFunction(() => {
//       const ddl = document.querySelector('#ddlVendor1');
//       return ddl && ddl.options.length > 1;
//     });

//     await page.evaluate(() => {
//       const ddl = document.querySelector('#ddlVendor1');
//       ddl.selectedIndex = 1;
//       ddl.dispatchEvent(new Event('change', { bubbles: true }));
//     });

//     await page.waitForFunction(() => {
//       const ddl = document.querySelector('#ddlSite');
//       return ddl && ddl.options.length > 1;
//     });

//     await page.getByRole('button', { name: 'Confirm' }).click();
//     await page.getByRole('button', { name: 'OK' }).click();
//   });

//   /* ===================================================================== */
//   test('Test‑3: Bank / NEFT Details', async ({ page }) => {

//     await page.goto(INDEX_URL);
//     await page.locator('//a[@href="../Purchase/VendorManagmnt.aspx?frmid=1"]').click();
//     await page.getByRole('tab', { name: 'Bank Details' }).click();

//     const accNo = generateAccountNo();
//     await page.locator('#txtaccno').fill(accNo);
//     await page.locator('#txtaccno1').fill(accNo);

//     await page.locator('#txtpbname').fill('Test Bank');
//     await page.locator('#txtRemark').fill('Automation Test');
//     await page.locator('#imgPassBook')
//       .setInputFiles('tests/image/cheque.pdf');

//     await page.locator('#cpbtnSubmit1').click();
//   });

//   /* ===================================================================== */
//   test('Test‑4: Document Upload', async ({ page }) => {

//     await page.goto(INDEX_URL);
//     await page.locator('//a[@href="../Purchase/VendorManagmnt.aspx?frmid=1"]').click();
//     await page.getByRole('tab', { name: 'Documents' }).click();

//     await page.locator('#ddl_doc').selectOption('8');
//     await page.locator('#kycType').selectOption('4');

//     await page
//       .getByRole('textbox', { name: /aadhar/i })
//       .fill('35323453563452');

//     await page.locator('#imgFileType')
//       .setInputFiles('tests/image/cheque.pdf');

//     await page.getByRole('button', { name: 'Upload' }).click();
//     await page.getByRole('button', { name: 'OK' }).click();
//   });

// });

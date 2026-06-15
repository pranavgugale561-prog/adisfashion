const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto('http://localhost:3003/admin-dashboard.html');
  
  // Login
  await page.fill('#loginUser', 'admin');
  await page.fill('#loginPass', 'password');
  await page.click('.admin-login-btn');
  
  await page.waitForTimeout(1000); // Wait for animations and data load
  
  await page.screenshot({ path: 'C:/Users/HP/.gemini/antigravity/brain/ce0e4da7-f9f5-421c-906a-55f71d4e7e0c/admin_overhaul.png' });
  
  await browser.close();
})();

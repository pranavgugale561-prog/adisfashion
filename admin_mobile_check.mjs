import puppeteer from 'puppeteer';

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812, isMobile: true });
  
  console.log("Navigating to admin...");
  await page.goto('http://localhost:3000/admin-dashboard.html');
  await new Promise(r => setTimeout(r, 1000));
  
  console.log("Logging in...");
  await page.type('#loginUser', 'admin');
  await page.type('#loginPass', 'adis2026');
  await page.click('.admin-login-btn');
  await new Promise(r => setTimeout(r, 2000));
  
  const tabs = [
    'dashboard', 'activity', 'leads', 'products', 'history', 'landing', 'feeds', 
    'sessions', 'insights', 'retention', 'engagement', 'quotations', 'vendors', 'database', 'users-orders'
  ];

  for (const tab of tabs) {
    try {
      console.log("Checking tab:", tab);
      await page.evaluate((tabId) => {
        const btn = document.querySelector(`button[data-tab="${tabId}"]`);
        if (btn) btn.click();
      }, tab);
      await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: `admin_mobile_${tab}.png`, fullPage: true });
    } catch (e) {
      console.error(`Error on tab ${tab}:`, e);
    }
  }

  await browser.close();
  console.log("Done.");
})();

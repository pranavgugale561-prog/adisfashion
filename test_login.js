const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    
    console.log("Navigating to /admin...");
    await page.goto('http://localhost:3003/admin', { waitUntil: 'networkidle0' });
    
    console.log("Typing credentials...");
    await page.type('#loginUser', 'admin');
    await page.type('#loginPass', 'adis2026');
    
    console.log("Clicking login...");
    await page.click('button.btn-primary');
    
    await page.waitForTimeout(2000);
    console.log("Finished waiting.");
    await browser.close();
  } catch (e) {
    console.error("Test script failed:", e);
  }
})();

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  // 1. Visit main site and click to trigger tracking
  const mainContext = await browser.newContext();
  const mainPage = await mainContext.newPage();
  await mainPage.goto('http://localhost:3003/');
  await mainPage.waitForTimeout(2000); // let Firebase init
  console.log("Triggering click on Shop Men button...");
  await mainPage.click('text=Shop Men', { force: true });
  await mainPage.waitForTimeout(2000); // let it push to Firebase
  await mainContext.close();

  // 2. Visit admin site and check Live Pulse
  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  await adminPage.goto('http://localhost:3003/admin-dashboard.html');
  await adminPage.fill('#loginUser', 'admin');
  await adminPage.fill('#loginPass', 'password');
  await adminPage.click('.admin-login-btn');
  await adminPage.waitForTimeout(2000); // wait for dashboard to load data

  // Click on the Live Pulse tab
  await adminPage.click('[data-tab="activity"]');
  await adminPage.waitForTimeout(1000);

  const activities = await adminPage.$$eval('#activityTable tbody tr', rows => {
    return rows.map(r => r.innerText);
  });
  
  console.log("Activity Table First Row: " + (activities[0] || "EMPTY"));
  
  await browser.close();
})();

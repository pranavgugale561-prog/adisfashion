const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const baseUrl = 'https://adisfashion-u131.vercel.app';
  
  const pagesToAudit = [
    { name: 'home', path: '/' },
    { name: 'feeds', path: '/feeds' },
    { name: 'men', path: '/men' },
    { name: 'sneakers', path: '/sneakers' },
    { name: 'daily-wear', path: '/daily-wear' }
  ];

  for (const p of pagesToAudit) {
    const page = await browser.newPage();
    
    // Desktop screenshot
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(baseUrl + p.path, { waitUntil: 'networkidle2' });
    
    // Click "TAP TO START"
    try {
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const tapBtn = buttons.find(b => b.innerText.includes('TAP TO START'));
        if (tapBtn) tapBtn.click();
      });
    } catch(e) {}
    
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: `audit_${p.name}_desktop.png`, fullPage: true });

    // Mobile screenshot
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    // Reload to re-trigger overlay if needed, or just keep going
    await page.goto(baseUrl + p.path, { waitUntil: 'networkidle2' });
    try {
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const tapBtn = buttons.find(b => b.innerText.includes('TAP TO START'));
        if (tapBtn) tapBtn.click();
      });
    } catch(e) {}
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: `audit_${p.name}_mobile.png`, fullPage: true });
    
    await page.close();
  }
  
  // Admin Panel
  const adminPage = await browser.newPage();
  await adminPage.setViewport({ width: 1440, height: 900 });
  await adminPage.goto(baseUrl + '/admin-dashboard.html', { waitUntil: 'networkidle2' });
  
  // Login to Admin Panel
  try {
    await adminPage.type('input[type="text"]', 'admin');
    await adminPage.type('input[type="password"]', 'admin123');
    await adminPage.click('button');
    await new Promise(r => setTimeout(r, 2000));
    await adminPage.screenshot({ path: `audit_admin_desktop.png`, fullPage: true });
    
    await adminPage.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await adminPage.screenshot({ path: `audit_admin_mobile.png`, fullPage: true });
  } catch(e) {
    console.error("Admin login failed", e);
  }
  await adminPage.close();

  // Chatbot screenshot
  const chatPage = await browser.newPage();
  await chatPage.setViewport({ width: 1440, height: 900 });
  await chatPage.goto(baseUrl, { waitUntil: 'networkidle2' });
  try {
    await chatPage.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const tapBtn = buttons.find(b => b.innerText.includes('TAP TO START'));
      if (tapBtn) tapBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    await chatPage.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      // Find chatbot button by looking for fixed bottom right button
      const chatBtn = buttons.find(b => b.className.includes('fixed bottom') || b.className.includes('rounded-full'));
      if(chatBtn) chatBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await chatPage.screenshot({ path: `audit_chatbot_desktop.png` });
  } catch(e) {
    console.error("Could not open chatbot", e);
  }
  await chatPage.close();

  await browser.close();
  console.log("Screenshots captured successfully.");
})();

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
    
    // Click anywhere to bypass "TAP TO START"
    await page.mouse.click(100, 100);
    // Wait for the 6-second loader to finish
    await new Promise(r => setTimeout(r, 6500));
    
    await page.screenshot({ path: `audit_${p.name}_desktop.png`, fullPage: true });

    // Mobile screenshot
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await page.reload({ waitUntil: 'networkidle2' });
    
    await page.mouse.click(100, 100);
    await new Promise(r => setTimeout(r, 6500));
    
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
  
  await chatPage.mouse.click(100, 100);
  await new Promise(r => setTimeout(r, 6500));
  
  try {
    await chatPage.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
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

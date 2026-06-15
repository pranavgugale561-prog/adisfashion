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
    { name: 'daily-wear', path: '/daily-wear' },
    { name: 'admin', path: '/admin-dashboard.html' }
  ];

  for (const p of pagesToAudit) {
    const page = await browser.newPage();
    
    // Desktop screenshot
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(baseUrl + p.path, { waitUntil: 'networkidle2' });
    // Wait an extra second for animations/images
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: `audit_${p.name}_desktop.png`, fullPage: true });

    // Mobile screenshot
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await page.goto(baseUrl + p.path, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: `audit_${p.name}_mobile.png`, fullPage: true });
    
    await page.close();
  }
  
  // Chatbot screenshot
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(baseUrl, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  // Find and click the chatbot button (usually fixed at bottom right, look for the floating button)
  try {
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const chatBtn = buttons.find(b => b.innerText.includes('Chat') || b.innerHTML.includes('lucide-message-circle') || b.className.includes('fixed bottom'));
      if(chatBtn) chatBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: `audit_chatbot_desktop.png` });
  } catch(e) {
    console.error("Could not open chatbot", e);
  }

  await browser.close();
  console.log("Screenshots captured successfully.");
})();

const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    const desktopPath = process.argv[2];
    const mobilePath = process.argv[3];
    
    // Desktop View
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('http://localhost:3000/shop', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: desktopPath, fullPage: true });

    // Mobile View
    await page.setViewport({ width: 375, height: 812, isMobile: true });
    await page.goto('http://localhost:3000/shop', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: mobilePath, fullPage: true });

    await browser.close();
    console.log('Screenshots captured');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

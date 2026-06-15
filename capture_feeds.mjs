import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  // Wait for network to be idle
  await page.goto('http://localhost:3000/feeds', { waitUntil: 'networkidle0' });
  
  // Wait an extra 2 seconds for any animations or embeds to load
  await new Promise(r => setTimeout(r, 2000));
  
  await page.screenshot({ path: 'feeds_screenshot.png', fullPage: true });
  await browser.close();
})();

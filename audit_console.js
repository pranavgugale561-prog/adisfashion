const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('CONSOLE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));
  page.on('requestfailed', request => {
    console.error('REQUEST FAILED:', request.url(), request.failure().errorText);
  });

  console.log("Navigating to home page...");
  await page.goto('https://adisfashion-u131.vercel.app', { waitUntil: 'networkidle2' });
  await page.mouse.click(100, 100);
  await new Promise(r => setTimeout(r, 6500));

  console.log("Navigating to feeds page...");
  await page.goto('https://adisfashion-u131.vercel.app/feeds', { waitUntil: 'networkidle2' });
  await page.mouse.click(100, 100);
  await new Promise(r => setTimeout(r, 6500));

  await browser.close();
})();

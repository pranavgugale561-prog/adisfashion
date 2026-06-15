import puppeteer from 'puppeteer';

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[Browser Console Error]: ${msg.text()}`);
    }
  });

  page.on('pageerror', error => {
    console.log(`[Browser Page Error]: ${error.message}`);
  });

  page.on('requestfailed', request => {
    console.log(`[Network Error]: ${request.url()} - ${request.failure()?.errorText}`);
  });

  console.log('Navigating to https://adisfashion.vercel.app/ ...');
  await page.goto('https://adisfashion.vercel.app/', { waitUntil: 'networkidle2' });
  
  console.log('Waiting 5 seconds...');
  await new Promise(r => setTimeout(r, 5000));
  
  await browser.close();
  console.log('Done.');
})();

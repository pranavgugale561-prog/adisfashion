const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1024 });
  try {
    await page.goto('http://localhost:3000/admin-dashboard.html', { waitUntil: 'networkidle0' });
    // Ensure the new input is visible
    await page.evaluate(() => {
        const firstInput = document.querySelector('input[placeholder="Or paste GDrive link..."]');
        if (firstInput) {
            firstInput.scrollIntoView({ behavior: 'instant', block: 'center' });
        }
    });
    await new Promise(r => setTimeout(r, 1000));
    const screenshotPath = 'C:\\\\Users\\\\HP\\\\.gemini\\\\antigravity\\\\brain\\\\1812642e-2958-4761-831f-53a3ca44bb25\\\\visual_check.png';
    await page.screenshot({ path: screenshotPath });
    console.log("Screenshot saved at", screenshotPath);
  } catch (e) {
    console.error("Failed to take screenshot:", e);
  } finally {
    await browser.close();
  }
})();

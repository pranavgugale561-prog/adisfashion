const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser in headless mode...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to http://localhost:3000 ...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // Wait for the specific image to finish loading
    console.log('Waiting for the specific image to load...');
    await page.waitForFunction(() => {
      const img = document.querySelector('img[src*="1bSy7yII0kjuJpK-vw9q2oYJ9oPbJsTu0"]');
      if (!img) return false;
      if (!img.complete) return false;
      return true;
    }, { timeout: 15000 });
    
    // Evaluate and check the referrerpolicy
    const imgData = await page.evaluate(() => {
      const img = document.querySelector('img[src*="1bSy7yII0kjuJpK-vw9q2oYJ9oPbJsTu0"]');
      return {
        src: img.src,
        referrerPolicy: img.getAttribute('referrerpolicy') || img.referrerPolicy,
        naturalWidth: img.naturalWidth
      };
    });
    
    console.log('Storefront Image Data:', imgData);
    if (imgData.referrerPolicy === 'no-referrer') {
      console.log('✅ Storefront image has correct referrerpolicy.');
    } else {
      console.log('❌ Storefront image missing referrerpolicy!', imgData.referrerPolicy);
    }
    
    if (imgData.naturalWidth > 0) {
      console.log('✅ Image loaded successfully (naturalWidth > 0).');
    } else {
      console.log('❌ Image failed to load or is broken (naturalWidth is 0).');
    }

  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
})();

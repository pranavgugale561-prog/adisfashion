const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser in headless mode...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to http://localhost:3000/admin-dashboard.html ...');
    await page.goto('http://localhost:3000/admin-dashboard.html', { waitUntil: 'networkidle2' });
    
    console.log('Hiding auth overlay and forcing tab display...');
    await page.evaluate(() => {
      const authOverlay = document.getElementById('auth-overlay');
      if (authOverlay) authOverlay.style.display = 'none';
      
      const tabLanding = document.getElementById('tab-landing');
      if (tabLanding) tabLanding.style.display = 'block';
    });
    
    // Wait for the dynamic content to load in the DOM
    await page.waitForFunction(() => document.getElementById('l_drive_link_heroDesktop') !== null, { timeout: 10000 });
    
    // Test the input field instant preview feature
    console.log('Testing the instant preview feature...');
    const testUrl = 'https://drive.google.com/file/d/1bSy7yII0kjuJpK-vw9q2oYJ9oPbJsTu0/view?usp=sharing';
    
    await page.evaluate((url) => {
      const input = document.getElementById('l_drive_link_heroDesktop');
      input.value = url;
      // Trigger the oninput event manually
      const event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);
    }, testUrl);

    
    // Check the preview image src and referrerpolicy
    const previewData = await page.evaluate(() => {
      const img = document.getElementById('l_preview_heroDesktop');
      return {
        src: img.src,
        referrerPolicy: img.getAttribute('referrerpolicy') || img.referrerPolicy,
        naturalWidth: img.naturalWidth
      };
    });
    
    console.log('Admin Dashboard Preview Image Data:', previewData);
    if (previewData.referrerPolicy === 'no-referrer') {
      console.log('✅ Admin Dashboard Preview image has correct referrerpolicy.');
    } else {
      console.log('❌ Admin Dashboard Preview image missing referrerpolicy!');
    }
    
    // Now verify the storefront
    console.log('Navigating to http://localhost:3000 ...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // Wait for storefront image with the injected Google Drive URL
    await page.waitForSelector('img[src*="1bSy7yII0kjuJpK-vw9q2oYJ9oPbJsTu0"]', { timeout: 10000 });
    
    const storefrontImgData = await page.evaluate(() => {
      const img = document.querySelector('img[src*="1bSy7yII0kjuJpK-vw9q2oYJ9oPbJsTu0"]');
      return {
        src: img.src,
        referrerPolicy: img.getAttribute('referrerpolicy') || img.referrerPolicy,
        naturalWidth: img.naturalWidth
      };
    });
    
    console.log('Storefront Image Data:', storefrontImgData);
    if (storefrontImgData.referrerPolicy === 'no-referrer') {
      console.log('✅ Storefront image has correct referrerpolicy.');
    } else {
      console.log('❌ Storefront image missing referrerpolicy!');
    }

  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
})();

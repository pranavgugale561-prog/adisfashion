const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser in headless mode...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to http://localhost:3000 ...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    console.log('Waiting for Hero Banner image to load...');
    
    // The default hero banner title is "Wear Your Fandom" or similar.
    // We'll select the first image that has object-cover (usually the hero image)
    // or just the first image inside the HeroBanner section.
    
    await page.waitForFunction(() => {
      const images = Array.from(document.querySelectorAll('img'));
      // Find the hero image (it usually has alt="Wear Your Fandom" or is the very first large image)
      const heroImg = images.find(img => img.alt && img.alt.toLowerCase().includes('fandom')) || images[0];
      if (!heroImg) return false;
      if (!heroImg.complete) return false;
      return true;
    }, { timeout: 15000 });
    
    // Evaluate and check the referrerpolicy and width
    const heroData = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      const heroImg = images.find(img => img.alt && img.alt.toLowerCase().includes('fandom')) || images[0];
      return {
        src: heroImg.src,
        alt: heroImg.alt,
        referrerPolicy: heroImg.getAttribute('referrerpolicy') || heroImg.referrerPolicy,
        naturalWidth: heroImg.naturalWidth,
        naturalHeight: heroImg.naturalHeight
      };
    });
    
    console.log('\n--- HERO BANNER IMAGE DATA ---');
    console.log(`Source URL: ${heroData.src}`);
    console.log(`Alt Text: ${heroData.alt}`);
    console.log(`Referrer Policy: ${heroData.referrerPolicy}`);
    console.log(`Natural Size: ${heroData.naturalWidth}x${heroData.naturalHeight}`);
    
    if (heroData.naturalWidth > 0) {
      console.log('✅ SUCCESS: Hero Banner image is fully loaded and visible (naturalWidth > 0).');
    } else {
      console.log('❌ ERROR: Hero Banner image is broken or failed to load (naturalWidth is 0).');
    }
    console.log('------------------------------\n');

  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
})();

const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log("Launching browser...");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    console.log("Navigating to /admin...");
    await page.goto('http://localhost:3000/admin');
    
    console.log("Waiting for iframe...");
    const frameElement = await page.waitForSelector('iframe');
    const frame = await frameElement.contentFrame();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    
    console.log("Typing credentials...");
    await frame.type('#loginUser', 'admin');
    await frame.type('#loginPass', 'adis2026');
    
    console.log("Calling handleLogin directly...");
    await frame.evaluate(() => {
      try {
        handleLogin();
      } catch (e) {
        console.log("HANDLE_LOGIN_ERROR: " + e.message);
      }
    });
    
    await new Promise(r => setTimeout(r, 1000));
    
    await page.screenshot({path: 'admin-debug.png'});
    const loginError = await frame.evaluate(() => document.getElementById('loginError').style.display);
    const display = await frame.evaluate(() => document.getElementById('loginOverlay').style.display);
    const adminDisplay = await frame.evaluate(() => document.getElementById('adminPanel').style.display);
    
    console.log(`loginOverlay display: ${display}`);
    console.log(`adminPanel display: ${adminDisplay}`);
    console.log(`loginError display: ${loginError}`);
    
    if (display === 'none' && adminDisplay === 'grid') {
      console.log("LOGIN SUCCESSFUL");
    } else {
      console.log("LOGIN FAILED");
    }
    
    await browser.close();
  } catch (error) {
    console.error("Error during verification:", error);
  }
})();

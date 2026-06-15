import asyncio
import os
try:
    from playwright.async_api import async_playwright
except ImportError:
    import subprocess
    subprocess.check_call(["python", "-m", "pip", "install", "playwright"])
    subprocess.check_call(["python", "-m", "playwright", "install", "chromium"])
    from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        # Navigate to the admin dashboard
        await page.goto('http://localhost:3000/admin-dashboard.html')
        # Wait a bit for JS to load and firebase data to fetch
        await page.wait_for_timeout(3000)
        
        # Click the edit button on the first product
        await page.evaluate("""() => {
            const editBtn = document.querySelector('.admin-products-grid .btn-outline');
            if (editBtn) {
                editBtn.click();
            }
        }""")
        
        # Wait a little bit for the form to open
        await page.wait_for_timeout(1000)
        
        # Take a screenshot
        await page.screenshot(path='admin_dashboard_edit_check.png', full_page=True)
        await browser.close()

asyncio.run(main())

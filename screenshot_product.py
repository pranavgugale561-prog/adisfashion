import asyncio
import urllib.request
import json
from playwright.async_api import async_playwright

async def main():
    try:
        req = urllib.request.urlopen("https://adis-fashion-default-rtdb.firebaseio.com/products.json")
        data = json.loads(req.read().decode())
        
        product_id = "m1"
        category = "men"
        
        if isinstance(data, list):
            for p in data:
                if p and 'id' in p:
                    product_id = p['id']
                    if 'category' in p:
                        if p['category'] == 'Daily Wear': category = 'daily-wear'
                        elif p['category'] == 'Sneakers': category = 'sneakers'
                    break
        elif isinstance(data, dict):
            for k, p in data.items():
                if p and 'id' in p:
                    product_id = p['id']
                    if 'category' in p:
                        if p['category'] == 'Daily Wear': category = 'daily-wear'
                        elif p['category'] == 'Sneakers': category = 'sneakers'
                    break
                    
        url = f"http://localhost:3000/{category}/{product_id}"
        print(f"Navigating to {url}")
        
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page()
            # Set a modern viewport
            await page.set_viewport_size({"width": 1440, "height": 1080})
            await page.goto(url)
            await page.wait_for_timeout(3000)
            
            # Hover over the size L just to trigger the hover effect
            await page.evaluate("""() => {
                const sizes = Array.from(document.querySelectorAll('button')).filter(b => b.textContent === 'L' || b.textContent === 'M');
                if (sizes.length > 0) {
                    const btn = sizes[0];
                    const event = new MouseEvent('mouseover', { 'view': window, 'bubbles': true, 'cancelable': true });
                    btn.dispatchEvent(event);
                }
            }""")
            
            await page.screenshot(path="product_details_desktop.png", full_page=True)
            
            # Mobile viewport
            await page.set_viewport_size({"width": 390, "height": 844})
            await page.screenshot(path="product_details_mobile.png", full_page=True)
            
            await browser.close()
            print("Screenshots taken successfully!")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())

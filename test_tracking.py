from playwright.sync_api import sync_playwright
import time
import os

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    # create a fresh incognito context
    context = browser.new_context()
    page = context.new_page()

    print("Navigating to Storefront...")
    page.goto("http://localhost:3003/")
    time.sleep(2) # wait for page to load

    # Click on the body just to trigger something
    print("Clicking randomly on the page...")
    page.mouse.click(100, 100)
    page.mouse.click(200, 200)
    
    # Try to find a link or button
    elements = page.locator("a, button").all()
    if len(elements) > 0:
        print("Found clickable elements, clicking the first one...")
        try:
            elements[0].click()
        except:
            pass
    
    time.sleep(3) # wait for tracking to fire

    print("Navigating to Admin Dashboard...")
    admin_path = os.path.abspath("public/admin-dashboard.html")
    page.goto(f"file:///{admin_path.replace(os.sep, '/')}")
    time.sleep(3) # wait for firebase sync

    # switch to Activity Tab
    print("Clicking Activity Tab...")
    try:
        page.locator("[data-tab='activity']").first.click(force=True)
    except Exception as e:
        print("Could not click Activity tab:", e)

    time.sleep(2)

    screenshot_path = "public/admin_activity_screenshot.png"
    page.screenshot(path=screenshot_path)
    print(f"Saved screenshot to {screenshot_path}")

    browser.close()

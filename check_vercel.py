import urllib.request
import re
try:
    req = urllib.request.Request('https://adisfashion-u131.vercel.app/', headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8')
    # Find the main chunk or layout chunk that contains Firebase config
    js_files = re.findall(r'src=\"(/_next/static/chunks/[^\"]+\.js)\"', html)
    found = False
    for f in js_files:
        js_url = 'https://adisfashion-u131.vercel.app' + f
        js = urllib.request.urlopen(urllib.request.Request(js_url, headers={'User-Agent': 'Mozilla/5.0'})).read().decode('utf-8')
        match = re.search(r'projectId:\s*[\"\']([^\"\']+)[\"\']', js)
        if match:
            print('Vercel ProjectId in', f, ':', match.group(1))
            found = True
            break
    if not found:
        print('ProjectId not found in any JS')
except Exception as e:
    print('Error:', e)

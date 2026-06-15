const fs = require('fs');
let html = fs.readFileSync('public/admin-dashboard.html', 'utf8');
html = html.replace('<body>', '<body>\n<div style="position:fixed; top:20px; left:50%; transform:translateX(-50%); z-index:9999999;"><button onclick="restoreLocalUpdates()" style="background:#d4af37; color:#000; font-weight:bold; padding:20px 40px; border-radius:12px; cursor:pointer; border:2px solid white; font-size:22px; box-shadow: 0 0 30px rgba(212,175,55,0.8);">CLICK HERE TO RECOVER ALL YOUR IMAGES</button></div>');
fs.writeFileSync('public/admin-dashboard.html', html);
console.log('Fixed button added to body');

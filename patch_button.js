const fs = require('fs');
let html = fs.readFileSync('public/admin-dashboard.html', 'utf8');
html = html.replace('</header>', '</header><div style="text-align:center; padding:10px;"><button onclick="restoreLocalUpdates()" style="background:#d4af37; color:#000; font-weight:bold; padding:10px 20px; border-radius:8px; cursor:pointer; border:none; font-size:16px;">Recover Lost Updates</button></div>');
fs.writeFileSync('public/admin-dashboard.html', html);
console.log('Done');

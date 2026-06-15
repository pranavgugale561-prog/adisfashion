const fs = require('fs');
let lines = fs.readFileSync('public/admin-dashboard.html', 'utf8').split('\n');
lines.splice(431, 0, '<div style="text-align:center; padding:10px; margin-bottom: 20px;"><button onclick="restoreLocalUpdates()" style="background:#d4af37; color:#000; font-weight:bold; padding:15px 30px; border-radius:8px; cursor:pointer; border:none; font-size:18px; box-shadow: 0 0 15px rgba(212,175,55,0.5);">Recover Lost Updates</button></div>');
fs.writeFileSync('public/admin-dashboard.html', lines.join('\n'));
console.log('Successfully injected button at line 432');

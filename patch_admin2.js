const fs = require('fs');
let html = fs.readFileSync('public/admin-dashboard.html', 'utf8');

const searchStr = `<div class="admin-actions">
           <button class="action-btn" onclick="fetchAdminData()"><i class="ph ph-arrows-clockwise"></i> Refresh</button>`;
const replaceStr = `<div class="admin-actions">
           <button class="action-btn" onclick="restoreLocalUpdates()" style="background:var(--gold); color:#000; font-weight:bold; box-shadow: 0 0 10px var(--gold-glow);"><i class="ph ph-clock-counter-clockwise"></i> Recover Lost Updates</button>
           <button class="action-btn" onclick="fetchAdminData()"><i class="ph ph-arrows-clockwise"></i> Refresh</button>`;

html = html.replace(searchStr, replaceStr);

const js = `
      window.restoreLocalUpdates = function() {
          if (confirm("This will load your browser's local unsaved updates and sync them to the Cloud. Do you want to proceed?")) {
              adminData.products = JSON.parse(localStorage.getItem('ADIS_products') || '[]');
              adminData.categories = JSON.parse(localStorage.getItem('ADIS_categories') || '["cap", "shoes", "jeans", "tshirts", "watches", "sando", "shirts", "shorts", "sports", "jacket"]');
              adminData.landingConfig = JSON.parse(localStorage.getItem('ADIS_landingConfig') || 'null');
              adminData.feeds = JSON.parse(localStorage.getItem('ADIS_feeds') || '[]');
              import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js').then(({ set, ref }) => {
                 set(ref(firebaseDB.db, 'products'), adminData.products);
                 if(adminData.landingConfig) set(ref(firebaseDB.db, 'landingConfig'), adminData.landingConfig);
                 set(ref(firebaseDB.db, 'categories'), adminData.categories);
                 set(ref(firebaseDB.db, 'feeds'), adminData.feeds);
                 alert('Lost updates successfully recovered and synced to the cloud!');
                 location.reload();
              });
          }
      };
`;

html = html.replace('// Initialize dropdowns after Firebase loads', js + '\n      // Initialize dropdowns after Firebase loads');

fs.writeFileSync('public/admin-dashboard.html', html, 'utf8');
console.log('Successfully patched admin-dashboard.html');

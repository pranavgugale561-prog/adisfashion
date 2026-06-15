const fs = require('fs');
const path = './public/admin-dashboard.html';

let lines = fs.readFileSync(path, 'utf8').split('\n');

// find the line with "</div>`;" which was right before the mess.
let idx = lines.findIndex((l, i) => i > 2000 && l.includes('</div>`;'));

if (idx !== -1) {
    // find where "if (sorted.length === 0) {" is
    let endIdx = lines.findIndex((l, i) => i > idx && l.includes('if (sorted.length === 0) {'));
    
    if (endIdx !== -1) {
        const correctCode = `            }).join('');

        renderVendors(adminData.vendors || []);
        renderEngagementCenter();
      }

      function renderEngagementCenter() {
         updateNotifDiagnostics();
         const listEl = document.getElementById('engagementList');
         if (!listEl) return;

         const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
         const leads = adminData.leads || [];
         const allVisitorsMap = { ...(adminData.living_visitors || {}) };
         
         // Merge leads into engagement list so they always show up
         leads.forEach(l => {
             const vid = l.visitorId || 'lead_' + l.id;
             if (!allVisitorsMap[vid]) {
                 allVisitorsMap[vid] = {
                     lastSeen: l.time || new Date().toISOString(),
                     page: 'Offline (Lead)',
                     device: l.device ? l.device.ua : 'Unknown',
                     isOfflineLead: true
                 };
             }
         });
         
         const allVisitors = Object.entries(allVisitorsMap);
         
         // 1. Filter
         let filtered = allVisitors;
         if (engagementFilter === 'unsubscribed') {
            filtered = allVisitors.filter(([vid, v]) => {
               const lead = leads.find(l => l.visitorId === vid);
               return (lead && lead.unsubscribed) || v.notifStatus === 'denied';
            });
         }

         // 2. Sort: Live (pulsed < 5 mins ago) followed by Recent (Last seen)
         const sorted = filtered.sort((a, b) => {
            const isALive = a[1].lastSeen > fiveMinsAgo;
            const isBLive = b[1].lastSeen > fiveMinsAgo;
            if (isALive && !isBLive) return -1;
            if (!isALive && isBLive) return 1;
            return b[1].lastSeen.localeCompare(a[1].lastSeen);
         });

         `;
         
         lines.splice(idx + 1, endIdx - idx - 1, correctCode);
         fs.writeFileSync(path, lines.join('\n'), 'utf8');
         console.log("File fixed successfully!");
    } else {
        console.log("Could not find endIdx");
    }
} else {
    console.log("Could not find start idx");
}

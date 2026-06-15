const fs = require('fs');
const path = './public/admin-dashboard.html';

let content = fs.readFileSync(path, 'utf8');

const targetStr = `         const allVisitors = Object.entries(adminData.living_visitors || {});
         const leads = adminData.leads || [];
         
         // 1. Filter`;

const replacementStr = `         const leads = adminData.leads || [];
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
         
         // 1. Filter`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacementStr);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Patched successfully.");
} else {
    console.error("Target string not found. Please check manually.");
}

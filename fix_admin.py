import os

html_path = r'c:\Users\HP\Desktop\adis fashion website\public\admin-dashboard.html'
with open(html_path, 'r', encoding='utf-8') as f:
    lines = f.read().split('\n')

# Find the line with `const displayContact = matchedLead`
idx_start = -1
for i, line in enumerate(lines):
    if 'const displayContact = matchedLead ?' in line:
        idx_start = i
        break

# Find the line with `<div>` after it that has the strong tag for l.name || l.email
idx_end = -1
for i in range(idx_start + 1, len(lines)):
    if '<strong style="color:var(--white); font-size:1rem; display:block; margin-bottom:0.25rem;">${l.name || l.email}</strong>' in lines[i]:
        idx_end = i - 1  # the <div> line
        break

insertion = """              return `
              <div style="background:var(--card); border:1px solid var(--border); border-radius:8px; padding:0.8rem; display:flex; flex-direction:column; gap:0.3rem; ${matchedLead ? 'border-color:#10b981; background:rgba(16,185,129,0.05);' : ''}">
                 <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.75rem; color:var(--white); font-weight:600;">${displayName}</span>
                    <span style="font-size:0.6rem; color:var(--muted);">${Math.round((Date.now() - new Date(v.lastSeen))/1000)}s ago</span>
                 </div>
                 ${displayContact}
                 <div style="font-size:0.7rem; color:var(--gold); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${v.page || '/'}">
                    <i class="ph ph-browser"></i> ${v.page || '/'}
                 </div>
                 <div style="font-size:0.6rem; color:var(--muted);">
                    <i class="ph ph-device-mobile"></i> ${v.device || 'Unknown'}
                 </div>
              </div>
              `;
           }).join('') || '<p style="font-size:0.8rem; color:var(--muted); padding:1rem;">No one is browsing right now.</p>';
        }

        // Activity table
        const parseOS = (ua) => {
          if (!ua) return 'Unknown';
          if (ua.includes('Win')) return 'Windows';
          if (ua.includes('Mac')) return 'macOS';
          if (ua.includes('Android')) return 'Android';
          if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
          if (ua.includes('Linux')) return 'Linux';
          return 'Unknown';
        };

        const parseBrowser = (ua) => {
          if (!ua) return 'Unknown';
          if (ua.includes('Edg/')) return 'Edge';
          if (ua.includes('Chrome/') || ua.includes('CriOS/')) return 'Chrome';
          if (ua.includes('Firefox/') || ua.includes('FxiOS/')) return 'Firefox';
          if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'Safari';
          return 'Other';
        };

        const timeAgo = (dateStr) => {
            const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
            if (seconds < 60) return `${seconds}s ago`;
            const minutes = Math.floor(seconds / 60);
            if (minutes < 60) return `${minutes}m ago`;
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `${hours}h ago`;
            return new Date(dateStr).toLocaleTimeString();
        };

        document.querySelector('#activityTable tbody').innerHTML = (analytics.clicks || []).slice().reverse().map(c => {
          const dt = new Date(c.time || Date.now());
          const os = c.device ? parseOS(c.device.ua) : 'Unknown';
          const browser = c.device ? parseBrowser(c.device.ua) : 'Unknown';
          const screen = c.device && c.device.screen ? c.device.screen : 'Unknown Screen';
          
          let icon = '<i class="ph ph-laptop"></i>';
          if (os === 'iOS' || os === 'Android') icon = '<i class="ph ph-device-mobile"></i>';
          if (os === 'macOS') icon = '<i class="ph ph-apple-logo"></i>';
          if (os === 'Windows') icon = '<i class="ph ph-windows-logo"></i>';

          return `<tr>
            <td>
              <div style="font-weight:600; color:var(--white); margin-bottom:4px; font-size: 0.95rem;">${(c.element||'Unknown Action').slice(0,60)}</div>
              <div style="font-size:0.75rem; color:var(--muted);"><i class="ph ph-link"></i> ${c.page||'/'}</div>
            </td>
            <td>
              <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-size:1.4rem; color:var(--gold); display:flex; align-items:center; justify-content:center; width:36px; height:36px; background:var(--gold-glow); border-radius:8px;">${icon}</span>
                <div>
                  <div style="font-size:0.85rem; font-weight:600; color:var(--white);">${os} &middot; ${browser}</div>
                  <div style="font-size:0.75rem; color:var(--muted); margin-top:2px;">${screen}</div>
                </div>
              </div>
            </td>
            <td style="text-align:right;">
              <div style="font-size:0.85rem; color:var(--white); font-weight: 600;">${timeAgo(c.time || Date.now())}</div>
              <div style="font-size:0.75rem; color:var(--muted); margin-top:2px;">${dt.toLocaleDateString()}</div>
            </td>
          </tr>`;
        }).join('');

        // Leads (with new device fields)
        const leads = adminData.leads || [];
        document.getElementById('leadsContainer').innerHTML = leads.length === 0
          ? '<p style="color:var(--muted);font-size:0.85rem;">No leads captured yet.</p>'
          : leads.slice().reverse().map(l => {
              const dt = new Date(l.time || Date.now());
              const deviceStr = l.device ? `📱 ${parseOS(l.device.ua)} | ${l.device.screen}` : '';
              return `
                <div class="lead-item" style="border-left: 3px solid var(--gold); padding-left: 1rem; margin-bottom: 0.75rem; background: var(--card2); border-radius: 4px; padding-top: 0.5rem; padding-bottom: 0.5rem; padding-right: 0.5rem;">
                  <div class="lead-info" style="display:flex; justify-content:space-between; align-items:flex-start;">"""

new_lines = lines[:idx_start + 1] + insertion.split('\n') + lines[idx_end:]

with open(html_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines))

print(f"Fixed admin-dashboard.html! Inserted text from line {idx_start} to {idx_end}")

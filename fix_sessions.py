import os

html_path = r'c:\Users\HP\Desktop\adis fashion website\public\admin-dashboard.html'
with open(html_path, 'r', encoding='utf-8') as f:
    lines = f.read().split('\n')

tab_history_idx = -1
for i, line in enumerate(lines):
    if '<div class="tab-content" id="tab-history">' in line:
        tab_history_idx = i
        break

sessions_tab = """
        <div class="tab-content" id="tab-sessions">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <h3 style="color:var(--gold);font-size:1.1rem;"><i class="ph ph-users" style="vertical-align: middle; margin-right: 0.3rem;"></i> 3D Active Sessions</h3>
            <div style="display:flex; align-items:center; gap: 1rem;">
              <label style="color:var(--muted); font-size: 0.85rem;">Session Timeout (mins):</label>
              <input type="number" id="sessionTimeoutInput" value="5" min="1" max="60" style="background:var(--bg); border:1px solid var(--border); color:var(--white); padding: 0.3rem; width: 60px; border-radius: 4px;">
              <button class="btn btn-sm btn-gold" onclick="saveSessionTimeout()">Save</button>
            </div>
          </div>
          <p style="color:var(--muted); font-size:0.85rem; margin-bottom:2rem;">Watch real-time visitors exploring your store.</p>
          
          <div style="perspective: 1500px; transform-style: preserve-3d; min-height: 50vh; display: flex; flex-wrap: wrap; gap: 3rem; justify-content: center; padding: 2rem;" id="sessions3DContainer">
             <!-- 3D Session Cards will be rendered here -->
          </div>
        </div>
"""

lines = lines[:tab_history_idx] + sessions_tab.split('\n') + lines[tab_history_idx:]

# Now let's inject the logic for Session Timeout and 3D Rendering.
# Find `// Render Live Visitors List`
live_idx = -1
for i, line in enumerate(lines):
    if '// Render Live Visitors List' in line:
        live_idx = i
        break

# The logic right now starts with:
#            const liveEl = document.getElementById('liveVisitorsList');
#            document.getElementById('liveVisitorsCount').textContent = `${activeNow} ONLINE`;
#            
#            const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
#            const currentLiving = Object.entries(adminData.living_visitors || {})
#               .filter(([vid, v]) => v.lastSeen > fiveMinsAgo)

# Let's replace the `fiveMinsAgo` block
five_mins_idx = -1
for i in range(live_idx, len(lines)):
    if 'const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();' in lines[i]:
        five_mins_idx = i
        break

if five_mins_idx != -1:
    lines[five_mins_idx] = """
           const timeoutMinutes = parseInt(localStorage.getItem('ADIS_sessionTimeout') || '5');
           if (document.getElementById('sessionTimeoutInput')) document.getElementById('sessionTimeoutInput').value = timeoutMinutes;
           const activeLimitStr = new Date(Date.now() - timeoutMinutes * 60 * 1000).toISOString();
"""
    lines[five_mins_idx + 2] = lines[five_mins_idx + 2].replace('fiveMinsAgo', 'activeLimitStr')

# Now add 3D rendering after `liveEl.innerHTML = currentLiving.map... join...`
join_idx = -1
for i in range(five_mins_idx, len(lines)):
    if "}).join('') || '<p style=\"font-size:0.8rem; color:var(--muted); padding:1rem;\">No one is browsing right now.</p>';" in lines[i]:
        join_idx = i
        break

if join_idx != -1:
    logic_3d = """
           // Render 3D Sessions
           const s3d = document.getElementById('sessions3DContainer');
           if(s3d) {
             if (currentLiving.length === 0) {
                 s3d.innerHTML = '<div style="color:var(--muted); font-size:1.2rem; transform:translateZ(-100px);">No active sessions currently</div>';
             } else {
                 s3d.innerHTML = currentLiving.map(([vid, v], idx) => {
                   const matchedLead = adminData.leads.find(l => l.visitorId === vid || l.visitorId === v.visitorId);
                   const isMobile = v.device && (v.device.includes('iPhone') || v.device.includes('Android'));
                   const deviceIcon = isMobile ? '<i class="ph ph-device-mobile"></i>' : '<i class="ph ph-laptop"></i>';
                   const name = matchedLead ? matchedLead.name : `Visitor ${vid.substring(0, 4)}`;
                   const color = matchedLead ? '#10b981' : 'var(--gold)';
                   const zDepth = Math.max(0, 100 - (idx * 20));
                   
                   return `
                     <div class="session-3d-card" style="
                        width: 260px; 
                        height: 320px; 
                        background: rgba(10, 10, 10, 0.8);
                        border: 1px solid rgba(255, 215, 0, 0.2);
                        border-radius: 16px;
                        box-shadow: -15px 15px 30px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,215,0,0.05);
                        backdrop-filter: blur(10px);
                        padding: 1.5rem;
                        display: flex;
                        flex-direction: column;
                        transform: rotateX(15deg) rotateY(-15deg) translateZ(${zDepth}px);
                        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
                        cursor: pointer;
                        position: relative;
                        overflow: hidden;
                     " onmouseover="this.style.transform='rotateX(0deg) rotateY(0deg) translateZ(150px) scale(1.05)'; this.style.boxShadow='0 25px 50px rgba(0,0,0,0.9), 0 0 20px ${color}33';" onmouseout="this.style.transform='rotateX(15deg) rotateY(-15deg) translateZ(${zDepth}px)'; this.style.boxShadow='-15px 15px 30px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,215,0,0.05)';">
                        
                        <div style="position:absolute; top:-20px; right:-20px; width:100px; height:100px; background:${color}; opacity:0.1; border-radius:50%; filter:blur(20px);"></div>
                        
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem; z-index:1;">
                          <div style="display:flex; align-items:center; gap:0.5rem; color:${color};">
                             <div style="width:10px; height:10px; background:${color}; border-radius:50%; box-shadow:0 0 10px ${color}; animation: pulse 2s infinite;"></div>
                             <span style="font-weight:700; font-size:1.1rem; letter-spacing:1px;">${name}</span>
                          </div>
                          <span style="font-size:1.5rem; color:var(--white);">${deviceIcon}</span>
                        </div>
                        
                        <div style="flex:1; display:flex; flex-direction:column; gap:1rem; z-index:1;">
                           <div>
                             <div style="font-size:0.7rem; color:var(--muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:0.2rem;">Current Page</div>
                             <div style="color:var(--white); font-size:0.9rem; font-weight:500; background:rgba(255,255,255,0.05); padding:0.5rem; border-radius:6px;"><i class="ph ph-link" style="color:var(--gold);"></i> ${v.page || '/'}</div>
                           </div>
                           <div>
                             <div style="font-size:0.7rem; color:var(--muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:0.2rem;">Device OS</div>
                             <div style="color:var(--white); font-size:0.85rem;">${v.device || 'Unknown'}</div>
                           </div>
                        </div>

                        <div style="margin-top:auto; padding-top:1rem; border-top:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center; z-index:1;">
                           <span style="font-size:0.7rem; color:var(--muted);"><i class="ph ph-clock"></i> Active</span>
                           <span style="color:var(--white); font-weight:600; font-size:0.85rem;">${Math.round((Date.now() - new Date(v.lastSeen))/1000)}s ago</span>
                        </div>
                     </div>
                   `;
                 }).join('');
             }
           }
"""
    lines = lines[:join_idx+1] + logic_3d.split('\n') + lines[join_idx+1:]

# Add script block for saveSessionTimeout
lines.append("""
<script>
function saveSessionTimeout() {
   const val = document.getElementById('sessionTimeoutInput').value;
   localStorage.setItem('ADIS_sessionTimeout', val);
   alert('Session timeout saved to ' + val + ' minutes!');
   if(typeof fetchAdminData === 'function') fetchAdminData();
}
</script>
""")

with open(html_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print("Sessions 3D tab inserted successfully!")

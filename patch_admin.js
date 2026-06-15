const fs = require('fs');
const path = './public/admin-dashboard.html';
let content = fs.readFileSync(path, 'utf8');

// 1. Add sidebar link
const sidebarAnchor = '<a href="#" data-tab="landing"><i class="ph ph-image"></i> Landing Images</a>';
const newSidebarLink = '<a href="#" data-tab="feeds"><i class="ph ph-instagram-logo"></i> Instagram Feeds</a>';
content = content.replace(sidebarAnchor, sidebarAnchor + '\n          ' + newSidebarLink);

// 2. Add tab-nav button
const tabNavAnchor = '<button data-tab="landing">Landing</button>';
const newTabNavButton = '<button data-tab="feeds">Feeds</button>';
content = content.replace(tabNavAnchor, tabNavAnchor + '\n          ' + newTabNavButton);

// 3. Add tab-content block
const tabContentAnchor = '<div class="tab-content" id="tab-live-preview">';
const newTabContent = `
        <div class="tab-content" id="tab-feeds">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <h3 style="color:var(--gold);font-size:0.9rem;"><i class="ph ph-instagram-logo" style="vertical-align: middle; margin-right: 0.3rem;"></i> Instagram Feeds</h3>
          </div>
          
          <div style="background:var(--card2); border:1px solid var(--border); border-radius:var(--radius); padding:1rem; margin-bottom:1.5rem;">
            <h4 style="margin-bottom:0.5rem; font-size:0.8rem;">Add New Feed Link</h4>
            <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
              <input type="text" id="newFeedUrl" placeholder="Paste Instagram Reel or Post link here..." style="flex:1; min-width:200px; background:var(--bg); color:white; border:1px solid var(--border); padding:0.5rem; border-radius:6px; font-size:0.8rem;">
              <select id="newFeedType" style="background:var(--bg); color:white; border:1px solid var(--border); padding:0.5rem; border-radius:6px; font-size:0.8rem;">
                <option value="reel">Reel</option>
                <option value="post">Post</option>
              </select>
              <button class="btn btn-sm btn-gold" onclick="window.addFeed()"><i class="ph ph-plus"></i> Add Feed</button>
            </div>
          </div>

          <div id="feedsList" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:1rem;">
             <!-- Feeds will be rendered here -->
          </div>
        </div>

        <div class="tab-content" id="tab-live-preview">`;
content = content.replace(tabContentAnchor, newTabContent);

// 5. Add Firebase listener
const fbListenerAnchor = `firebaseDB.onValue(firebaseDB.ref(firebaseDB.db, 'landingLayout'), (snapshot) => {`;
const newFbListener = `
          firebaseDB.onValue(firebaseDB.ref(firebaseDB.db, 'feeds'), (snapshot) => {
             const data = snapshot.val();
             if (data) {
                 adminData.feeds = Array.isArray(data) ? data : Object.values(data);
             } else {
                 adminData.feeds = [];
             }
             if(window.renderFeeds) window.renderFeeds();
          });
          firebaseDB.onValue(firebaseDB.ref(firebaseDB.db, 'landingLayout'), (snapshot) => {`;
content = content.replace(fbListenerAnchor, newFbListener);

// 6. Add JS Functions
const jsAnchor = `function syncLandingToFirebase() {`;
const newJsFunctions = `
      window.syncFeedsToFirebase = function() {
         localStorage.setItem('ADIS_feeds', JSON.stringify(adminData.feeds || []));
         if(!firebaseDB) return alert('Saved locally. Connect to Firebase to sync live.');
         import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js').then(({ set, ref }) => {
             set(ref(firebaseDB.db, 'feeds'), adminData.feeds || [])
             .then(() => alert('Feeds synced successfully!'))
             .catch(e => { console.error(e); alert('Error syncing feeds.'); });
         });
      };

      window.addFeed = function() {
          const urlInput = document.getElementById('newFeedUrl');
          const typeInput = document.getElementById('newFeedType');
          const url = urlInput.value.trim();
          const type = typeInput.value;
          
          if(!url) return alert("Please enter an Instagram URL");
          
          adminData.feeds = adminData.feeds || [];
          adminData.feeds.unshift({ url, type, createdAt: Date.now() });
          
          urlInput.value = "";
          window.syncFeedsToFirebase();
          window.renderFeeds();
      };

      window.deleteFeed = function(idx) {
          if(!confirm("Are you sure you want to delete this feed?")) return;
          adminData.feeds.splice(idx, 1);
          window.syncFeedsToFirebase();
          window.renderFeeds();
      };

      window.renderFeeds = function() {
          const container = document.getElementById('feedsList');
          if (!container) return;
          if (!adminData.feeds || adminData.feeds.length === 0) {
              container.innerHTML = '<p style="color:var(--muted); font-size:0.8rem;">No feeds added yet.</p>';
              return;
          }
          
          container.innerHTML = adminData.feeds.map((feed, idx) => {
              const d = new Date(feed.createdAt || Date.now()).toLocaleDateString();
              return \`
                  <div style="background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:1rem; position:relative;">
                     <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                         <div style="font-size:0.75rem; color:var(--muted); text-transform:uppercase; font-weight:700;"><i class="ph ph-instagram-logo"></i> \${feed.type}</div>
                         <div style="font-size:0.65rem; color:var(--muted);">\${d}</div>
                     </div>
                     <a href="\${feed.url}" target="_blank" style="color:#3b82f6; font-size:0.8rem; word-break:break-all; display:block; margin-bottom:1rem; background:rgba(59,130,246,0.1); padding:0.5rem; border-radius:4px;">\${feed.url}</a>
                     <button class="btn btn-sm" style="border:1px solid #ef4444; color:#ef4444; width:100%;" onclick="window.deleteFeed(\${idx})"><i class="ph ph-trash"></i> Delete</button>
                  </div>
              \`;
          }).join('');
      };

      function syncLandingToFirebase() {`;
content = content.replace(jsAnchor, newJsFunctions);

fs.writeFileSync(path, content);
console.log("Patched admin-dashboard.html");

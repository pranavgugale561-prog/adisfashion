const fs = require('fs');
const path = './public/admin-dashboard.html';

const html = fs.readFileSync(path, 'utf8');

const newCSS = `    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@500;600;700;800;900&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/@phosphor-icons/web"></script>
    <style>
      :root {
        --font-heading: 'Outfit', sans-serif;
        --font-body: 'Inter', sans-serif;
        --gold: #FFE600;
        --gold-hover: #e5cf00;
        --gold-glow: rgba(255, 230, 0, 0.15);
        --gold-strong-glow: rgba(255, 230, 0, 0.3);
        
        --bg: #050505;
        --surface: #0a0a0a;
        --card: rgba(255, 255, 255, 0.02);
        --card-hover: rgba(255, 255, 255, 0.04);
        --card2: rgba(255, 255, 255, 0.03);
        --border: rgba(255, 255, 255, 0.06);
        --border-light: rgba(255, 255, 255, 0.1);
        
        --text: #ededed;
        --muted: #a1a1aa;
        --white: #ffffff;
        
        --radius-sm: 8px;
        --radius: 16px;
        --radius-lg: 24px;
        --transition: 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      }
      
      * { box-sizing: border-box; margin: 0; padding: 0; }
      
      body { 
        font-family: var(--font-body); 
        background-color: var(--bg); 
        color: var(--text); 
        min-height: 100vh; 
        background-image: 
          radial-gradient(circle at 10% 20%, rgba(255, 230, 0, 0.03), transparent 30%),
          radial-gradient(circle at 90% 80%, rgba(255, 255, 255, 0.02), transparent 30%);
        background-attachment: fixed;
        -webkit-font-smoothing: antialiased;
      }

      ::-webkit-scrollbar { width: 8px; height: 8px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

      /* Typography */
      h1, h2, h3, h4, h5 { font-family: var(--font-heading); }
      
      .admin-layout { display: grid; grid-template-columns: 260px 1fr; min-height: 100vh; }
      @media (max-width: 768px) { .admin-layout { grid-template-columns: 1fr; } }

      /* Sidebar */
      .admin-sidebar {
        background: var(--surface); 
        border-right: 1px solid var(--border);
        padding: 2.5rem 1.5rem; 
        display: flex; flex-direction: column; gap: 2rem;
        z-index: 50;
      }
      @media (max-width: 768px) {
        .admin-sidebar { 
          position: fixed; width: 260px; height: 100vh; 
          transform: translateX(-100%); transition: transform var(--transition); 
          background: rgba(10, 10, 10, 0.85); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
        }
        .admin-sidebar.open { transform: translateX(0); }
      }
      
      .admin-logo { display: flex; align-items: center; gap: 0.75rem; padding-left: 0.5rem; }
      .admin-logo img { height: 44px; filter: drop-shadow(0 0 8px rgba(255,255,255,0.1)); }
      .admin-logo span { font-family: var(--font-heading); font-size: 0.65rem; font-weight: 700; letter-spacing: 0.2em; color: var(--muted); display: block; text-transform: uppercase; }
      
      .admin-nav { display: flex; flex-direction: column; gap: 0.4rem; }
      .admin-nav a { 
        display: flex; align-items: center; gap: 0.75rem; 
        padding: 0.85rem 1rem; border-radius: var(--radius-sm); 
        color: var(--muted); text-decoration: none; font-size: 0.85rem; font-weight: 500;
        transition: all var(--transition);
        position: relative; overflow: hidden;
      }
      .admin-nav a:hover { background: var(--card-hover); color: var(--text); }
      .admin-nav a.active { 
        background: linear-gradient(90deg, rgba(255, 230, 0, 0.1) 0%, transparent 100%);
        color: var(--gold); font-weight: 600;
      }
      .admin-nav a.active::before {
        content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
        background: var(--gold); border-radius: 0 4px 4px 0;
        box-shadow: 0 0 12px var(--gold);
      }
      .admin-nav a i { font-size: 1.25rem; }

      /* Main Area */
      .admin-main { padding: 2.5rem 2rem; overflow-y: auto; position: relative; }
      @media (min-width: 769px) { .admin-main { padding: 3.5rem 4.5rem; } }
      
      .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem; flex-wrap: wrap; gap: 1rem; }
      .admin-header h1 { 
        font-size: 2.2rem; font-weight: 700; letter-spacing: -0.02em; 
        color: var(--white);
        text-shadow: 0 4px 24px rgba(255, 255, 255, 0.1);
      }
      .admin-user { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 500; color: var(--text); background: var(--card); padding: 0.5rem 1rem; border-radius: 100px; border: 1px solid var(--border); }
      .admin-user i { font-size: 1.3rem; color: var(--gold); filter: drop-shadow(0 0 4px var(--gold-glow)); }
      
      .mobile-menu-btn { display: none; background: none; border: none; color: var(--gold); font-size: 1.5rem; cursor: pointer; }
      @media (max-width: 768px) { .mobile-menu-btn { display: block; } }

      /* Stats Cards */
      .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 2.5rem; }
      @media (min-width: 769px) { .stats-grid { grid-template-columns: repeat(4, 1fr); gap: 1.5rem; } }
      
      .stat-card { 
        background: linear-gradient(145deg, var(--card) 0%, transparent 100%);
        border: 1px solid var(--border); border-radius: var(--radius-lg); 
        padding: 1.5rem; display: flex; align-items: center; gap: 1.25rem; 
        transition: all var(--transition); 
        backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); 
        box-shadow: 0 4px 24px rgba(0,0,0,0.3); 
        position: relative; overflow: hidden;
      }
      .stat-card::before {
        content: ''; position: absolute; inset: 0; background: linear-gradient(45deg, transparent, rgba(255,255,255,0.03), transparent);
        transform: translateX(-100%); transition: transform 0.6s ease;
      }
      .stat-card:hover { 
        border-color: var(--border-light); transform: translateY(-4px); 
        box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset; 
      }
      .stat-card:hover::before { transform: translateX(100%); }
      
      .stat-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; }
      .stat-icon.gold { background: linear-gradient(135deg, rgba(255,230,0,0.2), rgba(255,230,0,0.05)); color: var(--gold); border: 1px solid rgba(255,230,0,0.1); }
      .stat-icon.green { background: linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05)); color: #10b981; border: 1px solid rgba(16,185,129,0.1); }
      .stat-icon.blue { background: linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.05)); color: #3b82f6; border: 1px solid rgba(59,130,246,0.1); }
      .stat-icon.red { background: linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05)); color: #ef4444; border: 1px solid rgba(239,68,68,0.1); }
      
      .stat-value { font-family: var(--font-heading); font-size: 2.2rem; font-weight: 800; color: var(--white); line-height: 1; letter-spacing: -0.03em; }
      .stat-label { font-size: 0.75rem; color: var(--muted); margin-top: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }

      /* Live indicator */
      .live-dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block; margin-right: 6px; box-shadow: 0 0 12px rgba(16,185,129,0.6); animation: pulse 2s infinite; }
      @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } 100% { opacity: 1; transform: scale(1); } }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

      /* Buttons & Badges */
      .filter-btn { background: transparent; color: var(--muted); border: 1px solid var(--border); padding: 0.4rem 1rem; border-radius: 100px; cursor: pointer; font-size: 0.75rem; font-weight: 600; transition: all 0.2s; font-family: var(--font-body); }
      .filter-btn:hover { border-color: var(--gold); color: var(--white); }
      .filter-btn.active { background: var(--gold); color: var(--bg); border-color: var(--gold); box-shadow: 0 4px 12px var(--gold-glow); }
      .filter-btn.danger { color: #ef4444; } .filter-btn.danger:hover { border-color: #ef4444; }
      .filter-btn.danger.active { background: #ef4444; color: white; border-color: #ef4444; box-shadow: 0 4px 12px rgba(239,68,68,0.2); }
      
      .status-badge { font-size: 0.65rem; padding: 4px 8px; border-radius: 6px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: inline-flex; align-items: center; justify-content: center; }
      .status-badge.blocked { background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }

      /* Charts & Containers */
      .traffic-chart { 
        background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); 
        padding: 2rem; margin-bottom: 2.5rem; backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); 
        box-shadow: 0 8px 32px rgba(0,0,0,0.2); 
      }
      .traffic-chart h3 { font-family: var(--font-heading); font-size: 1.1rem; color: var(--white); font-weight: 700; margin-bottom: 2rem; display: flex; align-items: center; gap: 0.6rem; letter-spacing: -0.01em; }
      .chart-bars { display: flex; align-items: flex-end; gap: 6px; height: 160px; }
      .chart-bar { flex: 1; background: linear-gradient(to top, var(--gold), #ffeb3b); border-radius: 4px 4px 0 0; min-height: 4px; transition: height 0.8s cubic-bezier(0.25, 1, 0.5, 1); position: relative; opacity: 0.9; }
      .chart-bar:hover { opacity: 1; filter: brightness(1.1); box-shadow: 0 0 16px var(--gold-glow); }
      .chart-bar-label { position: absolute; bottom: -24px; left: 50%; transform: translateX(-50%); font-size: 0.6rem; color: var(--muted); white-space: nowrap; font-weight: 500; }
      .chart-bar-value { position: absolute; top: -22px; left: 50%; transform: translateX(-50%); font-size: 0.65rem; color: var(--gold); font-weight: 700; opacity: 0; transition: opacity 0.2s; }
      .chart-bar:hover .chart-bar-value { opacity: 1; }

      /* Tabs */
      .tab-nav { display: flex; gap: 0.75rem; border-bottom: 1px solid var(--border); margin-bottom: 2.5rem; overflow-x: auto; padding-bottom: 1rem; }
      .tab-nav button { padding: 0.6rem 1.25rem; background: transparent; border: 1px solid transparent; border-radius: 100px; font-weight: 600; font-size: 0.85rem; color: var(--muted); cursor: pointer; transition: all var(--transition); white-space: nowrap; font-family: var(--font-body); }
      .tab-nav button:hover { color: var(--text); background: var(--card-hover); }
      .tab-nav button.active { background: var(--gold); color: var(--bg); font-weight: 700; box-shadow: 0 4px 16px var(--gold-glow); }
      .tab-content { display: none; } .tab-content.active { display: block; animation: fadeIn 0.5s ease; }

      /* Tables */
      .admin-table-wrapper { border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--card); backdrop-filter: blur(24px); overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
      .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
      .admin-table th { background: rgba(0,0,0,0.5); padding: 1.25rem 1.5rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); font-weight: 700; border-bottom: 1px solid var(--border); }
      .admin-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.03); font-size: 0.9rem; color: var(--text); }
      .admin-table tr:last-child td { border-bottom: none; }
      .admin-table tr:hover td { background: rgba(255,255,255,0.02); }

      /* Product Editor */
      .product-editor-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
      @media (min-width: 769px) { .product-editor-grid { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); } }
      
      .product-edit-card { 
        background: var(--card2); border: 1px solid var(--border); border-radius: var(--radius-lg); 
        padding: 1.5rem; backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); 
        box-shadow: 0 8px 32px rgba(0,0,0,0.2); transition: all var(--transition); 
        display: flex; flex-direction: column;
      }
      .product-edit-card:hover { border-color: var(--border-light); box-shadow: 0 12px 48px rgba(0,0,0,0.3); transform: translateY(-2px); }
      .product-edit-card img { width: 100%; height: 220px; object-fit: cover; border-radius: 12px; margin-bottom: 1.25rem; background: var(--bg); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
      .product-edit-card label { display: block; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); margin-bottom: 0.5rem; margin-top: 1.25rem; }
      
      .product-edit-card input, .product-edit-card textarea, .product-edit-card select { 
        width: 100%; padding: 0.85rem 1.2rem; border: 1px solid var(--border); border-radius: 10px; 
        font-size: 0.9rem; background: rgba(0,0,0,0.3); color: var(--text); font-family: var(--font-body); 
        transition: all var(--transition); 
      }
      .product-edit-card input:focus, .product-edit-card textarea:focus, .product-edit-card select:focus { 
        outline: none; border-color: var(--gold); box-shadow: 0 0 0 4px var(--gold-glow); background: rgba(0,0,0,0.6); 
      }
      .product-edit-card textarea { resize: vertical; min-height: 100px; }

      .btn-sm { padding: 0.5rem 1rem; font-size: 0.8rem; border-radius: 100px; border: none; cursor: pointer; font-weight: 600; transition: all var(--transition); font-family: var(--font-body); }
      .btn-gold { background: var(--gold); color: var(--bg); box-shadow: 0 4px 12px var(--gold-glow); } 
      .btn-gold:hover { background: var(--white); color: var(--bg); box-shadow: 0 8px 24px rgba(255,255,255,0.2); transform: translateY(-1px); }
      .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text); } 
      .btn-outline:hover { border-color: var(--text); background: rgba(255,255,255,0.05); }
      .btn-group { display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap; }
      
      .btn-primary { background: var(--white); color: var(--bg); padding: 0.6rem 1.2rem; border-radius: 100px; border: none; font-weight: 600; cursor: pointer; transition: all var(--transition); font-family: var(--font-body); }
      .btn-primary:hover { background: var(--gold); box-shadow: 0 4px 16px var(--gold-glow); transform: translateY(-1px); }

      /* Activity / Leads List */
      .activity-list { display: flex; flex-direction: column; gap: 0.85rem; }
      .activity-item { 
        background: var(--card); border: 1px solid var(--border); border-radius: 16px; 
        padding: 1.25rem; display: flex; align-items: center; gap: 1.25rem; font-size: 0.9rem; 
        backdrop-filter: blur(12px); transition: transform var(--transition), border-color var(--transition);
      }
      .activity-item:hover { transform: translateX(4px); border-color: var(--border-light); }
      .activity-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
      .activity-dot.green { background: #10b981; box-shadow: 0 0 12px rgba(16,185,129,0.5); } 
      .activity-dot.blue { background: #3b82f6; box-shadow: 0 0 12px rgba(59,130,246,0.5); } 
      .activity-dot.orange { background: #f59e0b; box-shadow: 0 0 12px rgba(245,158,11,0.5); }
      .activity-time { font-size: 0.75rem; color: var(--muted); margin-left: auto; white-space: nowrap; font-weight: 500; }

      .lead-item { 
        background: var(--card); border: 1px solid var(--border); border-radius: 16px; 
        padding: 1.25rem; margin-bottom: 1rem; display: grid; grid-template-columns: 1fr auto; 
        gap: 1rem; align-items: center; backdrop-filter: blur(12px); transition: all var(--transition); 
      }
      .lead-item:hover { border-color: var(--gold); box-shadow: 0 8px 24px rgba(0,0,0,0.2); transform: translateY(-2px); }
      .lead-info { display: flex; flex-direction: column; gap: 6px; }
      .lead-info strong { color: var(--white); font-size: 1.05rem; font-weight: 600; letter-spacing: -0.01em; }
      .lead-info span { color: var(--muted); font-size: 0.85rem; display: flex; align-items: center; gap: 6px; }

      /* Login Screen */
      .admin-login-overlay { position: fixed; inset: 0; z-index: 10000; background: var(--bg); background-image: radial-gradient(circle at 50% 0%, rgba(255,230,0,0.08) 0%, transparent 70%); display: flex; align-items: center; justify-content: center; padding: 1rem; }
      .admin-login-box { 
        background: rgba(10,10,10,0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 32px; 
        padding: 3.5rem 3rem; max-width: 420px; width: 100%; text-align: center; 
        backdrop-filter: blur(32px); -webkit-backdrop-filter: blur(32px); 
        box-shadow: 0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.02) inset; 
      }
      .admin-login-box h2 { font-family: var(--font-heading); color: var(--gold); font-size: 2.2rem; letter-spacing: 0.15em; margin-bottom: 0.5rem; font-weight: 800; }
      .admin-login-box p { color: var(--muted); font-size: 0.95rem; margin-bottom: 2.5rem; }
      .admin-login-box input { width: 100%; padding: 1rem 1.25rem; border: 1px solid var(--border); border-radius: 12px; background: rgba(0,0,0,0.4); color: var(--white); font-size: 0.95rem; margin-bottom: 1.25rem; font-family: var(--font-body); transition: all var(--transition); }
      .admin-login-box input:focus { outline: none; border-color: var(--gold); box-shadow: 0 0 0 4px var(--gold-glow); background: rgba(0,0,0,0.7); }
      .admin-login-box input::placeholder { color: #666; }
      .admin-login-btn { width: 100%; padding: 1rem; background: var(--white); color: var(--bg); border: none; border-radius: 100px; font-size: 0.95rem; font-weight: 700; cursor: pointer; letter-spacing: 0.05em; transition: all var(--transition); margin-top: 0.5rem; font-family: var(--font-body); }
      .admin-login-btn:hover { background: var(--gold); box-shadow: 0 8px 24px var(--gold-glow); transform: translateY(-2px); }
      .login-error { color: #ef4444; font-size: 0.85rem; margin-top: 1rem; display: none; font-weight: 500; background: rgba(239,68,68,0.1); padding: 0.5rem; border-radius: 8px; border: 1px solid rgba(239,68,68,0.2); }

      /* Mobile Specific */
      @media (max-width: 768px) {
         .admin-header h1 { font-size: 1.5rem; }
         .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 0.75rem; }
         .stat-card { padding: 1rem; flex-direction: column; text-align: center; gap: 0.75rem; }
         .stat-icon { margin: 0 auto; width: 44px; height: 44px; font-size: 1.2rem; }
         .stat-value { font-size: 1.5rem; }
         .admin-main { padding: 1.25rem; padding-top: 5rem; }
         .admin-table-wrapper { overflow-x: auto; border-radius: 16px; }
         .admin-login-box { padding: 2.5rem 2rem; border-radius: 24px; }
         .tab-nav button { font-size: 0.8rem; padding: 0.5rem 1rem; }
      }
      
      .mobile-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 40; backdrop-filter: blur(8px); display: none; transition: opacity var(--transition); opacity: 0; }
      .mobile-overlay.open { display: block; opacity: 1; }
      
      .mobile-header { display: none; }
      @media (max-width: 768px) {
         .mobile-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; background: rgba(10,10,10,0.85); border-bottom: 1px solid var(--border); position: fixed; top: 0; left: 0; right: 0; z-index: 30; backdrop-filter: blur(24px); }
         .admin-header .mobile-menu-btn { display: none; }
      }

      /* Dropdowns */
      .date-filter-btn {
         background: var(--card); color: var(--text); border: 1px solid var(--border); 
         padding: 0.6rem 1.2rem; border-radius: 100px; display: flex; align-items: center; gap: 0.75rem; 
         cursor: pointer; font-size: 0.85rem; font-weight: 500; transition: all var(--transition);
         font-family: var(--font-body); min-width: 150px; justify-content: space-between;
      }
      .date-filter-btn:hover { background: var(--card-hover); border-color: var(--border-light); }
      
      .date-dropdown {
         position: absolute; top: calc(100% + 8px); right: 0; background: rgba(20,20,20,0.95); border: 1px solid var(--border);
         border-radius: 16px; width: 280px; z-index: 1000; box-shadow: 0 16px 48px rgba(0,0,0,0.5);
         display: none; padding: 0.5rem; backdrop-filter: blur(24px);
      }
      .date-dropdown.show { display: block; animation: fadeIn 0.2s ease; }
      
      .date-option {
         display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem;
         cursor: pointer; font-size: 0.85rem; color: var(--muted); font-weight: 500;
         border-radius: 10px; transition: all 0.2s;
      }
      .date-option:hover { background: rgba(255,255,255,0.04); color: var(--text); }
      .date-option.active { color: var(--white); background: rgba(255,255,255,0.06); }
      .date-option .radio-circle { width: 16px; height: 16px; border-radius: 50%; border: 2px solid var(--muted); position: relative; transition: all 0.2s; }
      .date-option.active .radio-circle { border-color: var(--gold); }
      .date-option.active .radio-circle::after {
         content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
         width: 8px; height: 8px; background: var(--gold); border-radius: 50%;
      }
    </style>`;

const startStr = '<link rel="preconnect" href="https://fonts.googleapis.com">';
const endStr = '</style>';

const startIndex = html.indexOf(startStr);
const endIndex = html.indexOf(endStr) + endStr.length;

if (startIndex !== -1 && endIndex !== -1) {
    const newHtml = html.substring(0, startIndex) + newCSS + html.substring(endIndex);
    fs.writeFileSync(path, newHtml, 'utf8');
    console.log("CSS successfully updated!");
} else {
    console.log("Could not find start or end tags!");
}

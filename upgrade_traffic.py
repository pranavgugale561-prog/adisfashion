import os
import re

html_path = r'c:\Users\HP\Desktop\adis fashion website\public\admin-dashboard.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Insert Chart.js CDN before </head>
if 'chart.js' not in html:
    html = html.replace('</head>', '  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>\n  </head>')

# 2. Replace the HTML container
if '<div class="chart-bars" id="chartBars"></div>' in html:
    html = html.replace('<div class="chart-bars" id="chartBars"></div>', '<div style="position:relative; height:300px; width:100%;"><canvas id="trafficChartCanvas"></canvas></div>')

# 3. Replace the JS logic
# We'll use regex to replace from `const chartBars` down to `}).join('');`
pattern = re.compile(r"const chartBars = document\.getElementById\('chartBars'\);.*?}\)\.join\(''\);", re.DOTALL)

chart_js_logic = """
        const canvas = document.getElementById('trafficChartCanvas');
        if (canvas) {
           let visualDaysCount = Math.min(daysCount, 30); // Prevent CSS overflow / too much data visually

           const days = [];
           for (let i = visualDaysCount - 1; i >= 0; i--) {
             const d = new Date(chartEndDate.getTime()); 
             d.setDate(d.getDate() - i);
             const dateStr = d.toISOString().slice(0, 10);
             let count = 0;
             if (analytics.pageViews && analytics.pageViews[dateStr]) {
                 const viewsObj = analytics.pageViews[dateStr];
                 count = Object.values(viewsObj).reduce((s, v) => s + (typeof v === 'number' ? v : 1), 0);
             }
             let labelStr = d.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });
             days.push({ label: labelStr, count, date: dateStr });
           }

           const ctx = canvas.getContext('2d');
           
           // Gradient fill
           const gradient = ctx.createLinearGradient(0, 0, 0, 300);
           gradient.addColorStop(0, 'rgba(212, 175, 55, 0.5)'); // Gold semi-transparent
           gradient.addColorStop(1, 'rgba(212, 175, 55, 0.0)'); // Transparent

           if (window.myTrafficChart) {
               window.myTrafficChart.destroy();
           }

           window.myTrafficChart = new Chart(ctx, {
               type: 'line',
               data: {
                   labels: days.map(d => d.label),
                   datasets: [{
                       label: 'Page Views',
                       data: days.map(d => d.count),
                       borderColor: '#d4af37',
                       backgroundColor: gradient,
                       borderWidth: 3,
                       pointBackgroundColor: '#10b981',
                       pointBorderColor: '#fff',
                       pointBorderWidth: 2,
                       pointRadius: 4,
                       pointHoverRadius: 6,
                       fill: true,
                       tension: 0.4
                   }]
               },
               options: {
                   responsive: true,
                   maintainAspectRatio: false,
                   plugins: {
                       legend: { display: false },
                       tooltip: {
                           backgroundColor: 'rgba(10,10,10,0.9)',
                           titleColor: '#d4af37',
                           bodyColor: '#fff',
                           borderColor: 'rgba(255,215,0,0.2)',
                           borderWidth: 1,
                           padding: 12,
                           displayColors: false,
                           callbacks: {
                               label: function(context) {
                                   return context.parsed.y + ' Views';
                               }
                           }
                       }
                   },
                   scales: {
                       x: {
                           grid: { color: 'rgba(255,255,255,0.05)' },
                           ticks: { color: '#a0a0a0', font: { size: 11, family: 'Outfit, sans-serif' } }
                       },
                       y: {
                           beginAtZero: true,
                           grid: { color: 'rgba(255,255,255,0.05)' },
                           ticks: { color: '#a0a0a0', font: { size: 11, family: 'Outfit, sans-serif' }, precision: 0 }
                       }
                   },
                   interaction: {
                       mode: 'index',
                       intersect: false,
                   }
               }
           });
        }
"""

if pattern.search(html):
    html = pattern.sub(chart_js_logic.strip(), html)
else:
    print("WARNING: Could not find the regex pattern for JS replacement.")

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

print("Upgraded Real-Time Traffic to Chart.js!")

self.addEventListener('push', function(event) {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }
  
  const title = data.title || 'ADIS Fashion';
  const options = {
    body: data.body || 'New update from ADIS!',
    icon: '/favicon.ico',
    data: {
      url: data.url || '/',
      campaignId: data.campaignId || 'unknown'
    }
  };

  // Log Delivery
  if (options.data.campaignId) {
    fetch(`https://adis-fashion-default-rtdb.firebaseio.com/push_analytics/${options.data.campaignId}/delivered.json`, {
      method: 'POST',
      body: JSON.stringify({ time: Date.now() })
    }).catch(e => console.error('SW fetch error:', e));
  }

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const urlToOpen = new URL(event.notification.data.url || '/', self.location.origin);
  const campaignId = event.notification.data.campaignId;
  
  if (campaignId) {
    urlToOpen.searchParams.append('utm_source', 'push');
    urlToOpen.searchParams.append('campaignId', campaignId);
    
    // Log Open
    event.waitUntil(
      fetch(`https://adis-fashion-default-rtdb.firebaseio.com/push_analytics/${campaignId}/opened.json`, {
        method: 'POST',
        body: JSON.stringify({ time: Date.now() })
      }).then(() => clients.openWindow(urlToOpen.href))
        .catch(() => clients.openWindow(urlToOpen.href))
    );
  } else {
    event.waitUntil(clients.openWindow(urlToOpen.href));
  }
});

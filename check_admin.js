const https = require('https');

https.get('https://adisfashion-u131.vercel.app/admin-dashboard.html', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const match = data.match(/const firebaseConfig = {[^}]+}/);
    if (match) {
      console.log('Found Firebase Config:', match[0]);
    } else {
      console.log('Firebase config not found');
    }
  });
}).on('error', (err) => {
  console.log('Error:', err.message);
});

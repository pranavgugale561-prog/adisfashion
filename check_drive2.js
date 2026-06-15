const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

const app = initializeApp({
  apiKey: 'AIzaSyBk9_XRdWKSiG_-4iRmsctUTtorupxnUqM',
  authDomain: 'adis-fashion-dc509.firebaseapp.com',
  databaseURL: 'https://adis-fashion-dc509-default-rtdb.firebaseio.com',
  projectId: 'adis-fashion-dc509'
});
const db = getDatabase(app);

get(ref(db, '/')).then(snap => {
  const str = JSON.stringify(snap.val());
  const matches = str.match(/drive\.google\.com[^"\s]*/g);
  console.log('Found Drive Links in adis-fashion-dc509 DB:', matches ? matches.length : 0);
  if (matches) console.log(matches.slice(0, 5));
  process.exit(0);
}).catch(e => {
  console.error('Failed:', e);
  process.exit(1);
});

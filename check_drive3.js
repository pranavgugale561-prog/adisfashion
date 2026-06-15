const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

const app = initializeApp({
  apiKey: "AIzaSyA358G8v6GSaqdUemaME3-CKdqekxp9kcg",
  authDomain: "adiscreations.firebaseapp.com",
  databaseURL: "https://adiscreations-default-rtdb.firebaseio.com",
  projectId: "ADIScreations"
});
const db = getDatabase(app);

get(ref(db, '/')).then(snap => {
  const data = snap.val();
  const str = JSON.stringify(data);
  const matches = str.match(/drive\.google\.com[^"\s]*/g);
  console.log('Found Drive Links in ADIScreations DB:', matches ? matches.length : 0);
  if (matches) console.log(matches.slice(0, 5));
  
  if (data && data.landingConfig) {
      console.log('Landing Config in ADIScreations:', JSON.stringify(data.landingConfig).substring(0,200));
  }
  process.exit(0);
}).catch(e => {
  console.error('Failed:', e);
  process.exit(1);
});

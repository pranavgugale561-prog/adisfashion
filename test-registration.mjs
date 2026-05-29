/**
 * ADIS Registration Verification Script
 * Run AFTER fixing Firebase security rules:
 *   node test-registration.mjs
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set, remove } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyA358G8v6GSaqdUemaME3-CKdqekxp9kcg",
  authDomain: "adiscreations.firebaseapp.com",
  databaseURL: "https://ADIScreations-default-rtdb.firebaseio.com",
  projectId: "ADIScreations",
  storageBucket: "adiscreations.firebasestorage.app",
  messagingSenderId: "593523996212",
  appId: "1:593523996212:web:07ab25c74fa1cc0b2ebc61",
};

// Same helpers as frontend (src/app/my-orders/page.tsx)
function sanitizeKey(phone) {
  return phone.replace(/[.#$[\]]/g, '_');
}

function hashPassword(password) {
  return Array.from(password)
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
}

const DUMMY_PHONE    = '9876543210';
const DUMMY_PASSWORD = 'Test@1234';
const WRONG_PASSWORD = 'WrongPass';

async function run() {
  console.log('\n📱 ADIS Registration & Login Test\n' + '='.repeat(50));
  let passed = 0, failed = 0;

  const app = initializeApp(firebaseConfig, `adis-test-${Date.now()}`);
  const db  = getDatabase(app);
  const key = sanitizeKey(DUMMY_PHONE);
  const userRef = ref(db, `users/${key}`);

  const pass = (msg) => { console.log(`   ✅ PASS: ${msg}`); passed++; };
  const fail = (msg) => { console.log(`   ❌ FAIL: ${msg}`); failed++; };

  // Cleanup first
  console.log('\n🧹 Cleaning up old test data...');
  try { await remove(userRef); console.log('   Done.\n'); } catch(e) { console.log(`   (skip: ${e.message})\n`); }

  // ── STEP 1: Registration ─────────────────────────────────
  console.log('📝 STEP 1: Register new user');
  try {
    const snap = await get(userRef);
    if (snap.exists()) { fail('User exists before registration'); }
    else {
      await set(userRef, {
        phone: DUMMY_PHONE,
        password: hashPassword(DUMMY_PASSWORD),
        createdAt: new Date().toISOString(),
      });
      pass('User registered to Firebase successfully');
    }
  } catch(e) { fail(`Registration threw: ${e.message}`); }

  // ── STEP 2: Duplicate registration ──────────────────────
  console.log('\n📝 STEP 2: Duplicate registration check');
  try {
    const snap = await get(userRef);
    if (snap.exists()) { pass('"User already exists" correctly detected'); }
    else { fail('User not found after registration (write may have failed)'); }
  } catch(e) { fail(`Read threw: ${e.message}`); }

  // ── STEP 3: Sign in with correct password ───────────────
  console.log('\n📝 STEP 3: Sign in - correct password');
  try {
    const snap = await get(userRef);
    const data = snap.val();
    if (data?.password === hashPassword(DUMMY_PASSWORD)) {
      pass('Login successful with correct password');
    } else {
      fail(`Password mismatch. Stored: ${data?.password}, Expected: ${hashPassword(DUMMY_PASSWORD)}`);
    }
  } catch(e) { fail(`Login threw: ${e.message}`); }

  // ── STEP 4: Sign in with wrong password ─────────────────
  console.log('\n📝 STEP 4: Sign in - wrong password rejected');
  try {
    const snap = await get(userRef);
    const data = snap.val();
    if (data?.password !== hashPassword(WRONG_PASSWORD)) {
      pass('Wrong password correctly rejected');
    } else {
      fail('Wrong password was accepted (hash collision!)');
    }
  } catch(e) { fail(`Test threw: ${e.message}`); }

  // ── STEP 5: Cleanup ─────────────────────────────────────
  console.log('\n🧹 STEP 5: Cleanup dummy user');
  try {
    await remove(userRef);
    const snap = await get(userRef);
    if (!snap.exists()) { pass('Dummy user removed cleanly from Firebase'); }
    else { fail('User still exists after delete'); }
  } catch(e) { fail(`Cleanup threw: ${e.message}`); }

  console.log('\n' + '='.repeat(50));
  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Registration works correctly.\n');
  } else {
    console.log('⚠️  Some tests failed. See walkthrough.md for fix instructions.\n');
  }
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((e) => {
  console.error('\n💥 Test crashed:', e.message);
  if (e.message?.includes('404') || e.message?.includes('permission')) {
    console.log('\n⚠️  FIX REQUIRED: Update Firebase Realtime Database security rules.');
    console.log('   See walkthrough.md for exact steps.\n');
  }
  process.exit(1);
});

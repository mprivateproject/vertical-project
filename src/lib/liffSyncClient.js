/* global liff */
import { base44 } from '@/api/base44Client';

/**
 * Wait for LIFF to be ready and user logged in
 * Prevents race conditions where LIFF is still initializing
 */
async function ensureLiffReady() {
  return new Promise((resolve, reject) => {
    const maxAttempts = 30;
    let attempts = 0;

    const checkReady = () => {
      attempts++;
      
      if (typeof liff === 'undefined') {
        if (attempts >= maxAttempts) {
          reject(new Error('LIFF failed to initialize'));
        } else {
          setTimeout(checkReady, 100);
        }
        return;
      }

      if (!liff.isLoggedIn()) {
        reject(new Error('User not logged in. Please log in with LINE first.'));
        return;
      }

      resolve();
    };

    checkReady();
  });
}

/**
 * Centralized helper to call liffSync backend function
 * Enforces: auth guard → token validation → proper request structure → logging
 */
export async function callLiffSync(action, data = {}) {
  try {
    // 1️⃣ Guard: Ensure LIFF is ready and user is logged in
    await ensureLiffReady();

    // 2️⃣ Token: Retrieve and validate ID token
    const idToken = liff.getIDToken();
    if (!idToken) {
      throw new Error('Failed to retrieve LIFF ID Token. Try logging in again.');
    }

    // 3️⃣ Log: Debug request structure
    console.log('🔐 LIFF SYNC REQUEST', {
      action,
      hasIdToken: !!idToken,
      idTokenLength: idToken.length,
      timestamp: new Date().toISOString(),
      data,
    });

    // 4️⃣ Build: Proper request payload
    const payload = {
      action,
      idToken,
      ...data,
    };

    // 5️⃣ Call: Send request with auth header via SDK
    const result = await base44.functions.invoke('liffSync', payload);

    // 6️⃣ Log: Success response
    console.log('✅ LIFF SYNC RESPONSE', {
      action,
      status: 'success',
      timestamp: new Date().toISOString(),
    });

    return result.data;

  } catch (error) {
    // 7️⃣ Log: Detailed error for debugging
    console.error('❌ LIFF SYNC ERROR', {
      action,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}
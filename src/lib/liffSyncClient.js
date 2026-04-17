import { base44 } from '@/api/base44Client';

/**
 * Centralized helper to call liffSync backend function
 * Ensures all requests have valid structure and proper authentication
 */
export async function callLiffSync(action, data = {}) {
  // Get idToken from LIFF
  if (typeof liff === 'undefined') {
    throw new Error('LIFF not initialized');
  }

  const idToken = liff.getIDToken();
  if (!idToken) {
    console.warn('No idToken available, user may not be logged in');
    throw new Error('No idToken available');
  }

  // Build request payload
  const payload = {
    action,
    idToken,
    ...data,
  };

  // Log for debugging
  console.log('LIFF SYNC REQUEST:', { action, hasIdToken: !!idToken, ...data });

  try {
    // Call backend function
    const response = await base44.functions.invoke('liffSync', payload);
    console.log('LIFF SYNC RESPONSE:', { action, status: 'success' });
    return response.data;
  } catch (error) {
    console.error('LIFF SYNC ERROR:', { action, error: error.message, payload });
    throw error;
  }
}
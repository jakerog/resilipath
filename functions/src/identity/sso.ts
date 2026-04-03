/**
 * ResiliPath - Identity Provider Discovery API
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Task 4: discoverIdentityProvider HTTPS Callable
 * Lookups IdP configuration based on email domain.
 */
export const discoverIdentityProvider = functions.runWith({
  memory: '256MB',
  timeoutSeconds: 60,
}).https.onCall(async (data, context) => {
  const { email } = data;
  if (!email || !email.includes('@')) {
    throw new functions.https.HttpsError('invalid-argument', 'Valid email is required for IdP discovery.');
  }

  const domain = email.split('@')[1].toLowerCase();
  const db = admin.firestore();

  try {
    // 1. Query for tenant with matching domain whitelist
    const tenantsSnapshot = await db.collection('tenants')
      .where('authConfig.domainWhitelist', 'array-contains', domain)
      .limit(1)
      .get();

    if (tenantsSnapshot.empty) {
      return {
        providerType: 'password',
        enforceSso: false
      };
    }

    const tenantData = tenantsSnapshot.docs[0].data();
    const authConfig = tenantData.authConfig;

    // 2. Return sanitized config (Omit sensitive secrets if any)
    return {
      providerType: authConfig.providerType || 'password',
      enforceSso: authConfig.enforceSso || false,
      ssoUrl: authConfig.ssoUrl,
      tenantId: tenantData.tenantId,
      name: tenantData.name
    };

  } catch (error: any) {
    console.error('IdP Discovery failed:', error);
    throw new functions.https.HttpsError('internal', 'Discovery engine error.');
  }
});

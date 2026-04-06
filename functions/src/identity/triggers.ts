/**
 * Auth Triggers for ResiliPath
 * Handles automated user provisioning and initial tenant mapping.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Task 4: onUserCreated Trigger
 * Assigns default tenantId and User role to newly registered users.
 * Optimization (Task 9): 256MB memory, 1 min timeout (Free Tier optimization).
 */
export const onUserCreated = functions.runWith({
  memory: '256MB',
  timeoutSeconds: 60,
}).auth.user().onCreate(async (user) => {
  const { uid, email } = user;

  // 1. Initial Defaults
  let targetTenantId = 'pending';
  let targetRole = 'User';
  let targetTier = 'standard';

  try {
    const db = admin.firestore();

    // 2. Automated IdP Role Mapping (Task 5)
    if (email) {
      const domain = email.split('@')[1].toLowerCase();
      const tenantsSnapshot = await db.collection('tenants')
        .where('authConfig.domainWhitelist', 'array-contains', domain)
        .limit(1)
        .get();

      if (!tenantsSnapshot.empty) {
        const tenant = tenantsSnapshot.docs[0].data();
        targetTenantId = tenant.tenantId;
        targetTier = tenant.tier || 'standard';

        // Check for specific IdP attribute mapping if available
        // Note: In a production GCIP environment, we'd use 'beforeUserSignedIn'
        // to extract actual assertions. Here we apply domain-based auto-tenant.
      }
    }

    // 3. Set custom claims for the user
    await admin.auth().setCustomUserClaims(uid, {
      tenantId: targetTenantId,
      role: targetRole,
      tier: targetTier,
    });

    // 4. Log the event for auditability (Task 3 compliance)
    const auditLog = {
      who: uid,
      email: email || 'N/A',
      what: 'USER_PROVISIONED',
      when: admin.firestore.FieldValue.serverTimestamp(),
      tenantId: targetTenantId,
      metadata: {
        initialRole: targetRole,
        initialTier: targetTier,
        discoveryMethod: targetTenantId !== 'pending' ? 'DOMAIN_AUTO_DISCOVERY' : 'DEFAULT_PENDING'
      }
    };

    await db.collection('audit_logs').add(auditLog);

    console.log(`User ${uid} provisioned: tenantId=${targetTenantId}, role=${targetRole}`);
  } catch (error) {
    console.error(`Error provisioning user ${uid}:`, error);
  }
});

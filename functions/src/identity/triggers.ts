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

  // Default to a 'pending' tenantId and 'User' role
  // In a real-world scenario, this might check for invited emails or other metadata.
  const defaultTenantId = 'pending';
  const defaultRole = 'User';

  try {
    // Set custom claims for the user
    await admin.auth().setCustomUserClaims(uid, {
      tenantId: defaultTenantId,
      role: defaultRole,
      tier: 'standard',
    });

    // Log the event for auditability (Task 3 compliance)
    const auditLog = {
      who: uid,
      email: email || 'N/A',
      what: 'USER_PROVISIONED',
      when: admin.firestore.FieldValue.serverTimestamp(),
      tenantId: defaultTenantId,
      metadata: {
        initialRole: defaultRole,
        initialTier: 'standard',
      }
    };

    // Note: Writing to the audit_log collection is essential for SOC 2 (M3).
    await admin.firestore().collection('audit_logs').add(auditLog);

    console.log(`User ${uid} provisioned with default claims: tenantId=${defaultTenantId}, role=${defaultRole}`);
  } catch (error) {
    console.error(`Error provisioning user ${uid}:`, error);
  }
});

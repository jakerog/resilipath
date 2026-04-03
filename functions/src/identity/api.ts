/**
 * Identity API for ResiliPath
 * Handles manual user role management and tenant configuration.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Task 5: setTenantClaims HTTPS Callable
 * Allows Admin-level role management with tenant isolation.
 * Optimization (Task 9): 256MB memory, 1 min timeout (Free Tier optimization).
 */
export const setTenantClaims = functions.runWith({
  memory: '256MB',
  timeoutSeconds: 60,
}).https.onCall(async (data, context) => {
  // 1. Verify caller identity and permissions (M5: RBAC)
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerClaims = context.auth.token || {};

  // Check for Admin role or global superuser status
  const isCallerAdmin = callerClaims.role === 'Admin';
  const isGlobalSuperUser = callerClaims.isGlobalSuperUser === true;

  if (!isCallerAdmin && !isGlobalSuperUser) {
    throw new functions.https.HttpsError('permission-denied', 'Caller does not have Admin privileges.');
  }

  // 2. Validate input data
  const { uid, tenantId, role, tier } = data;

  if (!uid || !tenantId || !role) {
    throw new functions.https.HttpsError('invalid-argument', 'UID, tenantId, and role are required.');
  }

  const validRoles = ['Admin', 'User', 'Report', 'Moderator'];
  const validTiers = ['standard', 'enterprise', 'elite'];

  if (!validRoles.includes(role)) {
    throw new functions.https.HttpsError('invalid-argument', `Invalid role. Must be one of: ${validRoles.join(', ')}`);
  }

  if (tier && !validTiers.includes(tier)) {
    throw new functions.https.HttpsError('invalid-argument', `Invalid tier. Must be one of: ${validTiers.join(', ')}`);
  }

  // 3. Enforce tenant isolation (M1/M5)
  // Non-global admins can only modify users within their own tenant.
  if (!isGlobalSuperUser && callerClaims.tenantId !== tenantId) {
    throw new functions.https.HttpsError('permission-denied', 'Admins can only modify users within their own tenant.');
  }

  try {
    // 4. Update custom claims (ADR-001/002)
    const newClaims = {
      tenantId,
      role,
      tier: tier || 'standard',
    };

    await admin.auth().setCustomUserClaims(uid, newClaims);

    // 5. Create immutable audit log (M3: Compliance Alignment)
    const auditLog = {
      who: callerUid,
      what: 'USER_ROLE_UPDATED',
      when: admin.firestore.FieldValue.serverTimestamp(),
      tenantId,
      metadata: {
        targetUid: uid,
        newRole: role,
        newTier: tier || 'standard',
      },
    };

    await admin.firestore().collection('audit_logs').add(auditLog);

    console.log(`User ${uid} claims updated to: tenantId=${tenantId}, role=${role}, tier=${tier || 'standard'} by ${callerUid}`);

    return {
      success: true,
      message: `User ${uid} claims updated successfully.`,
    };
  } catch (error: any) {
    console.error(`Error updating claims for user ${uid}:`, error);
    throw new functions.https.HttpsError('internal', error.message || 'Error updating user claims.');
  }
});

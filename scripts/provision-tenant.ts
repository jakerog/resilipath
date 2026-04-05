/**
 * Task 7: Manual Tenant/Admin Provisioning Script
 * ResiliPath - Identity & Access Management
 *
 * Usage:
 * 1. Ensure you have service account credentials (GOOGLE_APPLICATION_CREDENTIALS) set.
 * 2. Run: node scripts/provision-tenant.js [email] [tenantId] [role] [tier]
 */

import admin from 'firebase-admin';

// Initialize Admin SDK
// Defensive Logic: Prioritize the emulator if variables are set, else default to 'resilipath-staging'
const isEmulator = !!(process.env.FIREBASE_AUTH_EMULATOR_HOST || process.env.FIRESTORE_EMULATOR_HOST);
const defaultProject = isEmulator ? 'resilipath-test' : 'resilipath-staging';
const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || defaultProject;

if (!admin.apps.length) {
  admin.initializeApp({ projectId });
}

if (isEmulator) {
  console.log(`📡 Connecting to Firebase Emulators (Project: ${projectId})`);
} else {
  console.log(`🌍 Connecting to Production/Staging (Project: ${projectId})`);
  if (projectId === 'resilipath-test') {
    console.warn('⚠️ WARNING: Using "resilipath-test" without emulator variables. This will likely fail.');
    console.warn('   If you intended to use the emulator, run: export FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099"');
    console.warn('   If you intended to use staging, run: export GOOGLE_CLOUD_PROJECT="resilipath-staging"');
  }
}

async function provisionTenant(email: string, tenantId: string, role: string, tier: string = 'standard') {
  try {
    // 1. Get user by email
    const user = await admin.auth().getUserByEmail(email);
    const { uid } = user;

    console.log(`User found: ${uid} (${email})`);

    // 2. Set custom claims for the user (ADR-001/002)
    const claims = {
      tenantId,
      role,
      tier,
    };

    await admin.auth().setCustomUserClaims(uid, claims);
    console.log(`Custom claims set: ${JSON.stringify(claims)}`);

    // 3. (Optional) Create tenant record in Firestore (Task 3 compliance)
    const tenantRecord = {
      tenantId,
      name: `Tenant ${tenantId}`,
      tier,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      admins: [uid],
    };

    await admin.firestore().collection('tenants').doc(tenantId).set(tenantRecord, { merge: true });
    console.log(`Tenant record created in Firestore: ${tenantId}`);

    // 4. Create audit log (M3: Compliance Alignment)
    const auditLog = {
      who: 'SYSTEM_MANUAL_PROVISION',
      what: 'TENANT_ADMIN_PROVISIONED',
      when: admin.firestore.FieldValue.serverTimestamp(),
      tenantId,
      metadata: {
        targetUid: uid,
        targetEmail: email,
        initialRole: role,
        initialTier: tier,
      },
    };

    await admin.firestore().collection('audit_logs').add(auditLog);
    console.log(`Audit log entry created for manual provisioning.`);

    console.log(`SUCCESS: User ${email} provisioned as ${role} for tenant ${tenantId}.`);
  } catch (error: any) {
    console.error(`ERROR: ${error.message}`);
    process.exit(1);
  }
}

// CLI entry point
const args = process.argv.slice(2);
if (args.length < 3) {
  console.log('Usage: node scripts/provision-tenant.js [email] [tenantId] [role] [tier]');
  process.exit(1);
}

const [email, tenantId, role, tier] = args;
provisionTenant(email, tenantId, role, tier || 'standard');

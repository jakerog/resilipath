/**
 * Task 8: Firestore Security Rules Unit Tests
 * ResiliPath - Data Layer & Persistence
 *
 * Uses @firebase/rules-unit-testing to validate isolation and RBAC.
 */

const {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} = require('@firebase/rules-unit-testing');
const fs = require('fs');
const path = require('path');

describe('Firestore Security Rules', function() {
  this.timeout(10000); // Increase timeout for environment initialization
  let testEnv;

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'resilipath-test',
      firestore: {
        rules: fs.readFileSync(path.resolve(__dirname, '../../firestore.rules'), 'utf8'),
        host: '127.0.0.1',
        port: 8080,
      },
    });
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  after(async () => {
    await testEnv.cleanup();
  });

  // 1. Tenant Isolation Tests (M1)
  describe('Tenant Isolation', () => {
    it('should prevent cross-tenant data access', async () => {
      const aliceDb = testEnv.authenticatedContext('alice', {
        tenantId: 'tenant-a',
        role: 'User',
      }).firestore();

      // Create a document belonging to tenant-b
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('exercises').doc('ex-2').set({
          tenantId: 'tenant-b',
          name: 'Exercise B',
        });
      });

      // Alice (tenant-a) should NOT be able to read tenant-b's exercise
      await assertFails(aliceDb.collection('exercises').doc('ex-2').get());
    });

    it('should allow access to same-tenant data', async () => {
      const aliceDb = testEnv.authenticatedContext('alice', {
        tenantId: 'tenant-a',
        role: 'User',
      }).firestore();

      // Setup same-tenant exercise
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('exercises').doc('ex-a').set({
          tenantId: 'tenant-a',
          name: 'Exercise A',
        });
      });

      await assertSucceeds(aliceDb.collection('exercises').doc('ex-a').get());
    });
  });

  // 2. RBAC Tests (M5)
  describe('Role-Based Access Control', () => {
    it('should allow Admin to delete exercises', async () => {
      const adminDb = testEnv.authenticatedContext('admin-user', {
        tenantId: 'tenant-a',
        role: 'Admin',
      }).firestore();

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('exercises').doc('ex-a').set({
          tenantId: 'tenant-a',
          name: 'Exercise A',
        });
      });

      await assertSucceeds(adminDb.collection('exercises').doc('ex-a').delete());
    });

    it('should prevent User from deleting exercises', async () => {
      const userDb = testEnv.authenticatedContext('user-user', {
        tenantId: 'tenant-a',
        role: 'User',
      }).firestore();

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('exercises').doc('ex-a').set({
          tenantId: 'tenant-a',
          name: 'Exercise A',
        });
      });

      await assertFails(userDb.collection('exercises').doc('ex-a').delete());
    });
  });

  // 3. Immutability Tests (M3)
  describe('Audit Log Immutability', () => {
    it('should prevent updating audit logs', async () => {
      const adminDb = testEnv.authenticatedContext('admin-user', {
        tenantId: 'tenant-a',
        role: 'Admin',
      }).firestore();

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('audit_logs').doc('log-1').set({
          tenantId: 'tenant-a',
          what: 'LOGIN',
        });
      });

      await assertFails(adminDb.collection('audit_logs').doc('log-1').update({
        what: 'MODIFIED',
      }));
    });
  });

  // 4. Communications Module Security (1.6)
  describe('Communications Module Security', () => {
    it('should allow Admin to read same-tenant mail', async () => {
      const adminDb = testEnv.authenticatedContext('admin-user', {
        tenantId: 'tenant-a',
        role: 'Admin',
      }).firestore();

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('mail').doc('mail-1').set({
          tenantId: 'tenant-a',
          to: 'user@example.com',
        });
      });

      await assertSucceeds(adminDb.collection('mail').doc('mail-1').get());
    });

    it('should prevent Admin from reading cross-tenant mail', async () => {
      const adminDb = testEnv.authenticatedContext('admin-user', {
        tenantId: 'tenant-a',
        role: 'Admin',
      }).firestore();

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('mail').doc('mail-b').set({
          tenantId: 'tenant-b',
          to: 'user-b@example.com',
        });
      });

      await assertFails(adminDb.collection('mail').doc('mail-b').get());
    });

    it('should allow users to create mail for their own tenant', async () => {
      const userDb = testEnv.authenticatedContext('user-user', {
        tenantId: 'tenant-a',
        role: 'User',
      }).firestore();

      await assertSucceeds(userDb.collection('mail').doc('mail-new').set({
        tenantId: 'tenant-a',
        to: 'new-user@example.com',
      }));
    });

    it('should prevent users from creating mail for other tenants', async () => {
      const userDb = testEnv.authenticatedContext('user-user', {
        tenantId: 'tenant-a',
        role: 'User',
      }).firestore();

      await assertFails(userDb.collection('mail').doc('mail-other').set({
        tenantId: 'tenant-b',
        to: 'other-user@example.com',
      }));
    });

    it('should allow read access to email templates for authenticated users', async () => {
      const userDb = testEnv.authenticatedContext('user-user', {
        tenantId: 'tenant-a',
        role: 'User',
      }).firestore();

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('email_templates').doc('task_ready').set({
          subject: 'Task Ready',
        });
      });

      await assertSucceeds(userDb.collection('email_templates').doc('task_ready').get());
    });
  });

  // 5. Asset Registry Security (2.1)
  describe('Asset Registry Security', () => {
    it('should allow Report role to read same-tenant assets', async () => {
      const reportDb = testEnv.authenticatedContext('report-user', {
        tenantId: 'tenant-a',
        role: 'Report',
      }).firestore();

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('assets').doc('asset-1').set({
          tenantId: 'tenant-a',
          name: 'Core Database',
        });
      });

      await assertSucceeds(reportDb.collection('assets').doc('asset-1').get());
    });

    it('should prevent cross-tenant asset access', async () => {
      const aliceDb = testEnv.authenticatedContext('alice', {
        tenantId: 'tenant-a',
        role: 'Admin',
      }).firestore();

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('assets').doc('asset-b').set({
          tenantId: 'tenant-b',
          name: 'Tenant B System',
        });
      });

      await assertFails(aliceDb.collection('assets').doc('asset-b').get());
    });

    it('should allow Moderator to create assets for their tenant', async () => {
      const modDb = testEnv.authenticatedContext('mod-user', {
        tenantId: 'tenant-a',
        role: 'Moderator',
      }).firestore();

      await assertSucceeds(modDb.collection('assets').doc('new-asset').set({
        tenantId: 'tenant-a',
        name: 'Web Server',
      }));
    });

    it('should prevent User role from creating assets', async () => {
      const userDb = testEnv.authenticatedContext('user-user', {
        tenantId: 'tenant-a',
        role: 'User',
      }).firestore();

      await assertFails(userDb.collection('assets').doc('illegal-asset').set({
        tenantId: 'tenant-a',
        name: 'Illegal Asset',
      }));
    });
  });
});

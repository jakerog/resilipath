const {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails
} = require('@firebase/rules-unit-testing');
const { readFileSync } = require('fs');

describe('Firestore Security Rules', () => {
  let testEnv;

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'resilipath-test',
      firestore: {
        rules: readFileSync('../firestore.rules', 'utf8'),
        host: '127.0.0.1',
        port: 8080
      },
    });
  });

  after(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  describe('Tenant Isolation', () => {
    it('should prevent cross-tenant data access', async () => {
      const aliceDb = testEnv.authenticatedContext('alice', { tenantId: 'tenant-a', role: 'User' }).firestore();
      const bobDb = testEnv.authenticatedContext('bob', { tenantId: 'tenant-b', role: 'User' }).firestore();

      const exerciseRef = aliceDb.collection('exercises').doc('ex-1');
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('exercises').doc('ex-1').set({ tenantId: 'tenant-a', name: 'Exercise A' });
      });

      await assertSucceeds(aliceDb.collection('exercises').doc('ex-1').get());
      await assertFails(bobDb.collection('exercises').doc('ex-1').get());
    });

    it('should allow access to same-tenant data', async () => {
      const aliceDb = testEnv.authenticatedContext('alice', { tenantId: 'tenant-a', role: 'User' }).firestore();
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('exercises').doc('ex-1').set({ tenantId: 'tenant-a', name: 'Exercise A' });
      });
      await assertSucceeds(aliceDb.collection('exercises').doc('ex-1').get());
    });
  });

  describe('Role-Based Access Control', () => {
    it('should allow Admin to delete exercises', async () => {
      const adminDb = testEnv.authenticatedContext('admin', { tenantId: 'tenant-a', role: 'Admin' }).firestore();
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('exercises').doc('ex-1').set({ tenantId: 'tenant-a', name: 'Exercise A' });
      });
      await assertSucceeds(adminDb.collection('exercises').doc('ex-1').delete());
    });

    it('should prevent User from deleting exercises', async () => {
      const userDb = testEnv.authenticatedContext('user', { tenantId: 'tenant-a', role: 'User' }).firestore();
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('exercises').doc('ex-1').set({ tenantId: 'tenant-a', name: 'Exercise A' });
      });
      await assertFails(userDb.collection('exercises').doc('ex-1').delete());
    });
  });

  describe('Audit Log Immutability', () => {
    it('should prevent updating audit logs', async () => {
      const adminDb = testEnv.authenticatedContext('admin', { tenantId: 'tenant-a', role: 'Admin' }).firestore();
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('audit_logs').doc('log-1').set({ tenantId: 'tenant-a', what: 'LOGIN' });
      });
      await assertFails(adminDb.collection('audit_logs').doc('log-1').update({ what: 'HACKED' }));
    });
  });

  describe('Communications Module Security', () => {
    it('should allow Admin to read same-tenant mail', async () => {
      const adminDb = testEnv.authenticatedContext('admin', { tenantId: 'tenant-a', role: 'Admin' }).firestore();
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('mail').doc('m-1').set({ tenantId: 'tenant-a', to: 'test@test.com' });
      });
      await assertSucceeds(adminDb.collection('mail').doc('m-1').get());
    });

    it('should prevent Admin from reading cross-tenant mail', async () => {
      const bobDb = testEnv.authenticatedContext('bob', { tenantId: 'tenant-b', role: 'Admin' }).firestore();
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('mail').doc('m-1').set({ tenantId: 'tenant-a', to: 'test@test.com' });
      });
      await assertFails(bobDb.collection('mail').doc('m-1').get());
    });

    it('should allow users to create mail for their own tenant', async () => {
      const userDb = testEnv.authenticatedContext('user', { tenantId: 'tenant-a', role: 'User' }).firestore();
      await assertSucceeds(userDb.collection('mail').add({ tenantId: 'tenant-a', to: 'test@test.com' }));
    });

    it('should prevent users from creating mail for other tenants', async () => {
      const userDb = testEnv.authenticatedContext('user', { tenantId: 'tenant-a', role: 'User' }).firestore();
      await assertFails(userDb.collection('mail').add({ tenantId: 'tenant-b', to: 'test@test.com' }));
    });

    it('should allow read access to email templates for authenticated users', async () => {
      const userDb = testEnv.authenticatedContext('user', { tenantId: 'tenant-a', role: 'User' }).firestore();
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('email_templates').doc('t-1').set({ subject: 'Welcome' });
      });
      await assertSucceeds(userDb.collection('email_templates').doc('t-1').get());
    });
  });

  describe('Asset Registry Security', () => {
    it('should allow Report role to read same-tenant assets', async () => {
      const reportDb = testEnv.authenticatedContext('reporter', { tenantId: 'tenant-a', role: 'Report' }).firestore();
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('assets').doc('asset-1').set({ tenantId: 'tenant-a', name: 'Server' });
      });
      await assertSucceeds(reportDb.collection('assets').doc('asset-1').get());
    });

    it('should prevent cross-tenant asset access', async () => {
      const bobDb = testEnv.authenticatedContext('bob', { tenantId: 'tenant-b', role: 'Admin' }).firestore();
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('assets').doc('asset-1').set({ tenantId: 'tenant-a', name: 'Server' });
      });
      await assertFails(bobDb.collection('assets').doc('asset-1').get());
    });

    it('should allow Moderator to create assets for their tenant', async () => {
      const modDb = testEnv.authenticatedContext('mod', { tenantId: 'tenant-a', role: 'Moderator' }).firestore();
      await assertSucceeds(modDb.collection('assets').add({ tenantId: 'tenant-a', name: 'New DB' }));
    });

    it('should prevent User role from creating assets', async () => {
      const userDb = testEnv.authenticatedContext('user', { tenantId: 'tenant-a', role: 'User' }).firestore();
      await assertFails(userDb.collection('assets').add({ tenantId: 'tenant-a', name: 'Bad Asset' }));
    });
  });

  describe('Webhook Engine Security', () => {
    it('should allow Admin to read same-tenant webhook configs', async () => {
      const adminDb = testEnv.authenticatedContext('admin', { tenantId: 'tenant-a', role: 'Admin' }).firestore();
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('webhook_configs').doc('web-1').set({ tenantId: 'tenant-a', url: 'https://test.com' });
      });
      await assertSucceeds(adminDb.collection('webhook_configs').doc('web-1').get());
    });

    it('should prevent cross-tenant webhook config access', async () => {
      const bobDb = testEnv.authenticatedContext('bob', { tenantId: 'tenant-b', role: 'Admin' }).firestore();
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('webhook_configs').doc('web-1').set({ tenantId: 'tenant-a', url: 'https://test.com' });
      });
      await assertFails(bobDb.collection('webhook_configs').doc('web-1').get());
    });

    it('should prevent non-Admin from reading webhook configs', async () => {
      const modDb = testEnv.authenticatedContext('mod', { tenantId: 'tenant-a', role: 'Moderator' }).firestore();
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('webhook_configs').doc('web-1').set({ tenantId: 'tenant-a', url: 'https://test.com' });
      });
      await assertFails(modDb.collection('webhook_configs').doc('web-1').get());
    });

    it('should allow Admin to create webhook configs for their tenant', async () => {
      const adminDb = testEnv.authenticatedContext('admin', { tenantId: 'tenant-a', role: 'Admin' }).firestore();
      await assertSucceeds(adminDb.collection('webhook_configs').add({ tenantId: 'tenant-a', type: 'outbound' }));
    });

    it('should prevent Admin from creating webhook configs for other tenants', async () => {
      const adminDb = testEnv.authenticatedContext('admin', { tenantId: 'tenant-a', role: 'Admin' }).firestore();
      await assertFails(adminDb.collection('webhook_configs').add({ tenantId: 'tenant-b', type: 'outbound' }));
    });
  });
});

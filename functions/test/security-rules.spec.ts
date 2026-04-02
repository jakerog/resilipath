/**
 * Task 8: Firestore Security Rules Unit Tests
 * ResiliPath - Data Layer & Persistence
 *
 * Uses @firebase/rules-unit-testing to validate isolation and RBAC.
 */

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Firestore Security Rules', () => {
  let testEnv: RulesTestEnvironment;

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'resilipath-test',
      firestore: {
        rules: readFileSync(resolve(__dirname, '../../firestore.rules'), 'utf8'),
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

      const exerciseRef = aliceDb.collection('exercises').doc('ex-1');

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
});

/**
 * ResiliPath - Resilience Planning API
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Task 6: snapshotPlan HTTPS Callable
 * Creates an immutable, timestamped copy of a resilience plan.
 * Optimization: 256MB memory, 1 min timeout.
 */
export const snapshotPlan = functions.runWith({
  memory: '256MB',
  timeoutSeconds: 60,
}).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { planId, label } = data;
  if (!planId) {
    throw new functions.https.HttpsError('invalid-argument', 'Plan ID is required.');
  }

  const db = admin.firestore();
  const callerUid = context.auth.uid;
  const callerClaims = (context.auth.token || {}) as any;
  const tenantId = callerClaims.tenantId;

  try {
    // 1. Fetch current plan
    const planRef = db.collection('plans').doc(planId);
    const planDoc = await planRef.get();

    if (!planDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Plan not found.');
    }

    const planData = planDoc.data()!;

    // 2. Enforce Isolation
    if (planData.tenantId !== tenantId && !callerClaims.isGlobalSuperUser) {
      throw new functions.https.HttpsError('permission-denied', 'Unauthorized access.');
    }

    // 3. Create Immutable Snapshot
    const snapshotRef = db.collection('plan_snapshots').doc();
    const snapshotData = {
      ...planData,
      snapshotId: snapshotRef.id,
      snapshotLabel: label || `Auto-snapshot ${new Date().toISOString()}`,
      originalPlanId: planId,
      snapshottedAt: admin.firestore.FieldValue.serverTimestamp(),
      snapshottedBy: callerUid,
    };

    // 4. Atomic update using transaction
    await db.runTransaction(async (transaction) => {
      transaction.set(snapshotRef, snapshotData);
      transaction.update(planRef, {
        version: admin.firestore.FieldValue.increment(1),
        snapshotIds: admin.firestore.FieldValue.arrayUnion(snapshotRef.id),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    // 5. Audit Log (M3)
    await db.collection('audit_logs').add({
      who: callerUid,
      what: 'PLAN_SNAPSHOTTED',
      when: admin.firestore.FieldValue.serverTimestamp(),
      tenantId,
      metadata: { planId, snapshotId: snapshotRef.id, version: planData.version + 1 },
    });

    return {
      success: true,
      snapshotId: snapshotRef.id,
      newVersion: planData.version + 1,
    };

  } catch (error: any) {
    console.error('Snapshot failed:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Failed to create plan snapshot.');
  }
});

/**
 * provisionExerciseFromPlan HTTPS Callable
 * Creates a Resilience Exercise from an approved Resilience Plan.
 */
export const provisionExerciseFromPlan = functions.runWith({
  memory: '256MB',
  timeoutSeconds: 60,
}).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { planId } = data;
  if (!planId) {
    throw new functions.https.HttpsError('invalid-argument', 'Plan ID is required.');
  }

  const db = admin.firestore();
  const callerUid = context.auth.uid;
  const callerClaims = (context.auth.token || {}) as any;
  const tenantId = callerClaims.tenantId;

  try {
    // 1. Fetch Plan
    const planRef = db.collection('plans').doc(planId);
    const planDoc = await planRef.get();
    if (!planDoc.exists) throw new functions.https.HttpsError('not-found', 'Plan not found.');
    const planData = planDoc.data()!;

    // 2. Validate Authorization and Status
    if (planData.tenantId !== tenantId) throw new functions.https.HttpsError('permission-denied', 'Unauthorized access.');
    if (planData.status !== 'approved') throw new functions.https.HttpsError('failed-precondition', 'Only approved plans can be provisioned into exercises.');

    // 3. Create Exercise Record
    const exerciseId = db.collection('exercises').doc().id;
    const exercise = {
      exerciseId,
      tenantId,
      name: `${planData.name} - Resilience Exercise`,
      status: 'scheduled',
      phase: 'Prod',
      startTimeEstimated: admin.firestore.FieldValue.serverTimestamp(), // Initial default
      endTimeEstimated: admin.firestore.FieldValue.serverTimestamp(),
      durationEstimatedMinutes: 120, // Template default
      ownerUid: callerUid,
      description: `Provisioned from Resilience Plan: ${planData.name}`,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      planId: planData.planId
    };

    // 4. Create Initial Tasks (Simplified for prototype)
    const tasks = [
      {
        title: 'Exercise Initialization',
        description: 'Prepare recovery environment.',
        stage: 'Pre-Failover',
        order: 1,
        durationEstimatedMinutes: 30
      },
      {
        title: 'Core System Failover',
        description: 'Initiate primary system switchover.',
        stage: 'Failover',
        order: 2,
        durationEstimatedMinutes: 60,
        dependsOn: []
      },
      {
        title: 'Post-Failover Validation',
        description: 'Verify system integrity.',
        stage: 'Post-Failover',
        order: 3,
        durationEstimatedMinutes: 30
      }
    ];

    const batch = db.batch();
    batch.set(db.collection('exercises').doc(exerciseId), exercise);

    tasks.forEach((t, i) => {
      const taskId = db.collection('tasks').doc().id;
      batch.set(db.collection('tasks').doc(taskId), {
        ...t,
        taskId,
        exerciseId,
        tenantId,
        status: 'pending',
        isReady: i === 0, // First task is ready
        evidenceRequired: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();

    // 5. Audit Log
    await db.collection('audit_logs').add({
      who: callerUid,
      what: 'EXERCISE_PROVISIONED_FROM_PLAN',
      when: admin.firestore.FieldValue.serverTimestamp(),
      tenantId,
      metadata: { planId, exerciseId }
    });

    return { success: true, exerciseId };

  } catch (error: any) {
    console.error('Exercise provisioning failed:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Failed to provision exercise.');
  }
});

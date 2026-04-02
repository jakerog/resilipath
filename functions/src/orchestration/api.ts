/**
 * Orchestration API for ResiliPath
 * Handles task state transitions and Go/No-Go decisions.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { TaskStatus } from './types';

/**
 * Task 3/4/5/7: updateTaskStatus HTTPS Callable
 * Handles state transitions with server-side timestamping and duration calculations.
 * Optimization (Task 7): Consolidates updates into a Firestore Transaction.
 */
export const updateTaskStatus = functions.runWith({
  memory: '256MB',
  timeoutSeconds: 60,
}).https.onCall(async (data, context) => {
  // 1. Verify caller identity and permissions (M5: RBAC)
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { taskId, newStatus, notes } = data;

  if (!taskId || !newStatus) {
    throw new functions.https.HttpsError('invalid-argument', 'Task ID and New Status are required.');
  }

  const validStatuses: TaskStatus[] = ['pending', 'in_progress', 'completed', 'failed', 'skipped'];
  if (!validStatuses.includes(newStatus)) {
    throw new functions.https.HttpsError('invalid-argument', `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const callerUid = context.auth.uid;
  const db = admin.firestore();
  const taskRef = db.collection('tasks').doc(taskId);

  try {
    const result = await db.runTransaction(async (transaction) => {
      const taskDoc = await transaction.get(taskRef);
      if (!taskDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Task not found.');
      }

      const taskData = taskDoc.data();
      const tenantId = taskData?.tenantId;
      const callerClaims = (context.auth?.token || {}) as any;

      // 2. Enforce tenant isolation (M1/M5)
      if (callerClaims.tenantId !== tenantId && callerClaims.isGlobalSuperUser !== true) {
        throw new functions.https.HttpsError('permission-denied', 'Unauthorized access to tenant data.');
      }

      const updates: any = {
        status: newStatus,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (notes) updates.notes = notes;

      // 3. Logic for State Transitions & Timestamping (Task 4/5)
      const now = new Date();

      if (newStatus === 'in_progress' && !taskData?.startTimeActual) {
        updates.startTimeActual = admin.firestore.FieldValue.serverTimestamp();
      } else if (newStatus === 'completed' || newStatus === 'failed') {
        if (!taskData?.endTimeActual) {
          updates.endTimeActual = admin.firestore.FieldValue.serverTimestamp();

          // 4. Actual Duration Calculation (Task 5)
          const startTime = taskData?.startTimeActual?.toDate() || now;
          const actualDurationMinutes = Math.round((now.getTime() - startTime.getTime()) / (1000 * 60));
          updates.durationActualMinutes = actualDurationMinutes;

          // Variance Calculation
          if (taskData?.durationEstimatedMinutes) {
            updates.varianceMinutes = actualDurationMinutes - taskData.durationEstimatedMinutes;
          }
        }
      }

      transaction.update(taskRef, updates);

      // 5. Create immutable audit log (M3)
      const auditLog = {
        who: callerUid,
        what: 'TASK_STATUS_UPDATED',
        when: admin.firestore.FieldValue.serverTimestamp(),
        tenantId,
        metadata: {
          taskId,
          oldStatus: taskData?.status,
          newStatus,
          notes: notes || null,
        },
      };

      const auditLogRef = db.collection('audit_logs').doc();
      transaction.set(auditLogRef, auditLog);

      return { success: true, tenantId, taskId, newStatus };
    });

    console.log(`Task ${taskId} status updated to ${newStatus} by ${callerUid}`);
    return result;
  } catch (error: any) {
    console.error(`Error updating task ${taskId}:`, error);
    throw new functions.https.HttpsError('internal', error.message || 'Error updating task status.');
  }
});

/**
 * Task 6: setGoNoGoDecision HTTPS Callable
 * Handles critical decision points with mandatory comment and audit log.
 */
export const setGoNoGoDecision = functions.runWith({
  memory: '256MB',
  timeoutSeconds: 60,
}).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { exerciseId, decision, comment } = data;

  if (!exerciseId || !decision || !comment) {
    throw new functions.https.HttpsError('invalid-argument', 'Exercise ID, Decision (GO/NO_GO), and Comment are required.');
  }

  if (!['GO', 'NO_GO'].includes(decision)) {
    throw new functions.https.HttpsError('invalid-argument', 'Decision must be GO or NO_GO.');
  }

  const callerUid = context.auth.uid;
  const db = admin.firestore();
  const exerciseRef = db.collection('exercises').doc(exerciseId);

  try {
    const result = await db.runTransaction(async (transaction) => {
      const exDoc = await transaction.get(exerciseRef);
      if (!exDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Exercise not found.');
      }

      const exData = exDoc.data();
      const tenantId = exData?.tenantId;
      const callerClaims = (context.auth?.token || {}) as any;

      // RBAC: Only Admin or Moderator roles can set Go/No-Go decisions (M5/M8)
      const role = callerClaims.role;
      if (role !== 'Admin' && role !== 'Moderator' && callerClaims.isGlobalSuperUser !== true) {
        throw new functions.https.HttpsError('permission-denied', 'Only Admins or Moderators can set Go/No-Go decisions.');
      }

      if (callerClaims.tenantId !== tenantId && callerClaims.isGlobalSuperUser !== true) {
        throw new functions.https.HttpsError('permission-denied', 'Unauthorized access to tenant data.');
      }

      transaction.update(exerciseRef, {
        decision: {
          status: decision,
          setByUid: callerUid,
          setAt: admin.firestore.FieldValue.serverTimestamp(),
          comment,
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Create immutable audit log (M3)
      const auditLog = {
        who: callerUid,
        what: 'EXERCISE_GO_NO_GO_DECISION',
        when: admin.firestore.FieldValue.serverTimestamp(),
        tenantId,
        metadata: {
          exerciseId,
          decision,
          comment,
        },
      };

      const auditLogRef = db.collection('audit_logs').doc();
      transaction.set(auditLogRef, auditLog);

      return { success: true, exerciseId, decision };
    });

    console.log(`Go/No-Go Decision set for exercise ${exerciseId}: ${decision} by ${callerUid}`);
    return result;
  } catch (error: any) {
    console.error(`Error setting Go/No-Go decision for ${exerciseId}:`, error);
    throw new functions.https.HttpsError('internal', error.message || 'Error setting Go/No-Go decision.');
  }
});

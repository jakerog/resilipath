/**
 * ResiliPath - Compliance Mapping Engine
 * Automates the linking of resilience evidence to regulatory controls.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { ComplianceControl, AuditLog } from '../models/schema';

/**
 * Task 2: mapEvidenceToControl HTTPS Callable
 * Manually or automatically links evidence to a compliance control.
 */
export const mapEvidenceToControl = functions.runWith({
  memory: '256MB',
  timeoutSeconds: 60,
}).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const { controlId, evidenceId, taskId, planId } = data;
  if (!controlId || (!evidenceId && !taskId && !planId)) {
    throw new functions.https.HttpsError('invalid-argument', 'Control ID and at least one target ID are required.');
  }

  const db = admin.firestore();
  const callerClaims = (context.auth.token || {}) as any;
  const tenantId = callerClaims.tenantId;

  try {
    const controlRef = db.collection('compliance_controls').doc(controlId);

    await db.runTransaction(async (transaction) => {
      const controlSnap = await transaction.get(controlRef);
      if (!controlSnap.exists) {
        throw new Error('Compliance control not found.');
      }

      const control = controlSnap.data() as ComplianceControl;
      let mappedData = control.mappedEvidenceIds.find(m => m.tenantId === tenantId);

      if (!mappedData) {
        mappedData = { tenantId, evidenceIds: [], taskIds: [], planIds: [] };
        control.mappedEvidenceIds.push(mappedData);
      }

      if (evidenceId && !mappedData.evidenceIds.includes(evidenceId)) mappedData.evidenceIds.push(evidenceId);
      if (taskId && !mappedData.taskIds.includes(taskId)) mappedData.taskIds.push(taskId);
      if (planId && !mappedData.planIds.includes(planId)) mappedData.planIds.push(planId);

      transaction.update(controlRef, {
        mappedEvidenceIds: control.mappedEvidenceIds
      });

      // Audit Log
      const auditLog: AuditLog = {
        who: context.auth!.uid,
        what: 'COMPLIANCE_CONTROL_MAPPED',
        when: admin.firestore.FieldValue.serverTimestamp(),
        tenantId,
        moduleName: 'Compliance',
        metadata: {
          controlId,
          evidenceId,
          taskId,
          planId
        }
      };
      transaction.set(db.collection('audit_logs').doc(), auditLog);
    });

    return { success: true };

  } catch (error: any) {
    console.error('Compliance mapping failed:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Task 2: onEvidenceCreated Compliance Trigger
 * Automatically maps exercise evidence to relevant SOC 2 / ISO controls.
 */
export const onEvidenceCreated = functions.runWith({
  memory: '256MB',
  timeoutSeconds: 60,
}).firestore.document('tasks/{taskId}').onUpdate(async (change, context) => {
  const after = change.after.data();
  const before = change.before.data();

  // Trigger only if evidence was newly added
  if (!after.evidenceIds || after.evidenceIds.length === (before.evidenceIds?.length || 0)) {
    return;
  }

  const tenantId = after.tenantId;
  const db = admin.firestore();

  try {
    // Logic: Map to "Exercise Performance" controls (e.g., SOC 2 CC7.5)
    const exerciseControlQuery = await db.collection('compliance_controls')
      .where('code', '==', 'CC7.5') // Change management / System monitoring
      .limit(1)
      .get();

    if (exerciseControlQuery.empty) return;

    const controlDoc = exerciseControlQuery.docs[0];
    const newEvidenceId = after.evidenceIds[after.evidenceIds.length - 1];

    await controlDoc.ref.update({
      mappedEvidenceIds: admin.firestore.FieldValue.arrayUnion({
        tenantId,
        evidenceIds: [newEvidenceId],
        taskIds: [context.params.taskId],
        planIds: []
      })
    });

    console.log(`Auto-mapped evidence ${newEvidenceId} to compliance control CC7.5`);

  } catch (error) {
    console.error('Auto-compliance mapping failed:', error);
  }
});

/**
 * ResiliPath - Resilience Planning Triggers
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Task 2: onPlanUpdated trigger
 * Automatically calculates the nextReviewAt date when a plan is approved or cycle changes.
 * This enforces governance and audit readiness.
 */
export const onPlanUpdated = functions.runWith({
  memory: '256MB',
  timeoutSeconds: 60,
}).firestore
  .document('plans/{planId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (!before || !after) return null;

    const cycleChanged = before.reviewCycleDays !== after.reviewCycleDays;
    const statusChanged = before.status !== after.status;
    const justApproved = statusChanged && after.status === 'approved';

    // 1. Audit Logging for status changes (Task 6)
    if (statusChanged) {
      await admin.firestore().collection('audit_logs').add({
        who: after.lastModifiedBy || 'SYSTEM',
        what: 'PLAN_STATUS_CHANGED',
        when: admin.firestore.FieldValue.serverTimestamp(),
        tenantId: after.tenantId,
        metadata: {
          planId: context.params.planId,
          from: before.status,
          to: after.status
        }
      });
    }

    // 2. If review cycle needs recalculation
    if (cycleChanged || justApproved) {
      const cycleDays = after.reviewCycleDays || 365; // Default to annual review
      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + cycleDays);

      console.log(`Recalculating review for plan ${context.params.planId}. Next review: ${nextReviewDate.toISOString()}`);

      return change.after.ref.update({
        nextReviewAt: admin.firestore.Timestamp.fromDate(nextReviewDate),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return null;
  });

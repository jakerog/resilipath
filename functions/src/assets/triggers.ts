/**
 * ResiliPath - Asset Management Triggers
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Task 5: onAssetUpdated trigger
 * Automatically updates 'lastReviewedAt' when critical asset fields are changed.
 * This ensures compliance by tracking when asset data was last validated.
 */
export const onAssetUpdated = functions.runWith({
  memory: '256MB',
  timeoutSeconds: 60,
}).firestore
  .document('assets/{assetId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (!before || !after) return null;

    // Define critical fields that warrant a 'Last Reviewed' update
    const criticalFields = ['name', 'type', 'criticality', 'description', 'bia'];

    const hasCriticalChange = criticalFields.some(field =>
      JSON.stringify(before[field]) !== JSON.stringify(after[field])
    );

    // If 'lastReviewedAt' was already manually updated in this write, skip to avoid loops
    const manualUpdate = before.lastReviewedAt?.toDate?.()?.getTime() !== after.lastReviewedAt?.toDate?.()?.getTime();

    if (hasCriticalChange && !manualUpdate) {
      console.log(`Critical change detected for asset ${context.params.assetId}. Updating lastReviewedAt.`);
      return change.after.ref.update({
        lastReviewedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return null;
  });

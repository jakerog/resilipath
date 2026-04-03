/**
 * ResiliPath - Crisis Communications Acknowledgment
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Task 5: acknowledgeNotification HTTPS Callable
 * Allows recipients to acknowledge receipt of an alert.
 */
export const acknowledgeNotification = functions.runWith({
  memory: '256MB',
  timeoutSeconds: 60,
}).https.onCall(async (data, context) => {
  const { notificationId, type } = data;
  if (!notificationId || !type) {
    throw new functions.https.HttpsError('invalid-argument', 'Notification ID and Type are required.');
  }

  const db = admin.firestore();
  const collectionMap: Record<string, string> = {
    'email': 'mail',
    'sms': 'sms',
    'voice': 'voice'
  };

  const collectionName = collectionMap[type];
  if (!collectionName) {
    throw new functions.https.HttpsError('invalid-argument', 'Unsupported notification type.');
  }

  try {
    const docRef = db.collection(collectionName).doc(notificationId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Notification not found.');
    }

    const docData = docSnap.data()!;

    // Enforce Isolation if authenticated (optional for anonymous links but good for consistency)
    if (context.auth) {
        const callerClaims = (context.auth.token || {}) as any;
        if (docData.tenantId !== callerClaims.tenantId) {
            throw new functions.https.HttpsError('permission-denied', 'Unauthorized access.');
        }
    }

    await docRef.update({
      acknowledgedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 2. Log Acknowledgment in Audit Logs
    await db.collection('audit_logs').add({
      who: 'RECIPIENT',
      what: 'NOTIFICATION_ACKNOWLEDGED',
      when: admin.firestore.FieldValue.serverTimestamp(),
      tenantId: docData.tenantId,
      metadata: {
        notificationId,
        type,
        exerciseId: docData.exerciseId,
        taskId: docData.taskId
      },
    });

    return { success: true };

  } catch (error: any) {
    console.error('Acknowledgment failed:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Failed to acknowledge notification.');
  }
});

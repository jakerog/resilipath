/**
 * ResiliPath - Crisis Communications API
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { dispatchBatchNotifications } from './dispatcher';

/**
 * Task 3: triggerPanicButton HTTPS Callable
 * Fetches active crisis contacts and dispatches mass notifications.
 * Optimization: 256MB memory, 1 min timeout.
 */
export const triggerPanicButton = functions.runWith({
  memory: '256MB',
  timeoutSeconds: 60,
}).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { message } = data;
  if (!message) {
    throw new functions.https.HttpsError('invalid-argument', 'Crisis message is required.');
  }

  const db = admin.firestore();
  const callerClaims = (context.auth.token || {}) as any;
  const tenantId = callerClaims.tenantId;

  if (!tenantId) {
    throw new functions.https.HttpsError('permission-denied', 'Tenant ID missing from custom claims.');
  }

  try {
    // 1. Fetch active crisis contacts for the tenant
    const contactsSnapshot = await db.collection('crisis_contacts')
      .where('tenantId', '==', tenantId)
      .where('active', '==', true)
      .get();

    if (contactsSnapshot.empty) {
      throw new functions.https.HttpsError('failed-precondition', 'No active crisis contacts found.');
    }

    const notifications: { type: 'email' | 'sms' | 'voice'; data: any }[] = [];

    contactsSnapshot.forEach(doc => {
      const contact = doc.data();

      // Dispatch to all three channels (M10/Phase 3 enhancement)
      if (contact.email) {
        notifications.push({
          type: 'email',
          data: {
            to: contact.email,
            message: {
              subject: 'ResiliPath: CRISIS ALERT',
              text: message,
            },
            tenantId,
          }
        });
      }

      if (contact.phone) {
        notifications.push({
          type: 'sms',
          data: {
            to: contact.phone,
            body: `CRISIS ALERT: ${message}`,
            tenantId,
          }
        });

        notifications.push({
          type: 'voice',
          data: {
            to: contact.phone,
            body: `This is a ResiliPath crisis alert. ${message}`,
            tenantId,
          }
        });
      }
    });

    // 2. Batch Dispatch
    await dispatchBatchNotifications(notifications);

    // 3. Audit Log (M3)
    await db.collection('audit_logs').add({
      who: context.auth.uid,
      what: 'CRISIS_PANIC_BUTTON_TRIGGERED',
      when: admin.firestore.FieldValue.serverTimestamp(),
      tenantId,
      metadata: {
        message,
        contactCount: contactsSnapshot.size,
        notificationCount: notifications.length
      },
    });

    return {
      success: true,
      notificationCount: notifications.length,
      contactCount: contactsSnapshot.size,
    };

  } catch (error: any) {
    console.error('Crisis trigger failed:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Failed to trigger crisis notifications.');
  }
});

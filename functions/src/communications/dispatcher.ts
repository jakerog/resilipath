/**
 * ResiliPath - Notification Dispatcher
 * Handles writing to /mail and /sms collections with tenant isolation.
 */

import * as admin from 'firebase-admin';
import { MailDocument, SMSDocument } from '../models/schema';

/**
 * Dispatch an email notification via the 'Trigger Email' extension.
 * Optimization: Uses Firestore Batching when possible (handled by caller or via batching here).
 */
export async function dispatchEmail(
  mail: Omit<MailDocument, 'createdAt'>,
  db: admin.firestore.Firestore = admin.firestore()
) {
  const mailRef = db.collection('mail').doc();
  const mailData: MailDocument = {
    ...mail,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await mailRef.set(mailData);
  return mailRef.id;
}

/**
 * Dispatch an SMS notification.
 */
export async function dispatchSMS(
  sms: Omit<SMSDocument, 'createdAt'>,
  db: admin.firestore.Firestore = admin.firestore()
) {
  const smsRef = db.collection('sms').doc();
  const smsData: SMSDocument = {
    ...sms,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await smsRef.set(smsData);
  return smsRef.id;
}

/**
 * Batch Notification Dispatcher
 * Task 7: Batch status-based notifications to stay within Free Tier limits.
 */
export async function dispatchBatchNotifications(
  notifications: { type: 'email' | 'sms'; data: any }[],
  db: admin.firestore.Firestore = admin.firestore()
) {
  if (notifications.length === 0) return;

  const batch = db.batch();
  const timestamp = admin.firestore.FieldValue.serverTimestamp();

  for (const notification of notifications) {
    if (notification.type === 'email') {
      const ref = db.collection('mail').doc();
      batch.set(ref, { ...notification.data, createdAt: timestamp });
    } else if (notification.type === 'sms') {
      const ref = db.collection('sms').doc();
      batch.set(ref, { ...notification.data, createdAt: timestamp });
    }
  }

  await batch.commit();
}

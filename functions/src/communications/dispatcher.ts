/**
 * ResiliPath - Notification Dispatcher
 * Handles writing to /mail and /sms collections with tenant isolation.
 */

import * as admin from 'firebase-admin';
import { MailDocument, SMSDocument, VoiceDocument } from '../models/schema';

/**
 * Dispatch a voice notification.
 */
export async function dispatchVoice(
  voice: Omit<VoiceDocument, 'createdAt'>,
  db: admin.firestore.Firestore = admin.firestore()
) {
  const voiceRef = db.collection('voice').doc();
  const voiceData: VoiceDocument = {
    ...voice,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await voiceRef.set(voiceData);
  return voiceRef.id;
}

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
 * Task 6 Optimization: Supports >500 documents via recursive chunking.
 */
export async function dispatchBatchNotifications(
  notifications: { type: 'email' | 'sms' | 'voice'; data: any }[],
  db: admin.firestore.Firestore = admin.firestore()
): Promise<void> {
  if (notifications.length === 0) return;

  const MAX_BATCH_SIZE = 500;
  const timestamp = admin.firestore.FieldValue.serverTimestamp();

  // If we exceed Firestore's 500-op limit, chunk and recurse
  if (notifications.length > MAX_BATCH_SIZE) {
    const chunk = notifications.slice(0, MAX_BATCH_SIZE);
    const remaining = notifications.slice(MAX_BATCH_SIZE);

    await dispatchBatchNotifications(chunk, db);
    await dispatchBatchNotifications(remaining, db);
    return;
  }

  const batch = db.batch();

  for (const notification of notifications) {
    const data = { ...notification.data, createdAt: timestamp };

    if (notification.type === 'email') {
      batch.set(db.collection('mail').doc(), data);
    } else if (notification.type === 'sms') {
      batch.set(db.collection('sms').doc(), data);
    } else if (notification.type === 'voice') {
      batch.set(db.collection('voice').doc(), { ...data, status: 'pending' });
    }
  }

  await batch.commit();
}

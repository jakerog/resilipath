/**
 * ResiliPath - Voice Notification Trigger
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as twilio from 'twilio';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'AC_MOCK_SID';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'MOCK_TOKEN';
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER || '+15555555555';

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

/**
 * Task 1: onVoiceCreated trigger
 * Initiates a Twilio Voice call when a document is added to /voice.
 */
export const onVoiceCreated = functions.runWith({
  memory: '256MB',
  timeoutSeconds: 60,
}).firestore
  .document('voice/{voiceId}')
  .onCreate(async (snapshot, context) => {
    const data = snapshot.data();
    if (!data) return null;

    const { to, body, tenantId } = data;

    try {
      // 1. Log the initiation
      console.log(`Initiating voice call for tenant ${tenantId} to ${to}`);

      // 2. Trigger Twilio Call (Using TwiML to speak the body)
      const call = await client.calls.create({
        twiml: `<Response><Say>${body}</Say></Response>`,
        to,
        from: TWILIO_FROM_NUMBER,
      });

      // 3. Update document with call SID
      return snapshot.ref.update({
        status: 'calling',
        twilioSid: call.sid,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    } catch (error: any) {
      console.error('Twilio Voice call failed:', error);
      return snapshot.ref.update({
        status: 'failed',
        error: error.message || 'Unknown error',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });

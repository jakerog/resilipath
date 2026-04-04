/**
 * ResiliPath - Vendor Assessment API
 * Handles automated risk questionnaires and SLA monitoring.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Vendor, VendorAssessment, AuditLog } from '../models/schema';

/**
 * Task 2: dispatchVendorAssessment HTTPS Callable
 * Creates and "sends" an assessment to a vendor contact.
 */
export const dispatchVendorAssessment = functions.runWith({
  memory: '256MB',
  timeoutSeconds: 60,
}).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const { vendorId } = data;
  if (!vendorId) {
    throw new functions.https.HttpsError('invalid-argument', 'Vendor ID is required.');
  }

  const db = admin.firestore();
  const callerClaims = (context.auth.token || {}) as any;
  const tenantId = callerClaims.tenantId;

  try {
    // 1. Fetch Vendor
    const vendorSnap = await db.collection('vendors').doc(vendorId).get();
    if (!vendorSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Vendor not found.');
    }

    const vendor = vendorSnap.data() as Vendor;
    if (vendor.tenantId !== tenantId) {
      throw new functions.https.HttpsError('permission-denied', 'Isolated isolation breach attempted.');
    }

    // 2. Create Assessment Document
    const assessmentRef = db.collection('vendor_assessments').doc();
    const assessment: VendorAssessment = {
      assessmentId: assessmentRef.id,
      vendorId,
      tenantId,
      status: 'sent',
      score: 0,
      questions: [
        { id: 'q1', text: 'Do you maintain an ISO 22301 certified BCM system?' },
        { id: 'q2', text: 'What is your guaranteed RTO for critical services (in minutes)?' },
        { id: 'q3', text: 'Have you conducted a disaster recovery exercise in the last 12 months?' }
      ],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const batch = db.batch();
    batch.set(assessmentRef, assessment);

    // 3. Update Vendor Metadata
    batch.update(db.collection('vendors').doc(vendorId), {
      assessments: admin.firestore.FieldValue.arrayUnion({
        id: assessmentRef.id,
        status: 'sent',
        score: 0
      })
    });

    // 4. Dispatch Email (using existing communication hub)
    batch.set(db.collection('mail').doc(), {
      to: vendor.contactEmail,
      template: {
        name: 'vendor_assessment_request',
        data: {
          vendorName: vendor.name,
          assessmentId: assessmentRef.id,
          // In production, this would be a signed URL to a public responder form
          responderUrl: `https://resilipath.io/respond/${assessmentRef.id}`
        }
      },
      tenantId,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 5. Audit Log (M3)
    const auditLog: AuditLog = {
      who: context.auth.uid,
      what: 'VENDOR_ASSESSMENT_DISPATCHED',
      when: admin.firestore.FieldValue.serverTimestamp(),
      tenantId,
      moduleName: 'VendorRisk',
      metadata: {
        vendorId,
        assessmentId: assessmentRef.id,
        contactEmail: vendor.contactEmail
      }
    };
    batch.set(db.collection('audit_logs').doc(), auditLog);

    await batch.commit();

    return { success: true, assessmentId: assessmentRef.id };

  } catch (error: any) {
    console.error('Failed to dispatch vendor assessment:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * submitVendorResponse HTTPS Request Trigger
 * Public endpoint for vendors to submit their assessments.
 * URL: https://<region>-<project>.cloudfunctions.net/submitVendorResponse
 */
export const submitVendorResponse = functions.runWith({
  memory: '256MB',
  timeoutSeconds: 60,
}).https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { assessmentId, answers } = req.body;
  if (!assessmentId || !answers) {
    res.status(400).send('Missing assessment ID or answers');
    return;
  }

  const db = admin.firestore();

  try {
    const assessmentRef = db.collection('vendor_assessments').doc(assessmentId);
    const assessmentSnap = await assessmentRef.get();

    if (!assessmentSnap.exists) {
      res.status(404).send('Assessment not found');
      return;
    }

    const assessment = assessmentSnap.data() as VendorAssessment;
    if (assessment.status === 'completed') {
      res.status(400).send('Assessment already submitted');
      return;
    }

    // Simple Scoring Logic (Task 3)
    let score = 0;
    const updatedQuestions = assessment.questions.map(q => {
      const response = answers[q.id];
      if (response === 'yes' || response === true || (typeof response === 'number' && response > 0)) {
        score += 33; // Mock weighting
      }
      return { ...q, response };
    });

    await db.runTransaction(async (transaction) => {
      // 1. Update Assessment
      transaction.update(assessmentRef, {
        questions: updatedQuestions,
        status: 'completed',
        score: Math.min(score, 100),
        completedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 2. Update Vendor Risk Score
      const vendorRef = db.collection('vendors').doc(assessment.vendorId);
      transaction.update(vendorRef, {
        riskScore: Math.min(score, 100),
        complianceStatus: score > 70 ? 'compliant' : 'non-compliant',
        lastReviewedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 3. Audit Log
      const auditLog: AuditLog = {
        who: 'VENDOR_RESPONDER',
        what: 'VENDOR_ASSESSMENT_COMPLETED',
        when: admin.firestore.FieldValue.serverTimestamp(),
        tenantId: assessment.tenantId,
        moduleName: 'VendorRisk',
        metadata: {
          vendorId: assessment.vendorId,
          assessmentId,
          score
        }
      };
      transaction.set(db.collection('audit_logs').doc(), auditLog);
    });

    res.status(200).send({ message: 'Assessment submitted successfully', score });

  } catch (error) {
    console.error('Error processing vendor response:', error);
    res.status(500).send('Internal Server Error');
  }
});

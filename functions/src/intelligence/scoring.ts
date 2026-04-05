/**
 * ResiliPath - Resilience Scoring Engine
 * Generates predictive analytics and performance scores.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { ResilienceScore, Exercise, ExerciseTask, ResiliencePlan, Vendor } from '../models/schema';

/**
 * calculateTenantResilienceScore HTTPS Callable
 * Aggregates data from exercises, plans, and vendors to generate an overall score.
 */
export const calculateTenantResilienceScore = functions.runWith({
  memory: '512MB', // Increased for data aggregation
  timeoutSeconds: 120,
}).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const db = admin.firestore();
  const callerClaims = (context.auth.token || {}) as any;
  const tenantId = callerClaims.tenantId;

  try {
    // 1. Fetch Aggregation Data
    const [exercisesSnap, plansSnap, vendorsSnap] = await Promise.all([
      db.collection('exercises').where('tenantId', '==', tenantId).get(),
      db.collection('plans').where('tenantId', '==', tenantId).get(),
      db.collection('vendors').where('tenantId', '==', tenantId).get()
    ]);

    // 2. Planning Score (Plan Freshness & Completion)
    let planningScore = 0;
    if (!plansSnap.empty) {
      const plans = plansSnap.docs.map(d => d.data() as ResiliencePlan);
      const approvedCount = plans.filter(p => p.status === 'approved').length;
      planningScore = (approvedCount / plans.length) * 100;
    }

    // 3. Execution Score (Exercise Performance)
    let executionScore = 0;
    let totalVariance = 0;
    if (!exercisesSnap.empty) {
      const exercises = exercisesSnap.docs.map(d => d.data() as Exercise);
      const completedExercises = exercises.filter(e => e.status === 'completed');

      if (completedExercises.length > 0) {
        // Calculate based on variance and status
        executionScore = 80; // Base score for having completed exercises
        completedExercises.forEach(e => {
          if (e.varianceMinutes && e.varianceMinutes > 0) totalVariance += e.varianceMinutes;
        });
        // Penalize for high variance
        executionScore = Math.max(0, executionScore - (totalVariance / completedExercises.length));
      }
    }

    // 4. Vendor Score (Risk Coverage)
    let vendorScore = 0;
    if (!vendorsSnap.empty) {
      const vendors = vendorsSnap.docs.map(d => d.data() as Vendor);
      const riskScores = vendors.map(v => v.riskScore || 0);
      vendorScore = riskScores.reduce((a, b) => a + b, 0) / vendors.length;
    }

    // 5. Fetch Evidence Coverage (Phase 2/4 Integration)
    const tasksSnap = await db.collection('tasks').where('tenantId', '==', tenantId).get();
    let evidenceCoverage = 0;
    if (!tasksSnap.empty) {
      const tasks = tasksSnap.docs.map(d => d.data() as ExerciseTask);
      const tasksWithEvidenceReq = tasks.filter(t => t.evidenceRequired);
      if (tasksWithEvidenceReq.length > 0) {
        const tasksWithEvidenceProvided = tasksWithEvidenceReq.filter(t => t.evidenceIds && t.evidenceIds.length > 0);
        evidenceCoverage = (tasksWithEvidenceProvided.length / tasksWithEvidenceReq.length) * 100;
      }
    }

    // 6. Calculate Infrastructure Score (Asset Criticality & Review Status)
    const assetsSnap = await db.collection('assets').where('tenantId', '==', tenantId).get();
    let infrastructureScore = 0;
    if (!assetsSnap.empty) {
      const assets = assetsSnap.docs.map(d => d.data() as Asset);
      const reviewedAssets = assets.filter(a => a.lastReviewedAt);
      infrastructureScore = (reviewedAssets.length / assets.length) * 100;
    }

    // 7. Calculate Overall Score
    const overallScore = Math.round((planningScore * 0.3) + (executionScore * 0.3) + (vendorScore * 0.2) + (infrastructureScore * 0.2));

    const scoreData: ResilienceScore = {
      scoreId: db.collection('resilience_scores').doc().id,
      tenantId,
      overallScore,
      categories: {
        planning: Math.round(planningScore),
        execution: Math.round(executionScore),
        vendors: Math.round(vendorScore),
        infrastructure: Math.round(infrastructureScore)
      },
      metrics: {
        avgRtoVariance: Math.round(totalVariance / (exercisesSnap.size || 1)),
        evidenceCoverage: Math.round(evidenceCoverage),
        planFreshness: Math.round(planningScore)
      },
      calculatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('resilience_scores').doc(scoreData.scoreId).set(scoreData);

    // 6. Audit Log
    await db.collection('audit_logs').add({
      who: context.auth.uid,
      what: 'RESILIENCE_SCORE_CALCULATED',
      when: admin.firestore.FieldValue.serverTimestamp(),
      tenantId,
      moduleName: 'Intelligence',
      metadata: {
        overallScore,
        scoreId: scoreData.scoreId
      }
    });

    return scoreData;

  } catch (error: any) {
    console.error('Failed to calculate resilience score:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

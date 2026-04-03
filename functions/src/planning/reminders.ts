/**
 * ResiliPath - Planning Reminders (CRON)
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { dispatchBatchNotifications } from '../communications/dispatcher';

/**
 * Task 4: dailyPlanReviewCheck
 * CRON job to identify plans needing review and notify admins.
 * Runs daily at midnight.
 */
export const dailyPlanReviewCheck = functions.pubsub
  .schedule('0 0 * * *')
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = new Date();
    const sevenDaysOut = new Date();
    sevenDaysOut.setDate(now.getDate() + 7);

    try {
      // 1. Query plans due within 7 days or overdue
      const plansSnapshot = await db.collection('plans')
        .where('nextReviewAt', '<=', admin.firestore.Timestamp.fromDate(sevenDaysOut))
        .get();

      if (plansSnapshot.empty) return null;

      const notifications: any[] = [];

      for (const doc of plansSnapshot.docs) {
        const plan = doc.data();

        // 2. Fetch tenant admins for notification
        const tenantDoc = await db.collection('tenants').doc(plan.tenantId).get();
        const admins = tenantDoc.data()?.admins || [];

        if (admins.length > 0) {
          notifications.push({
            type: 'email',
            data: {
              to: admins, // Assuming admins is array of emails or UIDs handled by extension
              template: {
                name: 'plan_review_reminder',
                data: {
                  planName: plan.name,
                  reviewDate: plan.nextReviewAt.toDate().toLocaleDateString(),
                  isOverdue: plan.nextReviewAt.toDate() < now,
                }
              },
              tenantId: plan.tenantId,
              planId: doc.id,
            }
          });
        }
      }

      // 3. Dispatch notifications in batch
      if (notifications.length > 0) {
        await dispatchBatchNotifications(notifications);
        console.log(`Dispatched ${notifications.length} plan review reminders.`);
      }

      return null;
    } catch (error) {
      console.error('Reminder job failed:', error);
      return null;
    }
  });

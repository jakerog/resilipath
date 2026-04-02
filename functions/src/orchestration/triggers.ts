/**
 * Orchestration Triggers for ResiliPath
 * Handles automated task readiness updates.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { isTaskReady } from './dag';
import { ExerciseTask } from '../models/schema';

/**
 * Task 2: onTaskUpdated Firestore Trigger
 * Automatically checks and updates downstream task readiness.
 * Optimization: 256MB memory, 60s timeout.
 */
export const onTaskUpdated = functions.runWith({
  memory: '256MB',
  timeoutSeconds: 60,
}).firestore.document('tasks/{taskId}').onUpdate(async (change, context) => {
  const beforeData = change.before.data() as ExerciseTask;
  const afterData = change.after.data() as ExerciseTask;

  // Only trigger if status changed to 'completed' or 'skipped' (M7/M8)
  const statusChangedToFinished =
    (afterData.status === 'completed' || afterData.status === 'skipped') &&
    (beforeData.status !== 'completed' && beforeData.status !== 'skipped');

  if (!statusChangedToFinished) {
    return;
  }

  const exerciseId = afterData.exerciseId;
  const tenantId = afterData.tenantId;
  const db = admin.firestore();

  try {
    // 1. Get all tasks for this exercise (Task 2)
    const taskSnapshot = await db.collection('tasks')
      .where('exerciseId', '==', exerciseId)
      .where('tenantId', '==', tenantId)
      .get();

    const allTasks = taskSnapshot.docs.map(doc => doc.data() as ExerciseTask);

    // 2. Identify downstream tasks (those that depend on the completed task)
    const downstreamTasks = allTasks.filter(task =>
      task.dependsOn?.includes(context.params.taskId) &&
      task.status === 'pending'
    );

    if (downstreamTasks.length === 0) {
      console.log(`No downstream tasks to update for task ${context.params.taskId}`);
      return;
    }

    // 3. Update readiness for downstream tasks (Task 7 optimization: Transaction-like batch)
    const batch = db.batch();
    let updatedCount = 0;

    for (const task of downstreamTasks) {
      if (isTaskReady(task, allTasks)) {
        const taskRef = db.collection('tasks').doc(task.taskId);
        // Mark task as 'ready' (a potential intermediate state for UI visibility)
        // For the MVP, we will keep them as 'pending' but can trigger notifications here in 1.6.
        batch.update(taskRef, {
          isReady: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Task ${task.taskId} is now READY.`);
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      await batch.commit();
      console.log(`Updated ${updatedCount} downstream tasks for exercise ${exerciseId}`);
    }

  } catch (error) {
    console.error(`Error in onTaskUpdated trigger for task ${context.params.taskId}:`, error);
  }
});

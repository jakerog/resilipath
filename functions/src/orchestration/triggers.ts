/**
 * Orchestration Triggers for ResiliPath
 * Handles automated task readiness updates.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { isTaskReady } from './dag';
import { ExerciseTask, Exercise } from '../models/schema';
import { dispatchBatchNotifications } from '../communications/dispatcher';
import { dispatchOutboundWebhooks } from '../integration/webhooks';

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
    // If status changed to failed, dispatch outbound webhook (Task 4)
    if (afterData.status === 'failed' && beforeData.status !== 'failed') {
      await dispatchOutboundWebhooks(afterData.tenantId, 'task.failed', {
        taskId: context.params.taskId,
        exerciseId: afterData.exerciseId,
        title: afterData.title,
        status: afterData.status
      });
    }
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

    // 3. Identify tasks to update
    const tasksToUpdate = downstreamTasks.filter(task => isTaskReady(task, allTasks));

    if (tasksToUpdate.length === 0) {
      console.log(`No tasks ready for update in exercise ${exerciseId}`);
      return;
    }

    // 4. Get Exercise Name (once)
    const exerciseSnap = await db.collection('exercises').doc(exerciseId).get();
    const exerciseData = exerciseSnap.data() as Exercise;

    // 5. Recursive Batch Update (Mandate: Scalability > 500 documents)
    await processTaskReadiness(tasksToUpdate, tenantId, exerciseId, exerciseData.name, db);
    console.log(`Processed readiness for ${tasksToUpdate.length} tasks in exercise ${exerciseId}`);

  } catch (error) {
    console.error(`Error in onTaskUpdated trigger for task ${context.params.taskId}:`, error);
  }
});

/**
 * Recursive Task Readiness Processor
 * Adheres to Firestore 500-op batch limit.
 */
async function processTaskReadiness(
  tasks: ExerciseTask[],
  tenantId: string,
  exerciseId: string,
  exerciseName: string,
  db: admin.firestore.Firestore
): Promise<void> {
  if (tasks.length === 0) return;

  // Max 500 ops per batch. Each task update + mail document = 2 ops.
  const MAX_BATCH_SIZE = 200;
  const chunk = tasks.slice(0, MAX_BATCH_SIZE);
  const remaining = tasks.slice(MAX_BATCH_SIZE);

  const batch = db.batch();
  const timestamp = admin.firestore.FieldValue.serverTimestamp();

  // Pre-fetch all user emails in the chunk to optimize performance
  const assignedUids = Array.from(new Set(chunk.map(t => t.assignedToUid).filter(uid => !!uid))) as string[];
  const userMap: Record<string, string> = {};

  if (assignedUids.length > 0) {
    await Promise.all(assignedUids.map(async (uid) => {
      try {
        const user = await admin.auth().getUser(uid);
        if (user.email) userMap[uid] = user.email;
      } catch (err) {
        console.error(`Error fetching user ${uid} in batch readiness:`, err);
      }
    }));
  }

  for (const task of chunk) {
    const taskRef = db.collection('tasks').doc(task.taskId);
    batch.update(taskRef, {
      isReady: true,
      updatedAt: timestamp
    });

    if (task.assignedToUid && userMap[task.assignedToUid]) {
      batch.set(db.collection('mail').doc(), {
        to: userMap[task.assignedToUid],
        template: {
          name: 'task_ready',
          data: {
            exerciseName,
            taskTitle: task.title,
          }
        },
        tenantId: tenantId,
        exerciseId: exerciseId,
        taskId: task.taskId,
        createdAt: timestamp,
      });
    }
  }

  await batch.commit();

  if (remaining.length > 0) {
    await processTaskReadiness(remaining, tenantId, exerciseId, exerciseName, db);
  }
}

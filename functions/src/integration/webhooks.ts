/**
 * Webhook Engine - Inbound & Outbound Logic
 * Handles external monitoring triggers and notifications.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { WebhookConfig, ExerciseTask, AuditLog } from '../models/schema';

/**
 * Task 2: processInboundWebhook HTTPS Request Trigger
 * Allows external systems (e.g., Datadog) to trigger Resilience Exercise tasks.
 * URL: https://<region>-<project-id>.cloudfunctions.net/processInboundWebhook
 */
export const processInboundWebhook = functions.runWith({
  memory: '256MB',
  timeoutSeconds: 60,
}).https.onRequest(async (req, res) => {
  // 1. Method Validation
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { configId, secret, taskId, tenantId, status, metadata } = req.body;

  // 2. Basic Parameter Validation
  if (!configId || !secret || !taskId || !tenantId) {
    res.status(400).send('Missing required parameters');
    return;
  }

  const db = admin.firestore();

  try {
    // 3. Validate Webhook Configuration and Secret (Task 3)
    const configSnap = await db.collection('webhook_configs').doc(configId).get();

    if (!configSnap.exists) {
      res.status(404).send('Webhook configuration not found');
      return;
    }

    const config = configSnap.data() as WebhookConfig;

    if (config.tenantId !== tenantId || config.secret !== secret || !config.active || config.type !== 'inbound') {
      res.status(401).send('Unauthorized or invalid configuration');
      return;
    }

    // 4. Identify and Update the Target Task
    const taskRef = db.collection('tasks').doc(taskId);
    const taskSnap = await taskRef.get();

    if (!taskSnap.exists) {
      res.status(404).send('Target task not found');
      return;
    }

    const taskData = taskSnap.data() as ExerciseTask;

    // Strict isolation check
    if (taskData.tenantId !== tenantId) {
      res.status(401).send('Unauthorized: Tenant mismatch');
      return;
    }

    // Update status (default to 'in_progress' if not provided)
    const newStatus = status || 'in_progress';
    await taskRef.update({
      status: newStatus,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      metadata: {
        ...(taskData as any).metadata,
        webhookTriggered: true,
        webhookMetadata: metadata || {}
      }
    });

    // 5. Log the event to audit_logs (Task 6)
    const auditLog: AuditLog = {
      who: `WEBHOOK_${configId}`,
      what: 'INBOUND_WEBHOOK_TRIGGERED',
      when: admin.firestore.FieldValue.serverTimestamp(),
      tenantId: tenantId,
      moduleName: 'Integration',
      metadata: {
        configId,
        taskId,
        status: newStatus,
        externalMetadata: metadata || {}
      }
    };

    await db.collection('audit_logs').add(auditLog);

    res.status(200).send({
      message: 'Webhook processed successfully',
      taskId,
      newStatus
    });

  } catch (error) {
    console.error('Error processing inbound webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * Task 4 & 5: dispatchOutboundWebhooks
 * Dispatches notifications to external URLs for registered events.
 * Optimization: Uses fetch and records results in audit_logs.
 */
export async function dispatchOutboundWebhooks(
  tenantId: string,
  event: string,
  payload: any
) {
  const db = admin.firestore();

  try {
    // 1. Get all active outbound webhook configs for this tenant and event
    const configsSnap = await db.collection('webhook_configs')
      .where('tenantId', '==', tenantId)
      .where('type', '==', 'outbound')
      .where('active', '==', true)
      .where('events', 'array-contains', event)
      .get();

    if (configsSnap.empty) {
      return;
    }

    // 2. Dispatch to each URL
    const results = await Promise.all(configsSnap.docs.map(async (doc) => {
      const config = doc.data() as WebhookConfig;
      if (!config.url) return null;

      // Task 5: Retry logic and delivery tracking
      let retryCount = 0;
      const MAX_RETRIES = 3;
      let success = false;
      let lastError = null;
      let statusCode = 0;

      while (retryCount <= MAX_RETRIES && !success) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

          const response = await fetch(config.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-ResiliPath-Webhook-Secret': config.secret,
              'X-ResiliPath-Event': event
            },
            body: JSON.stringify({
              event,
              payload,
              timestamp: new Date().toISOString(),
              tenantId,
              retryCount
            }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);
          statusCode = response.status;

          if (response.ok) {
            success = true;
          } else {
            throw new Error(`HTTP Error: ${response.status}`);
          }
        } catch (err: any) {
          lastError = err.message;
          retryCount++;
          if (retryCount <= MAX_RETRIES) {
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          }
        }
      }

      const status = success ? 'SUCCESS' : 'ERROR';

        // 3. Log the outbound event (Task 6)
        const auditLog: AuditLog = {
          who: 'SYSTEM_WEBHOOK_DISPATCHER',
          what: 'OUTBOUND_WEBHOOK_DISPATCHED',
          when: admin.firestore.FieldValue.serverTimestamp(),
          tenantId: tenantId,
          moduleName: 'Integration',
          metadata: {
            configId: config.configId,
            event,
            url: config.url,
            status,
            statusCode
          }
        };
        await db.collection('audit_logs').add(auditLog);

        return { configId: config.configId, status, statusCode, retryCount, error: lastError };
    }));

    return results;

  } catch (error) {
    console.error('Error in dispatchOutboundWebhooks:', error);
    throw error;
  }
}

/**
 * ResiliPath - Partner REST API (v1)
 * Secure external API for enterprise integration.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { checkRateLimit } from '../utils/security';

/**
 * Task 3: partnerApiV1 HTTPS Request Trigger
 * Serves as the base for the RESTful Partner API.
 */
export const partnerApiV1 = functions.runWith({
  memory: '256MB',
  timeoutSeconds: 60,
  minInstances: 1
}).https.onRequest(async (req, res) => {
  // 1. Basic Rate Limiting
  const apiKey = req.headers['x-api-key'] as string;
  const isAllowed = await checkRateLimit(`api_${apiKey || req.ip}`, 60, 60);
  if (!isAllowed) {
    res.status(429).send('Too many requests');
    return;
  }

  const db = admin.firestore();

  // 2. Authentication (Production Integration)
  // Fetch from the /api_keys collection to validate against registered enterprise partners
  const apiKeySnap = await db.collection('api_keys').doc(apiKey || 'none').get();
  if (!apiKeySnap.exists || !apiKeySnap.data()?.active) {
    res.status(401).send('Unauthorized: Invalid or inactive API Key');
    return;
  }

  const tenantId = apiKeySnap.data()?.tenantId || 'tenant-api-test';

  try {
    const { method, path } = req;

    // 3. Routing Logic
    if (path === '/exercises' && method === 'GET') {
      const snap = await db.collection('exercises').where('tenantId', '==', tenantId).get();
      const exercises = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.status(200).json(exercises);
      return;
    }

    if (path.startsWith('/tasks/') && method === 'GET') {
      const taskId = path.split('/')[2];
      const snap = await db.collection('tasks').doc(taskId).get();
      if (!snap.exists || snap.data()?.tenantId !== tenantId) {
        res.status(404).send('Task not found');
        return;
      }
      res.status(200).json({ id: snap.id, ...snap.data() });
      return;
    }

    // Task 5: Azure/AWS Metadata Ingestion (POST)
    if (path === '/sync/metadata' && method === 'POST') {
      const { source, metadata } = req.body;
      if (!source || !metadata) {
        res.status(400).send('Missing source or metadata');
        return;
      }

      await db.collection('audit_logs').add({
        who: 'PARTNER_API',
        what: 'INFRASTRUCTURE_METADATA_SYNCED',
        when: admin.firestore.FieldValue.serverTimestamp(),
        tenantId,
        metadata: { source, metadataSize: JSON.stringify(metadata).length }
      });

      res.status(200).send({ message: 'Metadata synced successfully' });
      return;
    }

    res.status(404).send('Endpoint not found');

  } catch (error: any) {
    console.error('Partner API error:', error);
    res.status(500).send('Internal Server Error');
  }
});

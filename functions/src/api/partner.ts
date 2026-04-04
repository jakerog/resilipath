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

  // 2. Authentication (Simplified for MVP/Foundation)
  if (!apiKey || apiKey !== 'mock-partner-key') { // In production, validate against /api_keys collection
    res.status(401).send('Unauthorized: Invalid API Key');
    return;
  }

  const db = admin.firestore();
  const tenantId = 'tenant-api-test'; // Mock tenant for initial foundation

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

    res.status(404).send('Endpoint not found');

  } catch (error: any) {
    console.error('Partner API error:', error);
    res.status(500).send('Internal Server Error');
  }
});

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const healthCheck = functions.https.onRequest((request, response) => {
  response.send("ResiliPath Resilience Engine (Sub-Phase 1.1 Foundation Active)");
});

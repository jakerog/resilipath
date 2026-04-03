/**
 * ResiliPath - Compliance Reporting Engine
 * Generates audit-ready PDF reports from exercise data.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

/**
 * Task 2/4: generateExerciseReport HTTPS Callable
 * Fetches exercise data and generates a PDF report using Puppeteer.
 * Optimization: 1024MB memory (required for Puppeteer), 120s timeout.
 */
export const generateExerciseReport = functions.runWith({
  memory: '1GB',
  timeoutSeconds: 120,
}).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { exerciseId } = data;
  if (!exerciseId) {
    throw new functions.https.HttpsError('invalid-argument', 'Exercise ID is required.');
  }

  const db = admin.firestore();
  const callerClaims = (context.auth?.token || {}) as any;
  const tenantId = callerClaims.tenantId;

  try {
    // 1. Fetch Data
    const exerciseDoc = await db.collection('exercises').doc(exerciseId).get();
    if (!exerciseDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Exercise not found.');
    }

    const exerciseData = exerciseDoc.data();
    if (exerciseData?.tenantId !== tenantId && !callerClaims.isGlobalSuperUser) {
      throw new functions.https.HttpsError('permission-denied', 'Unauthorized access.');
    }

    const tasksSnapshot = await db.collection('tasks')
      .where('exerciseId', '==', exerciseId)
      .orderBy('order', 'asc')
      .get();

    const tasks = tasksSnapshot.docs.map(doc => doc.data());

    // 2. Generate HTML (Task 1/6)
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #2c3e50; }
            h1 { border-bottom: 2px solid #3498db; padding-bottom: 10px; }
            .header-info { margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { text-align: left; padding: 12px; border-bottom: 1px solid #eee; }
            th { background: #f8f9fa; font-size: 12px; text-transform: uppercase; }
            .status { font-weight: bold; font-size: 10px; padding: 4px 8px; border-radius: 4px; }
            .completed { color: #27ae60; background: #eafaf1; }
          </style>
        </head>
        <body>
          <h1>Resilience Exercise Report</h1>
          <div class="header-info">
            <p><strong>Exercise:</strong> ${exerciseData?.name}</p>
            <p><strong>Tenant:</strong> ${tenantId}</p>
            <p><strong>Generated At:</strong> ${new Date().toUTCString()}</p>
          </div>

          <h2>Task Execution Summary</h2>
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Task Title</th>
                <th>Status</th>
                <th>Estimated (m)</th>
                <th>Actual (m)</th>
                <th>Variance</th>
              </tr>
            </thead>
            <tbody>
              ${tasks.map(task => `
                <tr>
                  <td>${task.order}</td>
                  <td>${task.title}</td>
                  <td><span class="status ${task.status}">${task.status}</span></td>
                  <td>${task.durationEstimatedMinutes}</td>
                  <td>${task.durationActualMinutes || '-'}</td>
                  <td>${task.varianceMinutes ?? '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // 3. Render PDF (Task 3)
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1200, height: 800 },
      executablePath: await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar'),
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    // 4. Archive to Storage (Task 5)
    const fileName = `reports/${tenantId}/${exerciseId}_${Date.now()}.pdf`;
    const bucket = admin.storage().bucket();
    const file = bucket.file(fileName);

    await file.save(pdfBuffer, {
      contentType: 'application/pdf',
      metadata: {
        tenantId,
        exerciseId,
        generatedBy: context.auth.uid,
      }
    });

    // 5. Generate Signed URL for immediate download
    const [downloadUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 1000 * 60 * 15, // 15 mins
    });

    return { success: true, downloadUrl, fileName };

  } catch (error: any) {
    console.error('Report generation failed:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Failed to generate report.');
  }
});

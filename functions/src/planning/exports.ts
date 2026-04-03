/**
 * ResiliPath - Advanced Plan & Asset Exports
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import * as ExcelJS from 'exceljs';

/**
 * Task 2: generatePlanExport HTTPS Callable
 * Generates DOCX or XLSX files based on request type.
 * Optimization: 512MB memory (required for document processing), 120s timeout.
 */
export const generatePlanExport = functions.runWith({
  memory: '512MB',
  timeoutSeconds: 120,
}).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { planId, format = 'docx' } = data;
  if (!planId) {
    throw new functions.https.HttpsError('invalid-argument', 'Plan ID is required.');
  }

  const db = admin.firestore();
  const callerClaims = (context.auth.token || {}) as any;
  const tenantId = callerClaims.tenantId;

  try {
    // 1. Fetch current plan
    const planDoc = await db.collection('plans').doc(planId).get();
    if (!planDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Plan not found.');
    }

    const planData = planDoc.data()!;

    // 2. Enforce Isolation
    if (planData.tenantId !== tenantId && !callerClaims.isGlobalSuperUser) {
      throw new functions.https.HttpsError('permission-denied', 'Unauthorized access.');
    }

    // 3. Handle DOCX Export (Task 3)
    if (format === 'docx') {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: "ResiliPath - Resilience Plan Export",
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Plan Name: ", bold: true }),
                new TextRun(planData.name),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Status: ", bold: true }),
                new TextRun(planData.status || 'draft'),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Last Updated: ", bold: true }),
                new TextRun(planData.updatedAt?.toDate()?.toLocaleString() || 'N/A'),
              ],
            }),
            // Sections would be mapped here (Task 3 placeholder)
            new Paragraph({
              text: "--- Plan Content ---",
              heading: HeadingLevel.HEADING_2,
            }),
          ],
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      return {
        base64: buffer.toString('base64'),
        filename: `ResiliPath_Plan_${planData.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`
      };
    }

    // 4. Handle XLSX Export (Task 4 placeholder)
    if (format === 'xlsx') {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Asset Inventory');
        sheet.addRow(['ID', 'Name', 'Type', 'Criticality', 'Status']);

        // Asset data would be fetched and mapped here (Task 4 placeholder)

        const buffer = await workbook.xlsx.writeBuffer() as Buffer;
        return {
            base64: buffer.toString('base64'),
            filename: `ResiliPath_AssetInventory_${new Date().toISOString().split('T')[0]}.xlsx`
        };
    }

    throw new functions.https.HttpsError('invalid-argument', 'Unsupported export format.');

  } catch (error: any) {
    console.error('Export failed:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Failed to generate export.');
  }
});

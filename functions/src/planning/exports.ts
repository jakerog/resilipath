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
      // Fetch template for structure
      const templateSnapshot = await db.collection('bcp_templates')
        .where('templateId', '==', planData.templateId)
        .limit(1)
        .get();

      const templateData = templateSnapshot.empty ? null : templateSnapshot.docs[0].data();
      const sections = templateData?.sections || [];

      const docChildren: any[] = [
        new Paragraph({
          text: "ResiliPath - Resilience Plan Export",
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Plan Name: ", bold: true }),
            new TextRun(planData.name),
          ],
          spacing: { after: 120 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Status: ", bold: true }),
            new TextRun(planData.status?.toUpperCase() || 'DRAFT'),
          ],
          spacing: { after: 120 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Version: ", bold: true }),
            new TextRun(`v${planData.version || 1}`),
          ],
          spacing: { after: 120 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Last Updated: ", bold: true }),
            new TextRun(planData.updatedAt?.toDate()?.toLocaleString() || 'N/A'),
          ],
          spacing: { after: 400 },
        }),
      ];

      // Map sections and questions
      for (const section of sections) {
        docChildren.push(new Paragraph({
          text: section.title,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        }));

        if (section.description) {
          docChildren.push(new Paragraph({
            text: section.description,
            italics: true,
            spacing: { after: 200 },
          }));
        }

        for (const question of section.questions) {
          docChildren.push(new Paragraph({
            children: [new TextRun({ text: question.text, bold: true })],
            spacing: { before: 200, after: 100 },
          }));

          const answer = planData.data?.[question.id];
          let answerText = "No response provided.";

          if (Array.isArray(answer)) {
            answerText = answer.length > 0 ? answer.join(', ') : "None selected.";
          } else if (answer) {
            answerText = String(answer);
          }

          docChildren.push(new Paragraph({
            text: answerText,
            spacing: { after: 200 },
          }));
        }
      }

      const doc = new Document({
        sections: [{
          properties: {},
          children: docChildren,
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      return {
        base64: buffer.toString('base64'),
        filename: `ResiliPath_Plan_${planData.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`
      };
    }

    // 4. Handle XLSX Export (Task 4)
    if (format === 'xlsx') {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Asset Inventory');

        sheet.columns = [
          { header: 'Asset ID', key: 'assetId', width: 20 },
          { header: 'Name', key: 'name', width: 30 },
          { header: 'Type', key: 'type', width: 15 },
          { header: 'Criticality', key: 'criticality', width: 15 },
          { header: 'Status', key: 'status', width: 15 },
          { header: 'Last Reviewed', key: 'lastReviewedAt', width: 20 },
        ];

        // Format header
        sheet.getRow(1).font = { bold: true };

        // Fetch Assets
        const assetsSnapshot = await db.collection('assets')
          .where('tenantId', '==', tenantId)
          .orderBy('name', 'asc')
          .get();

        assetsSnapshot.forEach(doc => {
          const asset = doc.data();
          sheet.addRow({
            assetId: asset.assetId || doc.id,
            name: asset.name,
            type: asset.type || 'N/A',
            criticality: asset.criticality || 'Medium',
            status: asset.status || 'Active',
            lastReviewedAt: asset.lastReviewedAt?.toDate()?.toLocaleString() || 'Never',
          });
        });

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

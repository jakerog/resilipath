/**
 * ResiliPath - Template Seeding Tool
 * Utility to seed email templates into Firestore.
 */

import admin from 'firebase-admin';

async function seedTemplates() {
  const db = admin.firestore();
  const templates = [
    {
      id: 'task_assigned',
      subject: 'ResiliPath: New Task Assigned - {{exerciseName}}',
      html: `
        <h2>New Task Assigned</h2>
        <p>Hello,</p>
        <p>A new task has been assigned to you for the resilience exercise <strong>{{exerciseName}}</strong>.</p>
        <p><strong>Task:</strong> {{taskTitle}}</p>
        <p><strong>Stage:</strong> {{stage}}</p>
        <p>Please log in to the ResiliPath dashboard to begin.</p>
        <hr>
        <p><small>This is an automated notification from ResiliPath.</small></p>
      `,
    },
    {
      id: 'task_ready',
      subject: 'ResiliPath: Task Ready for Execution - {{exerciseName}}',
      html: `
        <h2>Task Ready</h2>
        <p>The following task is now ready for execution in exercise <strong>{{exerciseName}}</strong>:</p>
        <p><strong>Task:</strong> {{taskTitle}}</p>
        <p>Dependencies have been met. Please proceed to the dashboard.</p>
      `,
    },
    {
      id: 'go_no_go_alert',
      subject: 'ResiliPath: Go/No-Go Decision Required - {{exerciseName}}',
      html: `
        <h2>Go/No-Go Decision Required</h2>
        <p>A critical Go/No-Go decision point has been reached for exercise <strong>{{exerciseName}}</strong>.</p>
        <p>Please review the current status and provide your decision in the dashboard.</p>
      `,
    }
  ];

  for (const template of templates) {
    await db.collection('email_templates').doc(template.id).set({
      subject: template.subject,
      html: template.html,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`Template '${template.id}' seeded.`);
  }
}

// Check if being run directly
// In ESM, check process.argv[1]
const isMain = process.argv[1].endsWith('seed-templates.ts');
if (isMain) {
  if (admin.apps && !admin.apps.length) {
    admin.initializeApp({
      projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'resilipath-test'
    });
  } else if (!admin.apps) {
    admin.initializeApp({
      projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'resilipath-test'
    });
  }
  seedTemplates().then(() => {
    console.log('Seeding complete.');
    process.exit(0);
  }).catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
}

export { seedTemplates };

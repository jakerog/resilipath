const admin = require('firebase-admin');

process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

admin.initializeApp({
  projectId: 'resilipath-test',
});

const db = admin.firestore();

async function seed() {
  const tenantId = 'tenant-1';

  await db.collection('exercises').doc('ex-1').set({
    exerciseId: 'ex-1',
    tenantId,
    name: 'Critical Infrastructure Drill',
    status: 'active',
  });

  await db.collection('tasks').doc('task-1').set({
    taskId: 'task-1',
    exerciseId: 'ex-1',
    tenantId,
    title: 'Verify Database Failover',
    status: 'pending',
    order: 1,
    evidenceRequired: false,
    assetIds: []
  });

  await db.collection('assets').doc('asset-1').set({
    assetId: 'asset-1',
    tenantId,
    name: 'Primary SQL Cluster',
    type: 'system',
    criticality: 'critical',
    lastReviewedAt: admin.firestore.FieldValue.serverTimestamp(),
    bia: { rto: 60, rpo: 15 }
  });

  console.log('Seed data created');
}

seed().catch(console.error);

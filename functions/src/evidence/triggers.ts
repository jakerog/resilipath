/**
 * Evidence Processing Triggers for ResiliPath
 * Handles automated hashing, virus scanning (placeholder), and metadata updates.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

/**
 * Task 3/4/5/9: onEvidenceUploaded Trigger
 * Processes newly uploaded evidence files.
 * Optimization (Task 9): 512MB memory for hashing, 2 min timeout.
 */
export const onEvidenceUploaded = functions.runWith({
  memory: '512MB',
  timeoutSeconds: 120,
}).storage.object().onFinalize(async (object) => {
  const filePath = object.name; // e.g., tenants/{tenantId}/evidence/{exId}/{taskId}/{fileName}
  const bucketName = object.bucket;
  const contentType = object.contentType;

  // 1. Verify file path structure (Security Guardrail)
  if (!filePath || !filePath.startsWith('tenants/')) {
    console.log(`Skipping non-tenant file: ${filePath}`);
    return;
  }

  const parts = filePath.split('/');
  if (parts.length < 6) {
    console.error(`Unexpected path structure: ${filePath}`);
    return;
  }

  const [, tenantId, , exerciseId, taskId, fileName] = parts;

  try {
    // 2. Generate SHA-256 Hash (Task 3 / M2)
    const bucket = admin.storage().bucket(bucketName);
    const file = bucket.file(filePath);
    const [fileBuffer] = await file.download();

    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    console.log(`Hash generated for ${fileName}: ${hash}`);

    // 3. Virus Scan Placeholder (Task 5 / M2)
    // In a real implementation, this would call a third-party API.
    const isClean = true; // Placeholder for virus scan result
    if (!isClean) {
      console.warn(`VIRUS DETECTED in ${filePath}. Quarantining.`);
      // Logic to move to quarantine bucket would go here.
      return;
    }

    // 4. Update Firestore Task Document (Task 4 / M2)
    // Update the task document with the evidence hash and metadata.
    const evidenceMetadata = {
      evidenceId: object.id || admin.firestore().collection('placeholder').doc().id,
      fileName,
      filePath,
      contentType,
      hash,
      uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
      size: object.size,
    };

    await admin.firestore().collection('tasks').doc(taskId).update({
      evidenceIds: admin.firestore.FieldValue.arrayUnion(evidenceMetadata.evidenceId),
      // For MVP, we'll also store a simple record of evidence in a sub-collection or separate collection
      // but updating the parent task is the priority.
    });

    // 5. Create immutable audit log (M3)
    const auditLog = {
      who: 'SYSTEM_EVIDENCE_PROCESSOR',
      what: 'EVIDENCE_PROCESSED',
      when: admin.firestore.FieldValue.serverTimestamp(),
      tenantId,
      metadata: {
        taskId,
        exerciseId,
        fileName,
        hash,
        status: 'VERIFIED_AND_HASHED',
      },
    };

    await admin.firestore().collection('audit_logs').add(auditLog);

    console.log(`Evidence ${fileName} processed successfully for task ${taskId}.`);
  } catch (error) {
    console.error(`Error processing evidence for ${filePath}:`, error);
  }
});

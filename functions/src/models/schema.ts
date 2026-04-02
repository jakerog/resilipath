/**
 * ResiliPath - Firestore Schema Models
 * Follows Modular Design & Single-Concern Principle (Data Layer).
 */

import { FieldValue } from 'firebase-admin/firestore';

/**
 * Task 1: Tenant Collection Schema
 * Collection: /tenants/{tenantId}
 */
export interface Tenant {
  tenantId: string;
  name: string;
  tier: 'standard' | 'enterprise' | 'elite';
  status: 'active' | 'suspended';
  createdAt: FieldValue | Date;
  updatedAt: FieldValue | Date;
  admins: string[]; // Array of UIDs
  config?: {
    brandingColor?: string;
    logoUrl?: string;
    customDomain?: string;
  };
}

/**
 * Task 2: Exercises Collection Schema
 * Collection: /exercises/{exerciseId}
 */
export interface Exercise {
  exerciseId: string;
  tenantId: string; // Critical for isolation
  name: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';
  phase: 'Mock1' | 'Mock2' | 'Mock3' | 'Prod';
  startTimeEstimated: FieldValue | Date;
  startTimeActual?: FieldValue | Date;
  endTimeEstimated: FieldValue | Date;
  endTimeActual?: FieldValue | Date;
  durationEstimatedMinutes: number;
  durationActualMinutes?: number;
  varianceMinutes?: number;
  ownerUid: string;
  description?: string;
}

/**
 * Task 3: Tasks Collection Schema
 * Collection: /tasks/{taskId}
 */
export interface ExerciseTask {
  taskId: string;
  exerciseId: string;
  tenantId: string; // Critical for isolation
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  stage: 'Pre-Failover' | 'Failover' | 'Post-Failover' | 'Rollback' | string;
  order: number;
  dependsOn?: string[]; // Array of task IDs
  assignedToUid?: string;
  startTimeActual?: FieldValue | Date;
  endTimeActual?: FieldValue | Date;
  isReady?: boolean;
  durationEstimatedMinutes: number;
  durationActualMinutes?: number;
  evidenceRequired: boolean;
  evidenceIds?: string[];
  notes?: string;
}

/**
 * Task 4: Audit Logs Collection Schema (M3)
 * Collection: /audit_logs/{logId}
 * Note: Immutable and append-only via Security Rules.
 */
export interface AuditLog {
  who: string; // UID or SYSTEM
  what: string; // Action name (e.g., USER_LOGIN, EXERCISE_STARTED)
  when: FieldValue | Date;
  tenantId: string;
  moduleName?: string;
  featureFlag?: string;
  metadata: Record<string, any>;
}

/**
 * Task 7: Shared Reference Data Schema (ADR-001)
 * Collection: /shared_reference/{docId}
 */
export interface SharedReference {
  type: 'iso_standard' | 'threat_catalog' | 'regulatory_template';
  name: string;
  content: any;
  version: string;
  updatedAt: FieldValue | Date;
}

/**
 * Task 2: Communications - Mail Collection Schema
 * Collection: /mail/{mailId}
 * Used by 'Trigger Email' Firebase Extension
 */
export interface MailDocument {
  to: string | string[];
  template?: {
    name: string;
    data: Record<string, any>;
  };
  message?: {
    subject?: string;
    text?: string;
    html?: string;
  };
  tenantId: string; // Critical for isolation
  exerciseId?: string;
  taskId?: string;
  createdAt: FieldValue | Date;
  delivery?: {
    startTime: FieldValue | Date;
    endTime?: FieldValue | Date;
    state: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'ERROR';
    error?: string;
  };
}

/**
 * Task 5: Communications - SMS Collection Schema
 * Collection: /sms/{smsId}
 */
export interface SMSDocument {
  to: string; // E.164 format
  body: string;
  tenantId: string; // Critical for isolation
  exerciseId?: string;
  taskId?: string;
  status: 'pending' | 'sent' | 'failed';
  createdAt: FieldValue | Date;
  sentAt?: FieldValue | Date;
  retryCount?: number;
}

/**
 * Phase 2: Asset Registry - Asset Collection Schema
 * Collection: /assets/{assetId}
 */
export interface Asset {
  assetId: string;
  tenantId: string; // Critical for isolation
  name: string;
  type: 'system' | 'service' | 'infrastructure' | 'personnel';
  criticality: 'critical' | 'high' | 'medium' | 'low';
  description?: string;
  ownerUid: string;
  lastReviewedAt: FieldValue | Date;
  status: 'active' | 'deprecated' | 'maintenance';
  bia?: {
    rto: number; // Recovery Time Objective (minutes)
    rpo: number; // Recovery Point Objective (minutes)
  };
}

/**
 * Phase 2: Asset Registry - Vendor Collection Schema
 * Collection: /vendors/{vendorId}
 */
export interface Vendor {
  vendorId: string;
  tenantId: string; // Critical for isolation
  name: string;
  category: 'cloud' | 'software' | 'hardware' | 'consulting' | 'other';
  criticality: 'critical' | 'high' | 'medium' | 'low';
  contactEmail: string;
  slaMinutes?: number;
  lastReviewedAt: FieldValue | Date;
}

/**
 * ResiliPath - Identity & Access Management Functions
 *
 * Central entry point for all Cloud Functions.
 * Follows Modular Design & Free-Tier Priority (Minimizing execution time/cold starts).
 */

import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Initialize Admin SDK once
admin.initializeApp();

// Exported Functions
export * from './identity/triggers';
export * from './identity/api';
export * from './evidence/triggers';
export * from './orchestration/triggers';
export * from './orchestration/api';
export * from './communications/index';
export * from './reporting/api';
export * from './assets/triggers';

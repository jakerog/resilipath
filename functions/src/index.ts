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

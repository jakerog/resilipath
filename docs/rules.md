# RULES.md - Development & Operational Guardrails (v4.0 - Modular GCP/Firebase MVP)

**Project:** Multi-Tenant BC/DR SaaS Platform  
**Version:** 4.0 (Modular GCP/Firebase MVP)
**Generated:** 2026-03-31
**Last Updated:** 2026-03-31
**MVP Scope:** Disaster Recovery Exercise Execution Engine ONLY  
**Status:** LOCKED - Refactored for GCP/Firebase/Vercel

---

## Code Architecture Rules [FINAL]

### R1: Layered Architecture
- [x] Presentation Layer: **Next.js PWA frontend on Vercel** (online-only for MVP)
- [x] Application Layer: **Node.js (TypeScript) Cloud Functions**
- [x] Data Layer: **Firestore (document-level isolation) + Firebase Storage (evidence)**
- [x] Infrastructure Layer: **GCP / Firebase + GitHub Actions**

### R2: Module Separation (Modular MVP Focus)
- [x] DR Exercises module in `src/dr-exercises/` (ACTIVE for MVP)
- [x] BCP Plans module in `src/bcp-plans/` (PLACEHOLDER - hidden via feature flag)
- [x] Crisis Communications module in `src/crisis-comms/` (PLACEHOLDER - hidden via feature flag)
- [x] Shared libraries in `src/shared/` (auth, logging, utils, feature-flags)

### R3: API Design (Internal Only for MVP)
- [x] Cloud Functions for serverless business logic
- [x] Versioned APIs via function naming or route prefixing
- [x] Rate limiting via GCP API Gateway or Firebase-native limits
- [x] Request/response logging for audit (who, what, when, where + module_name, feature_flag, tenant_tier)

### R4: Testing Standards
- [x] Unit test coverage > 80% (enforced in CI)
- [x] Firestore Security Rules unit tests (Firebase Emulator Suite)
- [x] E2E tests for critical user journeys (Next.js components + Firestore sync)
- [x] Load testing (simulate concurrent users per exercise)

---

## Security Rules [FINAL - LOCKED]

### R5: Authentication
- [x] **Firebase Authentication + Custom Claims**
- [x] MFA supported via Identity Platform (SMS/Email/TOTP)
- [x] Session management handled by Firebase Auth SDK
- [x] Custom Claims for `tenantId` and `roles` storage in JWT

### R6: Authorization
- [x] **Firestore Security Rules** for document-level authorization
- [x] RBAC enforced via Custom Claims in Auth tokens
- [x] `tenantId` validated on every read/write via Security Rules
- [x] Secrets managed via **GCP Secret Manager**

### R7: Data Encryption
- [x] TLS 1.3 for all data in transit
- [x] AES-256 for all data at rest (GCP default)
- [x] Secrets managed via GCP Secret Manager with envelope encryption

### R8: Audit Logging (Future-Proofed)
- [x] All user actions logged to `audit_log` collection: who, what, when, where + module_name, feature_flag, tenant_tier
- [x] Audit logs immutable (Security Rules prevent updates/deletes)
- [x] Audit logs retained per tenant policy (minimum 3 years for ISO 22301)

### R9: Input Validation
- [x] All inputs validated and sanitized (Zod schema validation)
- [x] Security Rules for server-side validation of document structure
- [x] XSS prevention: Next.js default encoding + CSP headers
- [x] File upload validation: Security Rules (size/type) + virus scan (Cloud Function)

### R10: Error Handling
- [x] No stack traces in production error messages
- [x] Detailed errors logged to **GCP Cloud Logging**
- [x] Error monitoring via Sentry / Google Cloud Error Reporting

---

## Operational Rules [FINAL - LOCKED]

### R11: CI/CD
- [x] All code changes via pull requests
- [x] Automated testing in GitHub Actions: lint, unit, integration, security scan
- [x] Deployments to Vercel (Frontend) and Firebase (Functions/Rules/Config)

### R12: Monitoring
- [x] **Google Cloud Monitoring / Error Reporting**
- [x] Real-time tracking of Firestore usage and Cloud Function execution
- [x] Alerting on threshold breaches: function errors, security rule rejections

### R14: Backup & Recovery
- [x] Automated Firestore backups (Scheduled Exports)
- [x] Firebase Storage versioning for evidence files
- [x] Platform DR SLA: RPO < 1 hour, RTO < 4 hours

---

## Data Management Rules [FINAL - LOCKED]

### R16: Tenant Isolation
- [x] **tenantId on every Firestore document**
- [x] Security Rules enforce `request.auth.token.tenantId == resource.data.tenantId`
- [x] No cross-tenant queries allowed (enforced by Security Rules)

### R19: Evidence Management (MVP: Photo + Text Only)
- [x] Evidence files stored in **Firebase Storage** with `tenantId` prefix
- [x] Evidence linked to task via metadata in Firestore
- [x] Evidence virus-scanned before promotion (Cloud Function trigger)
- [x] MVP constraint: Photo uploads limited to 25MB, JPG/PNG/WebP only

---

## UX/UI Rules [FINAL - LOCKED]

### R21: PWA Requirements (Online-Only for MVP)
- [x] Next.js PWA config: Name, icons, theme color, manifest
- [x] Real-time updates via **Firestore Real-time SDK**
- [x] Responsive design: Mobile-first breakpoints

### R23: Performance
- [x] Page load time < 2 seconds (p95) on Vercel Edge Network
- [x] Sync latency < 100ms for status updates via Firestore
- [x] Image optimization via Next.js Image component

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 4.0 | 2026-03-31 | Primary Agent | Refactored for modular GCP/Firebase/Vercel architecture. |

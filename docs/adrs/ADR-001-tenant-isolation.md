# ADR-001: ResiliPath Isolation Strategy (v3.0 - Single-Module MVP)

**Status:** Accepted  
**Date:** 2026-03-30  
**Deciders:** Primary Agent, Security Agent, Data Agent  
**Technical Context:** ResiliPath - Single-Module MVP
**Compliance Impact:** SOC 2 CC6.1, ISO 27001 A.9.4.1, GDPR Art. 28

---

## Context

The platform requires strict tenant isolation for SOC 2 Type II and ISO 27001 compliance while enabling:
- Shared reference data (ISO standards, threat catalogs, regulatory templates)
- Cross-tenant reporting for enterprise subsidiaries (Parent → Child aggregation)
- Data residency requirements (single region at launch)
- **Minimal Viable Foundation**: Placeholder collections for future modules (BCP Plans, Crisis Communications) hidden via feature flags
- **Free-Tier Priority**: Optimize for low operational costs at scale.

Previous model was Schema-per-tenant in Firestore. Shifting to GCP/Firebase.

---

## Decision

Adopt **Firestore with Document-Level Isolation and Security Rules** model:

### Isolation Architecture
- **Firestore Collections**: Standard collections (e.g., `exercises`, `tasks`, `resources`) will include a mandatory `tenantId` field.
- **Security Rules**: Firebase Security Rules will enforce that users can only read/write documents where the `tenantId` matches their own `tenantId` (stored in custom claims in Firebase Auth).
- **Public Data**: A `shared_reference` collection for ISO standards and templates, readable by all authenticated users.
- **Tenant Config**: A `tenants` collection containing tenant-specific settings, branding, and feature flags.

### Benefits
- **Scalability**: Firebase scales automatically without managing server instances.
- **Cost**: Generous free tier for Firestore and Firebase Auth.
- **Security**: Centralized rule management for data access.

### Verification
- [ ] Firestore Security Rules unit tests (using Firebase Emulator Suite).
- [ ] Penetration testing confirms no cross-tenant data access via API or Client SDK.
- [ ] Audit log sampling shows zero cross-tenant access attempts.

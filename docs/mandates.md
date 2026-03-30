# MANDATES.md - Non-Negotiable Constraints (v4.0 - Modular GCP/Firebase MVP)

**Project:** Multi-Tenant BC/DR SaaS Platform  
**Version:** 4.0 (Modular GCP/Firebase MVP)
**Generated:** 2026-03-31
**Last Updated:** 2026-03-31
**MVP Scope:** Disaster Recovery Exercise Execution Engine ONLY  
**Status:** LOCKED - Refactored for GCP/Firebase/Vercel

---

## M1: Multi-Tenancy Foundation [FINAL - LOCKED]

**Priority:** MVP-CRITICAL  
**Rationale:** Platform is subscription-based for multiple corporate tenants; isolation is foundational and cannot be added later.

### Requirements
- [x] Tenant data must be fully isolated at rest and in transit via **Firestore Security Rules and tenantId mapping**
- [x] Shared reference data (ISO standards, threat catalogs) accessible via `shared_reference` collection
- [x] Parent entities can view aggregated metrics across Child tenants WITHOUT accessing unfiltered PII
- [x] Tenant-specific configuration and branding supported via `tenants` collection
- [x] Tenant onboarding: Self-service with downloadable template + Preview & Map UI for runbook import
- [x] Tenant data export: JSON, CSV, PDF on demand
- [x] Retention policies configurable per tenant; platform-enforced minimums for compliance

### Verification
- [ ] Penetration testing confirms no cross-tenant data access
- [ ] Firestore Security Rules unit tests validate `tenantId` enforcement
- [ ] Audit log sampling shows zero cross-tenant access attempts
- [ ] Tenant export includes all operational data + audit trail

---

## M2: Evidence-First Design (MVP: Photo + Text Only) [FINAL - LOCKED]

**Priority:** MVP-CRITICAL  
**Rationale:** DR exercises require audit-ready evidence for SOC 2 Type II and ISO 27001 compliance.

### Requirements (MVP Scope)
- [x] Every task can have evidence attached: **Photo (25MB max, JPG/PNG/WebP) or Text only**
- [x] Evidence wrapped in Metadata Envelope: {who, when_utc, where_plan_id, sha256_hash}
- [x] Evidence is immutable once task is marked Complete; amendments require new evidence entry
- [x] Evidence stored via **Firebase Storage + direct-to-storage SDK + Cloud Functions for hashing/metadata**
- [x] Evidence included in exercise reports with hash verification
- [x] Evidence retention policies configurable per tenant; minimum 3 years for ISO 22301

### Deferred to Phase 2
- [ ] File upload (PDF, DOCX, etc.) beyond 25MB photo limit
- [ ] Webhook-based evidence ingestion

### Verification
- [ ] Sample exercise execution with evidence collection passes audit simulation
- [ ] Attempted evidence modification after task completion fails with audit log entry
- [ ] Virus scan quarantine workflow tested with malicious file sample (Cloud Function trigger)
- [ ] SHA-256 hash verification confirms evidence integrity post-upload

---

## M3: Compliance Alignment [FINAL - LOCKED]

**Priority:** MVP-CRITICAL  
**Rationale:** Target customers require SOC 2 Type II and ISO 27001 alignment at launch.

### Requirements
- [x] SOC 2 Type II readiness at MVP launch (04/01/2026)
- [x] ISO 22301 exercise documentation alignment (drill log, lessons learned)
- [x] Audit logging for all user actions: who, what, when, where + module_name, feature_flag, tenant_tier
- [x] Audit logs immutable (append-only Firestore collection) and exportable
- [x] Annual review workflow foundation for BCP plans (Phase 2)
- [x] Manual third-party penetration test 1-2 months pre-audit; VDP at launch, bug bounty post-SOC 2

### Verification
- [ ] SOC 2 audit preparation checklist completed pre-launch
- [ ] ISO 22301 control mapping document created for Module 2 foundation
- [ ] Audit log export tested with sample tenant data
- [ ] Penetration test report with remediation evidence submitted to auditor

---

## M4: PWA/Mobile-Native UX (Online-Only for MVP) [FINAL - LOCKED]

**Priority:** MVP-CRITICAL  
**Rationale:** DR exercises may occur in low-connectivity environments; mobile-first design is non-negotiable.

### Requirements (MVP Scope)
- [x] Progressive Web App (PWA) with mobile-native feel (**Next.js on Vercel**)
- [x] Responsive design for tablet and desktop
- [x] Photo evidence capture from mobile device with EXIF stripping (via Cloud Function)
- [x] Real-time status updates via **Firestore Real-time SDK** (sub-100ms latency)

### Deferred to Phase 2
- [ ] Offline mode: Service Workers + IndexedDB + encrypted local cache + background sync
- [ ] Auto-wipe policy: Local cache clears if device hasn't checked in for 30 days

### Verification
- [ ] PWA installation test on iOS Safari and Android Chrome
- [ ] Mobile UX review on multiple device sizes (phone, tablet, desktop)
- [ ] Real-time sync test: Task status updates propagate to all connected clients in < 100ms

---

## M5: Role-Based Access Control [FINAL - LOCKED]

**Priority:** MVP-CRITICAL  
**Rationale:** Different users have different permissions during exercises; granular control required for compliance.

### Requirements
- [x] Four roles implemented: Admin, User, Report, Moderator
- [x] Field-level permissions for User role: Enforced via **Firestore Security Rules**
- [x] RBAC enforced at **Firebase Auth Custom Claims level + Security Rules**
- [x] Role assignment per tenant, not global; SSO/SAML supported via Identity Platform

### Verification
- [ ] Login as each role, verify accessible features match specification
- [ ] Attempt unauthorized actions (e.g., cross-tenant access) fails with audit log entry
- [ ] Audit log shows role-based access attempts with `tenantId` validation

---

## M6: Exercise Independence [FINAL - LOCKED]

**Priority:** MVP-CRITICAL  
**Rationale:** Each DR exercise is independent with own data; exercises must be comparable across time for trend analysis.

### Requirements
- [x] Each exercise has independent Resources, Tasks, Teams within Firestore collections
- [x] Exercise data saved independently for reporting; exercises can be compared across time
- [x] Exercise templates can be cloned for future exercises with tenant-specific overrides
- [x] Exercise phases (Mock1, Mock2, Mock3, Prod) tracked separately
- [x] Dry Run Mode: Sandbox execution layer with virtual clocks and mock notifications

### Verification
- [ ] Create two exercises, verify data isolation and independent reporting
- [ ] Clone exercise template, verify independence and override capability
- [ ] Execute Dry Run, verify no production side effects (no real SMS, no real emails)

---

## M7: Timing & Variance Tracking [FINAL - LOCKED]

**Priority:** MVP-CRITICAL  
**Rationale:** DR runbooks require precise timing analysis for RTO validation and continuous improvement.

### Requirements
- [x] Estimated Duration per task (from runbook import or manual entry)
- [x] Actual Duration calculated: End Time - Start Time (**server-side via Cloud Functions**)
- [x] Variance Duration calculated: Actual - Estimated (with tunable alert thresholds)
- [x] Stage-level duration aggregation (Pre-Failover, Failover, Post-Failover, Rollback)
- [x] Variance alerts: Real-time notifications via **Firebase Extensions**

### Verification
- [ ] Execute sample exercise, verify timing calculations match manual computation
- [ ] Generate variance report, verify accuracy and PDF export
- [ ] Test variance alert triggers with tunable thresholds

---

## M8: Stage Management [FINAL - LOCKED]

**Priority:** MVP-CRITICAL  
**Rationale:** DR exercises follow specific stage progression; rollback stages only activated on failure.

### Requirements
- [x] Eight stages supported per event (Failover/Failback)
- [x] Rollback stages only activated if previous stages fail or critical variance detected
- [x] Stage start/end timestamps tracked in UTC; displayed in user-local time
- [x] Stage completion required before next stage (for Sequential workflow)
- [x] Go/No-Go decision points documented with simple toggle + optional note + audit log

### Verification
- [ ] Execute exercise through all stages, verify progression rules enforced by Cloud Functions
- [ ] Test rollback activation on simulated stage failure
- [ ] Verify Go/No-Go decision points require explicit toggle before proceeding

---

## M9: Resource Check-In [FINAL - LOCKED]

**Priority:** MVP-CRITICAL  
**Rationale:** Resource availability is biggest issue in DR exercises; check-in critical for success.

### Requirements
- [x] Resources can check in ahead of exercise dates via **SMS primary (Firebase Extension/Twilio)**
- [x] Check-in status visible to exercise owners in real-time
- [x] Reminder notifications for upcoming check-in deadlines
- [x] Escalation if critical resources not checked in (via Cloud Function logic)

### Verification
- [ ] Resource check-in workflow test via SMS reply
- [ ] Check-in status dashboard review shows real-time availability
- [ ] Reminder notification test with configurable lead time

---

## M10: Communication Engine [FINAL - LOCKED]

**Priority:** MVP-CRITICAL  
**Rationale:** DR exercises require coordinated communications.

### Requirements (MVP Scope)
- [x] Email list management with tenant isolation in Firestore
- [x] Email templates with variable substitution (e.g., {{exercise_name}})
- [x] Automated delivery via **Firebase Extensions (Trigger Email)**
- [x] Delivery tracking (Sent/Delivered) logged back to Firestore

### Verification
- [ ] Create email list and template, verify variable substitution works
- [ ] Schedule and send test email, verify delivery tracking in dashboard

---

## M11: Report Dashboard (PDF Only for MVP) [FINAL - LOCKED]

**Priority:** MVP-CRITICAL  
**Rationale:** Exercise reporting required for compliance.

### Requirements (MVP Scope)
- [x] 4 core reports: Actual Duration, Actual vs. Estimated, Variance, Stage Completion
- [x] Export reports to **PDF only** via **Cloud Functions + Puppeteer**
- [x] Report access restricted via Firestore Security Rules

### Verification
- [ ] Generate all four required reports from sample exercise data
- [ ] Export reports to PDF, verify formatting and data accuracy
- [ ] Verify role-based report access

---

## M12: Drill Log (Basic Lessons Learned) [FINAL - LOCKED]

**Priority:** MVP-CRITICAL  
**Rationale:** ISO 22301 requires documentation of lessons learned.

### Requirements (MVP Scope)
- [x] Basic drill log field: {summary, action_items[], owner}
- [x] Drill log editable during exercise; immutable after completion
- [x] Drill log included in PDF reports
- [x] Audit trail of edits stored in Firestore

### Verification
- [ ] Create drill log entry, verify inclusion in PDF report
- [ ] Verify drill log immutability after exercise completion

---

## M13: Minimal Viable Foundation Architecture [FINAL - LOCKED]

**Priority:** MVP-CRITICAL  
**Rationale:** Enable future module addition without breaking changes.

### Requirements
- [x] Placeholder collections for `bcp_plans`, `communications`, `vendor_risk`
- [x] Feature flag system: **Firebase Remote Config + Firestore Overrides**
- [x] Audit log schema future-proofed with `module_name` and `feature_flag` fields
- [x] API contracts defined for Cloud Functions but not implemented for future modules

### Verification
- [ ] Feature flag toggles hide/show UI elements and restrict Firestore access
- [ ] Audit log captures all context fields from Day 1

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 4.0 | 2026-03-31 | Primary Agent | Refactored for GCP/Firebase/Vercel stack. |

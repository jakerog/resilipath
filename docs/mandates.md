
**💾 Save Instructions:** Copy content above → Create/overwrite file `docs/summary.md` → Save

---

### 📄 FILE 2: `docs/mandates.md` (v3.0 - Single-Module MVP)

```markdown
# MANDATES.md - Non-Negotiable Constraints (v3.0 - Single-Module MVP)

**Project:** Multi-Tenant BC/DR SaaS Platform  
**Version:** 3.0 (FINAL - Single-Module MVP)  
**Generated:** 2026-03-30  
**Last Updated:** 2026-03-30  
**MVP Scope:** Disaster Recovery Exercise Execution Engine ONLY  
**Status:** LOCKED - No changes without Primary Agent + Security Agent approval

---

## M1: Multi-Tenancy Foundation [FINAL - LOCKED]

**Priority:** MVP-CRITICAL  
**Rationale:** Platform is subscription-based for multiple corporate tenants; isolation is foundational and cannot be added later.

### Requirements
- [x] Tenant data must be fully isolated at rest and in transit via schema-per-tenant model
- [x] Shared reference data (ISO standards, threat catalogs) accessible via "public" schema
- [x] Parent entities can view aggregated metrics across Child tenants WITHOUT accessing unfiltered PII
- [x] Tenant-specific configuration and branding supported
- [x] Tenant onboarding: Self-service with downloadable template + Preview & Map UI for runbook import
- [x] Tenant data export: JSON, Excel/CSV, PDF on demand
- [x] Retention policies configurable per tenant; platform-enforced minimums for compliance

### Verification
- [ ] Penetration testing confirms no cross-tenant data access
- [ ] Code review validates tenant_id on every database query
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
- [x] Evidence stored via direct-to-S3 presigned URLs + async virus scan + quarantine bucket promotion
- [x] Evidence included in exercise reports with hash verification
- [x] Evidence retention policies configurable per tenant; minimum 3 years for ISO 22301

### Deferred to Phase 2
- [ ] File upload (PDF, DOCX, etc.) beyond 25MB photo limit
- [ ] Webhook-based evidence ingestion

### Verification
- [ ] Sample exercise execution with evidence collection passes audit simulation
- [ ] Attempted evidence modification after task completion fails with audit log entry
- [ ] Virus scan quarantine workflow tested with malicious file sample
- [ ] SHA-256 hash verification confirms evidence integrity post-upload

---

## M3: Compliance Alignment [FINAL - LOCKED]

**Priority:** MVP-CRITICAL  
**Rationale:** Target customers require SOC 2 Type II and ISO 27001 alignment at launch.

### Requirements
- [x] SOC 2 Type II readiness at MVP launch (04/01/2026)
- [x] ISO 22301 exercise documentation alignment (drill log, lessons learned)
- [x] Audit logging for all user actions: who, what, when, where + module_name, feature_flag, tenant_tier (future-proof)
- [x] Audit logs immutable (append-only) and exportable (CSV/JSON/SIEM stream)
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
- [x] Progressive Web App (PWA) with mobile-native feel (skeuomorphic design per DR Hub PDF)
- [x] Responsive design for tablet and desktop
- [x] Photo evidence capture from mobile device with EXIF stripping (unless required)
- [x] Real-time status updates via WebSocket (sub-100ms latency)

### Deferred to Phase 2
- [ ] Offline mode: Service Workers + IndexedDB + encrypted local cache + background sync
- [ ] Auto-wipe policy: Local cache clears if device hasn't checked in for 30 days

### Verification
- [ ] PWA installation test on iOS Safari and Android Chrome
- [ ] Mobile UX review on multiple device sizes (phone, tablet, desktop)
- [ ] WebSocket sync test: Task status updates propagate to all connected clients in < 100ms

---

## M5: Role-Based Access Control [FINAL - LOCKED]

**Priority:** MVP-CRITICAL  
**Rationale:** Different users have different permissions during exercises; granular control required for compliance.

### Requirements
- [x] Four roles implemented: Admin, User, Report, Moderator
- [x] Field-level permissions for User role: Can edit task status, evidence (Photo/Text), notes, Go/No-Go toggle; cannot edit estimated duration, predecessor tasks
- [x] RBAC enforced at API layer + field-level ABAC for data permissions
- [x] Backend access restricted by role; frontend UI adapts to user role
- [x] Role assignment per tenant, not global; SSO/SAML required for enterprise tenants

### Verification
- [ ] Login as each role, verify accessible features match specification
- [ ] Attempt unauthorized actions (e.g., User editing estimated duration) fails with audit log entry
- [ ] Audit log shows role-based access attempts with tenant_id validation

---

## M6: Exercise Independence [FINAL - LOCKED]

**Priority:** MVP-CRITICAL  
**Rationale:** Each DR exercise is independent with own data; exercises must be comparable across time for trend analysis.

### Requirements
- [x] Each exercise has independent Resources, Tasks, Teams, Vendors within tenant schema
- [x] Exercise data saved independently for reporting; exercises can be compared across time
- [x] Exercise templates can be cloned for future exercises with tenant-specific overrides
- [x] Exercise phases (Mock1, Mock2, Mock3, Prod) tracked separately with distinct start/end times
- [x] Dry Run Mode: Sandbox execution layer with virtual clocks, mock integrations, zero-impact alerts

### Verification
- [ ] Create two exercises, verify data isolation and independent reporting
- [ ] Clone exercise template, verify independence and override capability
- [ ] Execute Dry Run, verify no production side effects (no real SMS, no API calls)

---

## M7: Timing & Variance Tracking [FINAL - LOCKED]

**Priority:** MVP-CRITICAL  
**Rationale:** DR runbooks require precise timing analysis for RTO validation and continuous improvement.

### Requirements
- [x] Estimated Duration per task (from runbook import or manual entry)
- [x] Actual Duration calculated: End Time - Start Time (server-side UTC)
- [x] Variance Duration calculated: Actual - Estimated (with tunable alert thresholds)
- [x] Stage-level duration aggregation (Pre-Failover, Failover, Post-Failover, Rollback)
- [x] Exercise-level duration aggregation with team breakdowns
- [x] Variance alerts: Real-time notifications (Push/SMS) + summary reports + escalation logic

### Verification
- [ ] Execute sample exercise, verify timing calculations match manual computation
- [ ] Generate variance report, verify accuracy and PDF export
- [ ] Test variance alert triggers with tunable thresholds; verify escalation logic

---

## M8: Stage Management [FINAL - LOCKED]

**Priority:** MVP-CRITICAL  
**Rationale:** DR exercises follow specific stage progression; rollback stages only activated on failure.

### Requirements
- [x] Eight stages supported per event (Failover/Failback):
  - Pre-Failover / Pre-Failback
  - Failover / Failback
  - Post-Failover / Post-Failback
  - Failover-Rollback / Failback-Rollback
- [x] Rollback stages only activated if previous stages fail or critical variance detected
- [x] Stage start/end timestamps tracked in UTC; displayed in user-local time
- [x] Stage completion required before next stage (for Sequential workflow); parallel stages can proceed independently
- [x] Go/No-Go decision points documented with simple toggle (Go/No-Go) + optional note + audit log

### Verification
- [ ] Execute exercise through all stages, verify progression rules enforced
- [ ] Test rollback activation on simulated stage failure
- [ ] Verify Go/No-Go decision points require explicit toggle before proceeding

---

## M9: Resource Check-In [FINAL - LOCKED]

**Priority:** MVP-CRITICAL  
**Rationale:** Resource availability is biggest issue in DR exercises (per DR Hub PDF); check-in critical for success.

### Requirements
- [x] Resources can check in ahead of exercise dates via SMS primary, manual dashboard secondary, calendar integration tertiary (pre-crisis only)
- [x] Check-in validates date/time availability; status visible to exercise owners
- [x] Reminder notifications for upcoming check-in deadlines (configurable lead time)
- [x] Escalation if critical resources not checked in (configurable escalation path)
- [x] Check-in status included in exercise reports and real-time dashboard

### Verification
- [ ] Resource check-in workflow test via SMS reply "1" + manual dashboard + calendar sync
- [ ] Check-in status dashboard review shows real-time availability
- [ ] Reminder notification test with configurable lead time; escalation test with mock critical resource

---

## M10: Email Engine [FINAL - LOCKED]

**Priority:** MVP-CRITICAL  
**Rationale:** DR exercises require coordinated communications; email engine critical for stakeholder updates.

### Requirements (MVP Scope)
- [x] Email list creation and management with tenant isolation
- [x] Email template creation with variable substitution (e.g., {{exercise_name}}, {{start_time}})
- [x] Email list assignment to templates; scheduled delivery (pre-exercise, during, post-exercise)
- [x] Email delivery tracking: Sent, Delivered (two-tier tracking loop)
- [x] Integration with email provider (SendGrid, AWS SES) with fallback provider support

### Deferred to Phase 2
- [ ] Acknowledgment tracking (user-initiated click/reply)
- [ ] Multi-language templating
- [ ] Approval workflows for external communications

### Verification
- [ ] Create email list and template, verify variable substitution works
- [ ] Schedule and send test email, verify delivery tracking in dashboard
- [ ] Test fallback provider by simulating primary provider outage

---

## M11: Report Dashboard (PDF Only for MVP) [FINAL - LOCKED]

**Priority:** MVP-CRITICAL  
**Rationale:** Exercise reporting required for compliance and continuous improvement; four core reports mandatory.

### Requirements (MVP Scope)
- [x] Actual Duration report: Total time to complete exercise
- [x] Actual vs. Estimated Duration report: Variance per task and aggregate
- [x] Variance Duration report: Actual - Estimated per task with tunable thresholds
- [x] Stage Completion Time report: Per stage, per event (Failover/Failback)
- [x] Export reports to **PDF only** (immutable audit copy)
- [x] Report access restricted to Report role and above; tenant-isolated

### Deferred to Phase 2
- [ ] Excel export for data analysis
- [ ] PowerPoint export for executive summaries

### Verification
- [ ] Generate all four required reports from sample exercise data
- [ ] Export reports to PDF, verify formatting and data accuracy
- [ ] Verify role-based report access: Report role can view, User role cannot

---

## M12: Drill Log (Basic Lessons Learned) [FINAL - LOCKED]

**Priority:** MVP-CRITICAL  
**Rationale:** ISO 22301 requires documentation of lessons learned; basic capture in MVP, full workflow in Phase 2.

### Requirements (MVP Scope)
- [x] Basic drill log field per exercise: {summary, action_items[], owner}
- [x] Drill log editable during exercise; immutable after exercise completion
- [x] Drill log included in PDF reports
- [x] Audit trail of drill log edits (who, when, what changed)

### Deferred to Phase 2
- [ ] Full lessons learned workflow with approval, versioning, cross-exercise comparison

### Verification
- [ ] Create drill log entry during sample exercise, verify inclusion in PDF report
- [ ] Verify drill log immutability after exercise completion
- [ ] Audit log shows drill log edits with user attribution

---

## M13: Minimal Viable Foundation Architecture [FINAL - LOCKED]

**Priority:** MVP-CRITICAL  
**Rationale:** Enable future module addition without breaking changes; build contracts, not features.

### Requirements
- [x] Placeholder tables created in Phase 0: `bcp_plan`, `communication`, `vendor_risk` with minimal fields + foreign keys to `exercise`
- [x] Feature flag system implemented: `{ features: { bcp_module: false, evidence_webhook: false, crisis_comms: false } }`
- [x] Audit log schema future-proofed: `module_name`, `feature_flag`, `tenant_tier` fields included from Day 1
- [x] API contract defined for future modules but not implemented (internal APIs only for MVP)
- [x] Database migration versioning enabled (Flyway/Prisma) for safe schema evolution

### Verification
- [ ] Feature flag toggles hide/show placeholder table access in admin UI
- [ ] Audit log includes module_name/feature_flag/tenant_tier for all entries
- [ ] Database migration script can add new columns to placeholder tables without downtime

---

## Out of Scope (MVP) - FINAL

| Item | Rationale | Phase |
|------|-----------|-------|
| BCP Plan Generation Module | Valuable but not critical for MVP; requires guided interview + template engine | Phase 2 |
| Crisis Communications Module | Valuable but not critical for MVP; requires multi-channel notification engine | Phase 3 |
| Vendor Risk Module | Valuable but not critical for MVP; requires external supplier data | Phase 4 |
| Compliance Mapper Module | Valuable but not critical for MVP; requires regulatory framework mapping | Phase 4 |
| Training Module | Valuable but not critical for MVP; can be added post-core execution | Post-Phase 4 |
| Native Mobile Apps | PWA sufficient for MVP; native apps deferred to Phase 3 for cost efficiency | Phase 3 |
| ML Analytics | Valuable but not critical for MVP; requires historical exercise data | Phase 4 |
| Third-party Integrations (ServiceNow, Everbridge) | Can be added post-MVP via API; focus MVP on core execution | Phase 3 |
| Offline Mode (PWA) | Critical for BCM but deferred to Phase 2 for speed; MVP is online-only | Phase 2 |
| Evidence: File + Webhook | Photo + Text sufficient for MVP audit compliance; File + Webhook added in Phase 2 | Phase 2 |
| Reporting: Excel/PPT Export | PDF sufficient for MVP audit compliance; Excel/PPT added in Phase 2 | Phase 2 |
| External API Exposure | Internal APIs sufficient for MVP; external API contract defined but not implemented | Phase 2 |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-30 | Primary Agent | Initial draft based on source documents |
| 2.0 | 2026-03-30 | Primary Agent | All 68 clarification questions answered + Option A import decision |
| 3.0 | 2026-03-30 | Primary Agent | SINGLE-MODULE MVP: DR Exercise Engine only; Minimal Viable Foundation architecture; MVP launch 04/01/2026; Offline mode, File evidence, Excel/PPT reports deferred to Phase 2 |
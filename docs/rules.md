# RULES.md - Development & Operational Guardrails (v3.0 - Single-Module MVP)

**Project:** Multi-Tenant BC/DR SaaS Platform  
**Version:** 3.0 (FINAL - Single-Module MVP)  
**Generated:** 2026-03-30  
**Last Updated:** 2026-03-30  
**MVP Scope:** Disaster Recovery Exercise Execution Engine ONLY  
**Status:** LOCKED - No changes without Primary Agent + Security Agent + DevOps Agent approval

---

## Code Architecture Rules [FINAL]

### R1: Layered Architecture
- [x] Presentation Layer: Next.js PWA frontend (online-only for MVP)
- [x] Application Layer: Node.js (TypeScript) API Gateway + Business Logic
- [x] Data Layer: PostgreSQL (schema-per-tenant) + Redis (cache) + S3 (evidence)
- [x] Infrastructure Layer: AWS + Terraform + K8s (core) + Serverless (event-driven)

### R2: Module Separation (MVP Focus)
- [x] DR Exercises module in `src/dr-exercises/` (ACTIVE for MVP)
- [x] BCP Plans module in `src/bcp-plans/` (PLACEHOLDER - hidden via feature flag)
- [x] Crisis Communications module in `src/crisis-comms/` (PLACEHOLDER - hidden via feature flag)
- [x] Shared libraries in `src/shared/` (auth, logging, utils, feature-flags)

### R3: API Design (Internal Only for MVP)
- [x] RESTful API with OpenAPI 3.0 specification
- [x] Versioned APIs (v1, v2) with deprecation policy
- [x] Rate limiting per tenant (configurable thresholds)
- [x] Request/response logging for audit (who, what, when, where + module_name, feature_flag, tenant_tier)
- [x] External API contract defined but NOT implemented for MVP (deferred to Phase 2)

### R4: Testing Standards
- [x] Unit test coverage > 80% (enforced in CI)
- [x] Integration tests for all API endpoints (tenant isolation focus)
- [x] E2E tests for critical user journeys (runbook import, task execution, evidence upload, PDF report generation)
- [x] Load testing before each release (simulate 100 concurrent users per exercise)

---

## Security Rules [FINAL - LOCKED]

### R5: Authentication
- [x] OAuth 2.0 / OIDC via Auth0 or WorkOS (no custom auth)
- [x] MFA required for Admin role; optional for User role
- [x] Session timeout after 30 minutes of inactivity
- [x] Password complexity: 12+ chars, mixed case, numbers, symbols

### R6: Authorization
- [x] RBAC enforced at API layer + ABAC for data-level permissions
- [x] Field-level permissions enforced (e.g., User cannot edit estimated_duration)
- [x] Tenant ID validated on every request (JWT claim + database check)
- [x] No hardcoded credentials in code; secrets via AWS Secrets Manager

### R7: Data Encryption
- [x] TLS 1.3 for all data in transit
- [x] AES-256 for all data at rest (PostgreSQL TDE + S3 SSE)
- [x] Tenant-specific encryption keys (Phase 1: provider-managed; Phase 2: BYOK module)
- [x] Secrets managed via AWS Secrets Manager with envelop encryption

### R8: Audit Logging (Future-Proofed)
- [x] All user actions logged: who (user_id, IP), what (action + diff), when (UTC), where (tenant_id, object_id) + module_name, feature_flag, tenant_tier
- [x] Audit logs immutable (append-only PostgreSQL table + SHA-256 hashing for high-stakes events)
- [x] Audit logs retained per tenant policy (minimum 3 years for ISO 22301)
- [x] Audit logs exportable: CSV/JSON on demand + SIEM stream via webhook

### R9: Input Validation
- [x] All inputs validated and sanitized (Zod schema validation)
- [x] SQL injection prevention: Parameterized queries only (no string interpolation)
- [x] XSS prevention: Output encoding + CSP headers
- [x] File upload validation: Magic number check + virus scan + size limit (25MB max for MVP photos)

### R10: Error Handling
- [x] No stack traces in production error messages (generic user-facing errors)
- [x] Detailed errors logged internally with correlation ID
- [x] Error monitoring via Sentry + alerting on threshold breaches
- [x] Graceful degradation: Show offline warning if API unreachable (MVP is online-only)

---

## Operational Rules [FINAL - LOCKED]

### R11: CI/CD
- [x] All code changes via pull requests (minimum 2 approvals for production)
- [x] Automated testing in CI pipeline: lint, unit, integration, security scan
- [x] Blue-green deployments for zero downtime (K8s + Argo Rollouts)
- [x] Canary releases: 5% → 25% → 100% rollout with automated rollback on error spike

### R12: Monitoring
- [x] Application performance monitoring (APM) via DataDog/New Relic
- [x] Infrastructure monitoring: CPU, memory, disk, network (CloudWatch + Prometheus)
- [x] Business metrics monitoring: exercises created, tasks completed, evidence uploaded, PDF reports generated
- [x] Alerting on threshold breaches: p95 latency > 2s, error rate > 1%, tenant isolation breach

### R13: Incident Response
- [x] Incident response playbook documented (Slack channel, escalation path, comms template)
- [x] On-call rotation established (Primary Agent + DevOps Agent + Security Agent)
- [x] Post-incident reviews required within 72 hours (blameless, action items tracked)
- [x] Incident metrics tracked: MTTR, MTTD, customer impact

### R14: Backup & Recovery
- [x] Daily automated backups: PostgreSQL point-in-time recovery + S3 versioning
- [x] Backup verification tests monthly: Restore to staging, validate data integrity
- [x] Platform DR SLA: RPO < 1 hour, RTO < 4 hours (Business-Important Tier)
- [x] Backup encryption enabled: KMS-managed keys + tenant isolation

### R15: Change Management
- [x] All changes documented in changelog (Conventional Commits format)
- [x] Release notes for each deployment (user-facing + internal)
- [x] Rollback plan for each release (database down migrations + feature flags)
- [x] Change advisory board for major changes (security, compliance, architecture)

---

## Data Management Rules [FINAL - LOCKED]

### R16: Tenant Isolation
- [x] Tenant ID on every database record (schema-per-tenant model)
- [x] Row-level security enforced as defense-in-depth (even with schema isolation)
- [x] No cross-tenant queries allowed (application layer validation + database RLS)
- [x] Tenant data export on demand: JSON, Excel/CSV, PDF

### R17: Data Retention
- [x] Retention policies configurable per tenant (UI + API)
- [x] Automated data purging per policy (cron job + audit log of deletions)
- [x] Legal hold capability for litigation (suspend purging for specific tenant/data)
- [x] Data retention audit logs: Who requested purge, what was deleted, when

### R18: Data Quality
- [x] Data validation on input: Schema validation + business rule checks
- [x] Data consistency checks: Referential integrity + cross-field validation
- [x] Duplicate detection: Fuzzy matching on resource names + email uniqueness
- [x] Data quality metrics tracked: % tasks with evidence, % exercises with variance < 20%

### R19: Evidence Management (MVP: Photo + Text Only)
- [x] Evidence files stored in S3 object storage (not database) with tenant prefix
- [x] Evidence linked to task via immutable reference (task_id + evidence_id + SHA-256 hash)
- [x] Evidence virus-scanned before storage (Cloudmersive API + quarantine bucket)
- [x] Evidence access logged: Who downloaded, when, from which IP
- [x] MVP constraint: Photo uploads limited to 25MB, JPG/PNG/WebP only; Text evidence unlimited

### R20: PII Protection
- [x] PII identified and classified: Email, phone, address, employee ID
- [x] PII encrypted at rest: Application-layer encryption + database TDE
- [x] PII access restricted and logged: RBAC + ABAC + audit trail
- [x] PII export requires approval: Admin role + MFA + audit log entry

---

## UX/UI Rules [FINAL - LOCKED]

### R21: PWA Requirements (Online-Only for MVP)
- [x] App manifest for installation: Name, icons, theme color, start_url
- [x] Push notification support: Web Push API + fallback to SMS if browser unsupported
- [x] Responsive design: Mobile-first breakpoints (320px, 768px, 1024px, 1440px)
- [x] Offline warning: Show "You are offline" banner if connectivity lost (MVP is online-only)

### R22: Accessibility
- [x] WCAG 2.1 AA compliance: Color contrast, keyboard navigation, screen reader labels
- [x] Keyboard navigation support: Tab order, focus indicators, skip links
- [x] Screen reader compatibility: ARIA labels, live regions for dynamic updates
- [x] Color contrast requirements met: 4.5:1 for text, 3:1 for large text

### R23: Performance
- [x] Page load time < 3 seconds (p95) on 3G connection
- [x] API response time < 500ms (p95) for critical endpoints (task update, evidence upload)
- [x] Image optimization: Lazy loading, WebP conversion, responsive srcset
- [x] Caching strategy: CDN for static assets, Redis for API responses

### R24: Skeuomorphic Design (per DR Hub PDF)
- [x] Professional, attractive UI: Clean typography, consistent spacing, brand colors
- [x] Mobile-native feel: Touch targets > 44px, swipe gestures, haptic feedback
- [x] Intuitive task progression visualization: Gantt chart + stage badges + status colors
- [x] Clear status indicators: Not-Started (gray), In-Progress (blue), Completed (green), Failed (red)

---

## Documentation Rules [FINAL - LOCKED]

### R25: Code Documentation
- [x] All public functions documented: JSDoc with @param, @returns, @example
- [x] README for each module: Purpose, usage, dependencies, testing instructions
- [x] Architecture decision records (ADRs): Context, decision, consequences, status
- [x] API documentation: OpenAPI spec + Postman collection + example requests/responses

### R26: User Documentation (MVP Focus)
- [x] User guide for each role: Admin, User, Report, Moderator (PDF + in-app help)
- [x] Video tutorials for key workflows: Runbook import, task execution, evidence upload, PDF report generation
- [x] FAQ and troubleshooting guide: Common errors, offline warning tips, contact support
- [x] Release notes for each version: New features, bug fixes, breaking changes

### R27: Operational Documentation
- [x] Runbooks for common operations: Tenant onboarding, evidence quarantine, backup restore
- [x] Incident response playbook: Detection, escalation, communication, post-mortem
- [x] DR plan for the platform itself: RTO/RPO targets, failover procedure, testing schedule
- [x] Onboarding guide for new team members: Setup, access, coding standards, review process

---

## Compliance Rules [FINAL - LOCKED]

### R28: SOC 2 Alignment
- [x] Security controls documented: Access control, encryption, audit logging, incident response
- [x] Availability controls documented: Monitoring, backups, DR testing, change management
- [x] Confidentiality controls documented: PII protection, tenant isolation, data export
- [x] Processing integrity controls documented: Input validation, error handling, data quality

### R29: ISO 22301 Alignment (MVP Foundation)
- [x] Exercise documentation complete: Runbook import, task execution, evidence, PDF reports, drill log
- [x] Lessons learned capture: Basic drill log with summary, action items, owner
- [x] Annual review workflow foundation: Reminder notifications, sign-off, audit trail (full implementation in Phase 2)
- [x] Continuous improvement process documented: Variance analysis, corrective actions, versioning

### R30: GDPR/Privacy
- [x] Data subject access requests supported: Export all tenant data for a user
- [x] Right to erasure supported: Anonymize or delete user data per request
- [x] Data processing agreements available: DPA template for enterprise customers
- [x] Privacy policy published: Data collection, usage, retention, user rights

---

## Development Workflow Rules [FINAL - LOCKED]

### R31: Git Workflow
- [x] Feature branches for all changes: `feature/DR-123-runbook-import`
- [x] Pull requests with description: Context, changes, testing, screenshots
- [x] Code review required: Minimum 2 approvals, one from Security Agent for auth changes
- [x] Squash merge to main: Clean history, conventional commit messages

### R32: Commit Messages
- [x] Conventional commits format: `feat(dr-exercises): add runbook import preview UI`
- [x] Reference issue/ticket numbers: `fix(auth): resolve tenant_id validation #456`
- [x] Clear description of changes: What, why, how (not just "fix bug")
- [x] Breaking changes noted: `BREAKING CHANGE: remove deprecated task_status field`

### R33: Branch Protection
- [x] Main branch protected: No direct pushes, required status checks
- [x] Required status checks before merge: lint, test, security scan, coverage
- [x] Required approvals before merge: 2 reviewers, one from domain expert
- [x] No force pushes to main: History must be append-only for audit

### R34: Versioning
- [x] Semantic versioning: MAJOR.MINOR.PATCH (e.g., 1.0.0 for MVP launch)
- [x] Changelog maintained: Auto-generated from conventional commits + manual curation
- [x] Release tags in Git: `v1.0.0-mvp` with release notes
- [x] Deprecation policy documented: 6-month notice for breaking changes

---

## Quality Gates [FINAL - LOCKED]

### R35: Pre-Merge Checks
- [x] All tests pass: Unit, integration, E2E (CI pipeline)
- [x] Code coverage thresholds met: > 80% overall, > 90% for auth/audit modules
- [x] Security scan passes: Snyk/Dependabot with zero high/critical vulnerabilities
- [x] Linting passes: ESLint + Prettier with no errors

### R36: Pre-Release Checks
- [x] E2E tests pass: Critical user journeys (runbook import → exercise execution → PDF report export)
- [x] Load tests pass: Simulate 100 concurrent users per exercise, p95 latency < 2s
- [x] Security penetration test passes: Third-party report with zero critical findings
- [x] Documentation updated: User guides, API docs, runbooks reflect new features

### R37: Post-Release Checks
- [x] Monitoring dashboards reviewed: Error rates, latency, tenant isolation metrics
- [x] Error rates within threshold: < 1% 5xx errors, < 5% 4xx errors (excluding auth failures)
- [x] User feedback collected: In-app survey + support ticket analysis
- [x] Retrospective conducted: What went well, what to improve, action items tracked

---

## Violation Handling [FINAL - LOCKED]

| Severity | Action | Example | Owner |
|----------|--------|---------|-------|
| **Critical** | Block merge, immediate fix required, incident declared | Security vulnerability, tenant isolation breach, audit log tampering | Security Agent |
| **High** | Block merge, fix required before next release | Test coverage below threshold, missing audit logging for auth actions | Primary Agent |
| **Medium** | Allow merge, fix required within sprint | Documentation gaps, minor performance issues (< 3s page load) | DevOps Agent |
| **Low** | Allow merge, fix as capacity allows | Code style inconsistencies, minor UX improvements (color tweaks) | UX Agent |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-30 | Primary Agent | Initial draft based on source documents |
| 2.0 | 2026-03-30 | Primary Agent | All 68 clarification questions answered + Option A import decision |
| 3.0 | 2026-03-30 | Primary Agent | SINGLE-MODULE MVP: DR Exercise Engine only; Minimal Viable Foundation architecture; MVP launch 04/01/2026; Offline mode, File evidence, Excel/PPT reports deferred to Phase 2 |
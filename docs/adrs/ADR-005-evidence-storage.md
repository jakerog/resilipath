# ADR-005: Evidence Storage & Integrity (v3.0 - Single-Module MVP)

**Status:** Accepted  
**Date:** 2026-03-30  
**Deciders:** Primary Agent, Security Agent, DevOps Agent  
**Technical Context:** DR Exercise Evidence Collection - Single-Module MVP  
**Compliance Impact:** SOC 2 CC7.2, ISO 27001 A.12.2.1

---

## Context

From clarification questions:
- **Q17 Evidence Types:** Photo, file, text, webhook
- **Q17 Metadata Envelope:** Who, When (UTC), Where (Plan/Step ID), SHA-256 Hash
- **Q45 Virus Scanning:** Multi-layer validation (Magic Number, Virus Scan, Metadata Stripping)
- **Q56 Evidence Uploads:** Direct-to-S3 presigned URLs (not proxied)
- **Q10:B Evidence MVP Scope:** Photo (25MB max, JPG/PNG/WebP) + Text only; File + Webhook deferred to Phase 2
- **Q-Final-1:B Evidence Limits:** Max 25MB per photo, JPG/PNG/WebP, 500 evidence items per exercise

From DR Runbook Excel analysis:
- Evidence required for key tasks (e.g., "Pre-DR Evidence", "System Snapshots")
- Evidence used for financial validations and audit trail
- Evidence must be tamper-evident for SOC 2 compliance

---

## Decision

Use **Direct-to-S3 Presigned URLs + Async Virus Scan + Metadata Envelope** with **MVP Constraints**:

### Evidence Upload Pipeline (MVP Scope)

# Project Summary & Requirements (v3.0 - Single-Module MVP)

**Project:** Multi-Tenant BC/DR SaaS Platform  
**Version:** 3.0  
**Generated:** 2026-03-30  
**Last Updated:** 2026-03-30  
**MVP Scope:** Disaster Recovery Exercise Execution Engine ONLY  
**MVP Launch Target:** 04/01/2026  
**Status:** Requirements Confirmed - Ready for Phase 0 Development

---

## Executive Summary

Build a subscription-based, multi-tenant, modular SaaS platform for Business Continuity Management and Disaster Recovery Planning. **MVP focuses exclusively on the Disaster Recovery Exercise Execution Engine**, with architectural foundations for future modules (BCP Plans, Crisis Communications, etc.).

### Key Strategic Decisions
| Decision | Rationale |
|----------|-----------|
| Single-Module MVP | Accelerate time-to-market; sharpen value proposition; reduce development risk |
| Minimal Viable Foundation | Build placeholder tables + feature flags for future modules without UI complexity |
| MVP Launch: 04/01/2026 | Balanced approach: 4 weeks earlier than original, allows hardening time |
| Offline Mode Deferred | PWA offline support moved to Phase 2; MVP is online-only |
| Evidence: Photo + Text Only | Reduces MVP complexity; File + Webhook added in Phase 2 |
| Reporting: PDF Only | PDF export for audit compliance; Excel/PPT added in Phase 2 |

---

## Source Documents Analyzed

| Document | Type | Key Insights |
|----------|------|--------------|
| `GPI Business Continuity Plan v2.0 2025-12-10.docx` | Sample BCP Plan | ISO 22301-aligned structure; 11 sections; annual review requirement |
| `Prod Failover - Runbook CFIN DR.xlsx` | DR Exercise Runbook | 90 tasks, 8 stages, 15+ teams; timing tracking; variance analysis; evidence requirements |
| `Disaster Recovery Hub.pdf` | Platform Requirements | 7 core tables; RBAC; PWA/mobile UX; email engine; reporting dashboard |

---

## Platform Vision

### Core Value Proposition (MVP)
- Digitize manual DR exercise runbook processes (currently Excel-based)
- Provide real-time exercise execution tracking with evidence collection
- Enable multi-tenant isolation for corporate subsidiaries and customers
- Generate audit-ready reports (PDF) for SOC 2 / ISO 22301 compliance

### Target Users
- BC/DR Program Managers
- IT Operations Teams
- Facility/Plant Managers
- Crisis Management Teams
- Compliance & Audit Teams
- Executive Leadership (reporting consumers)

### Industry Adaptability
- Manufacturing (GPI model) - Primary focus
- Financial Services, Healthcare, Government, Technology - Supported via configuration

---

## Module Overview (MVP Scope)

### Module 1: DR Exercise Execution Engine (MVP ONLY)
**Priority:** MVP-CRITICAL  
**Timeline:** Phase 1 (Weeks 5-12)  
**Launch Target:** 04/01/2026

| Feature | Specification | Source | MVP Status |
|---------|--------------|--------|------------|
| Runbook Import | Downloadable Template (.xlsx) → Validation → JSON → Preview & Map UI → Save tenant-specific column mappings | DR Hub PDF + Q15 | ✅ MVP |
| Task Orchestration | Sequential/Parallel workflows; Complex DAG with circular dependency prevention | DR Runbook Excel + Q16 | ✅ MVP |
| Stage Management | 8 stages: Pre-Failover, Failover, Post-Failover, Failover-Rollback, Pre-Failback, Failback, Post-Failback, Failback-Rollback | DR Hub PDF | ✅ MVP |
| Resource Check-in | SMS primary + Manual dashboard + Calendar integration (pre-crisis only) | DR Hub PDF + Q21 | ✅ MVP |
| Evidence Collection | Photo (25MB max, JPG/PNG/WebP) + Text only; Metadata Envelope (Who/When/Where/SHA-256) | DR Runbook Excel + Q10:B, Q-Final-1:B | ✅ MVP |
| Timing Tracking | Estimated vs. Actual duration; Variance calculation; Tunable alert thresholds | DR Runbook Excel + Q19 | ✅ MVP |
| Real-time Dashboard | Live exercise status; Gantt visualization via WebSocket sync | DR Hub PDF + Q22 | ✅ MVP |
| Role-Based Access | Admin, User, Report, Moderator permissions; Field-level ABAC for data permissions | DR Hub PDF + Q32 | ✅ MVP |
| Email Engine | Lists, templates with variables, scheduling, delivery tracking (Sent/Delivered) | DR Hub PDF + Q35-Q39 | ✅ MVP |
| Report Dashboard | 4 required reports; PDF export only | DR Hub PDF + Q-Final-2:B | ✅ MVP |
| Drill Log | Basic lessons learned capture; attach to exercise; audit trail | GPI BCP Plan §8 + Q7:A | ✅ MVP |
| Go/No-Go Workflow | Simple toggle: User marks "Go" or "No-Go" with optional note; audit log | DR Runbook Excel + Q9:B | ✅ MVP |
| Sample Data | Pre-seeded demo tenant with full sample exercise (90 tasks, 8 stages) | DR Hub PDF + Q-Final-3:A | ✅ MVP |

### Future Modules (Deferred - Foundation Built in Phase 0)

| Module | Priority | MVP Status | Foundation in Phase 0 |
|--------|----------|------------|----------------------|
| Module 2: BCP Plan Generation | Phase-2 | ❌ Deferred | Placeholder `bcp_plan` table; feature flag `bcp_module: false` |
| Module 3: Crisis Communications Hub | Phase-3 | ❌ Deferred | Placeholder `communication` table; foreign key to `exercise` |
| Module 4: Vendor Risk & Continuity | Phase-4 | ❌ Deferred | Placeholder `vendor_risk` table; schema-per-tenant isolation |
| Module 5: Regulatory Compliance Mapper | Phase-4 | ❌ Deferred | Audit log fields: `module_name`, `feature_flag`, `tenant_tier` |
| Module 6: Training & Certification | Post-Phase 4 | ❌ Deferred | N/A |
| Module 7: Executive Dashboard | Phase-3 | ❌ Deferred | Report API contract defined; not implemented |

---

## Database Schema (MVP + Foundation)

### Core Tables (MVP - Active)

```sql
-- Resource Table
CREATE TABLE resource (
    id UUID PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    telephone TEXT,
    photo_url TEXT,
    team_id UUID REFERENCES team(id),
    vendor_id UUID REFERENCES vendor(id),
    exercise_id UUID REFERENCES exercise(id),
    tenant_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Table (Core Execution Entity)
CREATE TABLE task (
    id UUID PRIMARY KEY,
    task_id TEXT NOT NULL,
    stage_id UUID REFERENCES stage(id),
    workflow TEXT CHECK (workflow IN ('Sequential', 'Parallel')),
    resource_allocation TEXT CHECK (resource_allocation IN ('Single', 'Multiple')),
    resource_ids UUID[] REFERENCES resource(id),
    status TEXT CHECK (status IN ('Not-Started', 'In-Progress', 'Completed')),
    start_date DATE,
    start_time TIME,
    end_date DATE,
    end_time TIME,
    estimated_duration INTERVAL,
    actual_duration INTERVAL GENERATED ALWAYS AS (
        CASE WHEN end_time IS NOT NULL AND start_time IS NOT NULL 
        THEN (end_time - start_time) ELSE NULL END
    ) STORED,
    variance_duration INTERVAL GENERATED ALWAYS AS (
        CASE WHEN actual_duration IS NOT NULL AND estimated_duration IS NOT NULL 
        THEN (actual_duration - estimated_duration) ELSE NULL END
    ) STORED,
    team_id UUID REFERENCES team(id),
    evidence_jsonb JSONB, -- Metadata Envelope: {who, when_utc, where_plan_id, sha256_hash}
    exercise_id UUID REFERENCES exercise(id),
    predecessor_task_ids UUID[], -- For DAG dependencies
    is_decision_point BOOLEAN DEFAULT FALSE, -- For Go/No-Go tasks
    decision_value TEXT CHECK (decision_value IN ('Go', 'No-Go')), -- Simple toggle
    decision_note TEXT,
    drill_log_jsonb JSONB, -- Basic lessons learned: {summary, action_items, owner}
    notes TEXT,
    tenant_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evidence Metadata Envelope Structure (JSONB)
{
  "who": "user_id_or_system_service",
  "when_utc": "2026-03-30T14:35:22Z",
  "where": {
    "plan_id": "exercise_123",
    "step_id": "task_456"
  },
  "file_hash": "sha256:abc123...",
  "file_type": "image/png",
  "file_size_bytes": 102400,
  "virus_scan_status": "clean",
  "uploaded_at": "2026-03-30T14:35:22Z"
}
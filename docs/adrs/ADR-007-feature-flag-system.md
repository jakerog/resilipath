# ADR-007: Feature Flag System Implementation (NEW - F1:A)

**Status:** Accepted  
**Date:** 2026-03-30  
**Deciders:** Primary Agent, DevOps Agent  
**Technical Context:** Minimal Viable Foundation for Future Modules  
**Compliance Impact:** SOC 2 CC3.2 (Change Management)

---

## Context

From clarification answer F1:A:
> "Yes: Basic flag system (e.g., `features: { bcp_module: false }`) to toggle module visibility per tenant"

The platform requires a simple feature flag system in Phase 0 to enable "build foundation, hide UI" for future modules while maintaining a single-module MVP scope.

### Requirements
- Toggle module visibility per tenant (e.g., `bcp_module: false` for MVP)
- Toggle sub-feature visibility (e.g., `evidence_webhook: false` for MVP)
- Audit trail of feature flag changes
- Simple implementation (no complex flag management library for MVP)

---

## Decision

Implement **Basic JSONB Feature Flag System** with the following architecture:

### Database Schema

```sql
-- Tenant configuration table with feature flags
CREATE TABLE tenant_config (
    tenant_id TEXT PRIMARY KEY,
    features JSONB DEFAULT '{
      "bcp_module": false,
      "evidence_webhook": false,
      "crisis_comms": false,
      "offline_mode": false,
      "excel_export": false,
      "ppt_export": false
    }',
    tier TEXT CHECK (tier IN ('standard', 'enterprise', 'elite')) DEFAULT 'standard',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES resource(id)
);

-- Audit log for feature flag changes (extends existing audit_log table)
ALTER TABLE audit_log ADD COLUMN feature_flag_context JSONB;
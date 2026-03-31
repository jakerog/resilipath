# ADR-007: Feature Flag System Implementation (v4.0 - Modular GCP/Firebase MVP)

**Status:** Accepted  
**Date:** 2026-03-30  
**Deciders:** Primary Agent, DevOps Agent  
**Technical Context:** Minimal Viable Foundation for Future Modules  
**Compliance Impact:** SOC 2 CC3.2 (Change Management)

---

## Context

The platform requires a simple feature flag system to enable "build foundation, hide UI" for future modules while maintaining a single-module MVP scope. Support for:
- Toggle module visibility per tenant (e.g., `bcp_module: false` for MVP)
- Toggle sub-feature visibility (e.g., `evidence_webhook: false` for MVP)
- Audit trail of feature flag changes
- **Free-Tier Priority**: Optimize for configuration management.

Previous model used a Firestore JSONB column. Shifting to **Firebase Remote Config or Firestore-based Configuration**.

---

## Decision

Implement **Firebase Remote Config with Tenant-Specific Parameter Overrides** and **Firestore-based Configuration fallback**:

### Architecture (MVP Scope)
- **Primary Flag Storage**: Firebase Remote Config for global flags (e.g., `bcp_module_enabled: false` globally).
- **Tenant-Specific Overrides**: Firestore `tenants` collection containing a `features` field for tenant-level overrides (e.g., `enterprise_tenant_1: { bcp_module: true }`).
- **Access Control**: Feature flags are included in the Firebase Auth custom claims (for server-side access control) and fetched client-side via the Remote Config SDK.
- **Audit Logging**: All changes to feature flags (Remote Config and Firestore) are logged to the `audit_log` collection with user attribution.

### Benefits
- **Real-time Configuration**: Remote Config allows toggling flags without redeploying code.
- **Cost**: Firebase Remote Config and Firestore have generous free tiers.
- **Developer Experience**: Native SDKs for client and server.

### Verification
- [ ] Feature flag toggles hide/show placeholder table access in the UI and API.
- [ ] Audit log includes `module_name`, `feature_flag`, and `tenant_id` for all changes.
- [ ] Remote Config update propagation latency verification.

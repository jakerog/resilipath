# ADR-001: Multi-Tenant Isolation Strategy (v3.0 - Single-Module MVP)

**Status:** Accepted  
**Date:** 2026-03-30  
**Deciders:** Primary Agent, Security Agent, Data Agent  
**Technical Context:** Multi-Tenant BC/DR SaaS Platform - Single-Module MVP  
**Compliance Impact:** SOC 2 CC6.1, ISO 27001 A.9.4.1, GDPR Art. 28

---

## Context

The platform requires strict tenant isolation for SOC 2 Type II and ISO 27001 compliance while enabling:
- Shared reference data (ISO standards, threat catalogs, regulatory templates)
- Cross-tenant reporting for enterprise subsidiaries (Parent → Child aggregation)
- Tenant-specific encryption keys (Phase 2 BYOK module)
- Data residency requirements (single region at launch + Data Privacy Vault pattern)
- **Minimal Viable Foundation**: Placeholder tables for future modules (BCP Plans, Crisis Communications) hidden via feature flags

From clarification questions:
- **Q9 Isolation Model:** Schema-per-tenant
- **Q10 Reference Data:** Tenants share via "public" schema
- **Q11 Cross-Tenant Reporting:** Parent entities can view aggregated metrics across Child tenants
- **Q12 Retention Policies:** Configurable per tenant
- **Q13 Data Export:** JSON, Excel/CSV, PDF on demand
- **Q14 Encryption:** Phase 1: Provider-managed keys + RLS; Phase 2: BYOK module

---

## Decision

Adopt **Schema-per-Tenant + Shared Reference Schema** isolation model with **Placeholder Tables for Future Modules**:

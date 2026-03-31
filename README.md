# ResiliPath - Modular Resilience SaaS (v4.0 - Modular GCP/Firebase MVP)

**Project Status:** Architecture Refactored for GCP/Firebase/Vercel
**Version:** 4.0 (Modular GCP/Firebase MVP)
**Last Updated:** 2026-03-31 15:00:00 UTC

---

## Executive Summary

ResiliPath is a subscription-based, isolated, modular SaaS platform for Business Resilience and Continuity Planning. The current focus is the **Phase 1 MVP: Resilience Exercise Execution Engine**, a high-performance, real-time platform designed to replace manual, Excel-based disaster recovery runbooks.

The architecture has been refactored for extreme modularity and strict adherence to Single-Concern Principles, leveraging a serverless **GCP/Firebase and Vercel** stack with a priority on free-tier scalability.

---

## Documentation Navigation

The documentation suite is organized for modularity and compliance (SOC 2 / ISO 27001).

### Core Architecture & Strategy
- [MANDATES.md](docs/mandates.md): 13 non-negotiable architectural and compliance constraints.
- [RULES.md](docs/rules.md): 40+ development and operational guardrails.
- [ROADMAP.md](docs/roadmap.md): 5-phase delivery plan with a single-module MVP focus.
- [Architecture Decision Records (ADRs)](docs/adrs/): Justification for critical technical decisions.

### Phase 1: Resilience Exercise Execution Engine
The Phase 1 roadmap is deconstructed into 9 discrete, domain-specific modular sub-phases:
- [Phase 1 Summary Entry Point](docs/phases/phase-1/summary.md)
- [1.1 Infrastructure & Deployment](docs/phases/phase-1/1.1-infrastructure.md)
- [1.2 Identity & Access Management](docs/phases/phase-1/1.2-identity.md)
- [1.3 Data Layer & Persistence](docs/phases/phase-1/1.3-datalayer.md)
- [1.4 Audit Evidence Management](docs/phases/phase-1/1.4-evidence.md)
- [1.5 Core Logic & Orchestration](docs/phases/phase-1/1.5-orchestration.md)
- [1.6 Resilience Communications](docs/phases/phase-1/1.6-communications.md)
- [1.7 Frontend Foundation](docs/phases/phase-1/1.7-uifoundation.md)
- [1.8 Execution Dashboard & Real-time Sync](docs/phases/phase-1/1.8-dashboard.md)
- [1.9 Compliance Reporting](docs/phases/phase-1/1.9-reporting.md)

---

## Project Identity & Terminology

ResiliPath adheres to a modern Resilience-first design philosophy:
- **Resilience**: Replaces the legacy "BC/DR" phrasing.
- **Isolated**: Replaces the legacy "Multi-Tenant" phrasing.
- **Resilience Exercise**: Replaces the legacy "DR Exercise" phrasing.

---

## Technical Stack (MVP)

- **Frontend**: Next.js (Vercel) - Online-only PWA.
- **Backend**: Firebase / Google Cloud Platform (Serverless).
- **Persistence**: Cloud Firestore (isolated isolation via Security Rules).
- **Auth**: Firebase Authentication with Custom Claims for `tenantId`.
- **Evidence**: Firebase Storage with Metadata Envelopes and Immutability.
- **Orchestration**: Custom Node.js DAG engine in Cloud Functions.

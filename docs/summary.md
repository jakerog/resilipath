# Project Summary & Requirements (v4.0 - Modular GCP/Firebase MVP)

**Project:** ResiliPath
**Version:** 4.0 (Modular GCP/Firebase MVP)
**Generated:** 2026-03-31
**Last Updated:** 2026-03-31
**MVP Scope:** Resilience Exercise Execution Engine ONLY
**MVP Launch Target:** 04/01/2026  
**Status:** Refactored for Modular Design & GCP/Firebase/Vercel Stack

---

## Executive Summary

Build a subscription-based, isolated, modular SaaS platform for Business Resilience and Continuity Planning. **MVP focuses exclusively on the Resilience Exercise Execution Engine**, refactored into a **modular, serverless architecture using GCP, Firebase, and Vercel**. This phase prioritizes free-tier scalability, strict single-concern boundaries, and SOC 2 / ISO 27001 compliance alignment.

### Key Strategic Decisions
| Decision | Rationale |
|----------|-----------|
| **Single-Module MVP** | Accelerate time-to-market; sharpen value proposition; reduce development risk |
| **Modular Sub-Phases** | Broken down into 9 discrete logical domains to ensure architectural integrity |
| **GCP/Firebase Architecture** | Cost-effective, serverless scaling with a generous free tier for low operational overhead |
| **Vercel Frontend** | Next.js on Vercel for optimal frontend performance and developer experience |
| **Free-Tier Priority** | Optimize for low initial costs while maintaining a scalable foundation |

---

## Source Documents Analyzed

| Document | Type | Key Insights |
|----------|------|--------------|
| `GPI Business Continuity Plan v2.0 2025-12-10.docx` | Sample BCP Plan | ISO 22301-aligned structure; 11 sections; annual review requirement |
| `Prod Failover - Runbook CFIN DR.xlsx` | Resilience Exercise Runbook | 90 tasks, 8 stages, 15+ teams; timing tracking; variance analysis; evidence requirements |
| `Resilience Hub.pdf` | Platform Requirements | 7 core tables; RBAC; PWA/mobile UX; notification engine; reporting dashboard |

---

## Platform Vision (Modular Focus)

### Core Value Proposition (MVP)
- Digitize manual Resilience Exercise runbook processes (currently Excel-based).
- Provide real-time exercise execution tracking with sub-100ms synchronization via Firestore.
- Enable tenant isolation via Firebase Auth Custom Claims and Firestore Security Rules.
- Generate audit-ready reports (PDF) via serverless Cloud Functions and Puppeteer.

---

## Module Overview (MVP Scope)

### Module 1: Resilience Exercise Execution Engine (MVP ONLY)
**Priority:** MVP-CRITICAL  
**Timeline:** Phase 1 (Weeks 5-8)
**Launch Target:** 04/01/2026

| Feature | Modular Specification | Architecture Component |
|---------|-------------------|----------------------|
| **Runbook Import** | Preview & Map UI (Option A) | [Next.js (Vercel) + Cloud Functions](phases/phase-1/1.7-uifoundation.md) |
| **Task Orchestration** | Custom DAG Engine with circular dependency validation | [Cloud Functions (Node.js) + Firestore](phases/phase-1/1.5-orchestration.md) |
| **Stage Management** | 8 stages: Pre-Failover, Failover, Post-Failover, etc. | [Firestore schema + Security Rules](phases/phase-1/1.3-datalayer.md) |
| **Resource Check-in** | SMS primary + Manual dashboard | [Firebase Extensions (Twilio) + Cloud Functions](phases/phase-1/1.6-communications.md) |
| **Evidence Collection** | Photo (25MB max) + Text only; Metadata Envelope | [Firebase Storage + Cloud Functions](phases/phase-1/1.4-evidence.md) |
| **Timing Tracking** | Estimated vs. Actual duration; Variance calculation | [Cloud Functions (server-side UTC)](phases/phase-1/1.5-orchestration.md) |
| **Real-time Dashboard** | Live exercise status; Gantt visualization | [Next.js (Vercel) + Firestore Real-time SDK](phases/phase-1/1.8-dashboard.md) |
| **Role-Based Access** | Admin, User, Report, Moderator roles; SSO/SAML deferred | [Firebase Auth Custom Claims + Security Rules](phases/phase-1/1.2-identity.md) |
| **Communication Engine** | Lists, templates, scheduling, delivery tracking | [Firebase Extensions (Trigger Email/SMS)](phases/phase-1/1.6-communications.md) |
| **Report Dashboard** | 4 required reports; PDF export only | [Cloud Functions + Puppeteer](phases/phase-1/1.9-reporting.md) |

---

## Database Architecture (Firestore)

### Core Collections (MVP + Foundation)

```typescript
// Tenants Collection
interface Tenant {
  id: string; // tenantId
  name: string;
  config: {
    branding: BrandingInfo;
    features: {
      bcp_module: boolean;
      crisis_comms: boolean;
      // ... flags
    };
  };
  tier: 'standard' | 'enterprise' | 'elite';
}

// Exercises Collection
interface Exercise {
  id: string;
  tenantId: string; // Used in Security Rules
  name: string;
  stageIds: string[];
  status: 'Draft' | 'Active' | 'Completed';
  // ... metrics
}

// Tasks Collection (Core Execution Entity)
interface Task {
  id: string;
  tenantId: string; // Used in Security Rules
  exerciseId: string;
  stageId: string;
  predecessorIds: string[]; // DAG relationships
  status: 'Not-Started' | 'In-Progress' | 'Completed';
  timing: {
    estimatedDuration: number;
    actualDuration: number;
    varianceDuration: number;
  };
  evidence: {
    who: string;
    whenUtc: string;
    sha256Hash: string;
    photoUrl: string;
    text: string;
    metadataEnvelope: MetadataEnvelope;
  };
  // ... data
}
```

---

## Success Metrics (Modular Architecture)

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Free-Tier Utilization** | > 90% | Monthly billing console review |
| **Sync Latency** | < 100ms | Firestore SDK performance monitoring |
| **Tenant Isolation** | 100% | Security Rules unit tests + Pentest |
| **PDF Gen Time** | < 15s | Cloud Function execution logs |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 4.0 | 2026-03-31 | Primary Agent | Refactored for Modular Design & GCP/Firebase/Vercel Architecture. |

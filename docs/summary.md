# Project Summary & Requirements (v4.0 - Modular GCP/Firebase MVP)

**Project:** Multi-Tenant BC/DR SaaS Platform  
**Version:** 4.0 (Modular GCP/Firebase MVP)
**Generated:** 2026-03-31
**Last Updated:** 2026-03-31
**MVP Scope:** Disaster Recovery Exercise Execution Engine ONLY  
**MVP Launch Target:** 04/01/2026  
**Status:** Refactored for Modular Design & GCP/Firebase/Vercel Stack

---

## Executive Summary

Build a subscription-based, multi-tenant, modular SaaS platform for Business Continuity Management and Disaster Recovery Planning. **MVP focuses exclusively on the Disaster Recovery Exercise Execution Engine**, refactored into a **modular, serverless architecture using GCP, Firebase, and Vercel**. This phase prioritizes free-tier scalability, strict single-concern boundaries, and SOC 2 / ISO 27001 compliance alignment.

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
| `Prod Failover - Runbook CFIN DR.xlsx` | DR Exercise Runbook | 90 tasks, 8 stages, 15+ teams; timing tracking; variance analysis; evidence requirements |
| `Disaster Recovery Hub.pdf` | Platform Requirements | 7 core tables; RBAC; PWA/mobile UX; notification engine; reporting dashboard |

---

## Platform Vision (Modular Focus)

### Core Value Proposition (MVP)
- Digitize manual DR exercise runbook processes (currently Excel-based).
- Provide real-time exercise execution tracking with sub-100ms synchronization via Firestore.
- Enable multi-tenant isolation via Firebase Auth Custom Claims and Firestore Security Rules.
- Generate audit-ready reports (PDF) via serverless Cloud Functions and Puppeteer.

---

## Module Overview (MVP Scope)

### Module 1: DR Exercise Execution Engine (MVP ONLY)
**Priority:** MVP-CRITICAL  
**Timeline:** Phase 1 (Weeks 5-8)
**Launch Target:** 04/01/2026

| Feature | Modular Specification | Architecture Component |
|---------|-------------------|----------------------|
| **Runbook Import** | Preview & Map UI (Option A) | Next.js (Vercel) + Cloud Functions |
| **Task Orchestration** | Custom DAG Engine with circular dependency validation | Cloud Functions (Node.js) + Firestore |
| **Stage Management** | 8 stages: Pre-Failover, Failover, Post-Failover, etc. | Firestore schema + Security Rules |
| **Resource Check-in** | SMS primary + Manual dashboard | Firebase Extensions (Twilio) + Cloud Functions |
| **Evidence Collection** | Photo (25MB max) + Text only; Metadata Envelope | Firebase Storage + Cloud Functions |
| **Timing Tracking** | Estimated vs. Actual duration; Variance calculation | Cloud Functions (server-side UTC) |
| **Real-time Dashboard** | Live exercise status; Gantt visualization | Next.js (Vercel) + Firestore Real-time SDK |
| **Role-Based Access** | Admin, User, Report, Moderator roles | Firebase Auth Custom Claims + Security Rules |
| **Communication Engine** | Lists, templates, scheduling, delivery tracking | Firebase Extensions (Trigger Email/SMS) |
| **Report Dashboard** | 4 required reports; PDF export only | Cloud Functions + Puppeteer |

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

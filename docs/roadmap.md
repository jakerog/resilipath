# ROADMAP.md - Phased Delivery Plan (v4.0 - Modular GCP/Firebase MVP)

**Project:** Multi-Tenant BC/DR SaaS Platform  
**Version:** 4.0 (Modular GCP/Firebase MVP)
**Generated:** 2026-03-31
**Last Updated:** 2026-03-31
**MVP Scope:** Disaster Recovery Exercise Execution Engine ONLY  
**MVP Launch Target:** 04/01/2026

---

## Executive Summary

This roadmap outlines the phased delivery of the multi-tenant BC/DR SaaS platform with a **single-module MVP focus** and a **modular serverless architecture** using GCP, Firebase, and Vercel. All future modules are deferred but supported via "Minimal Viable Foundation" (placeholder collections + feature flags).

### Key Milestones

| Milestone | Date | Deliverable |
|-----------|------|-------------|
| Phase 0 Complete | 2026-03-28 | Foundation architecture ready (GCP, Firebase Auth, CI/CD, Firestore schema) |
| Phase 1 MVP Launch | 2026-04-01 | DR Exercise Execution Engine (Modular GCP/Firebase architecture, Vercel frontend) |
| Phase 2 Alpha | 2026-05-27 | BCP Plan Generation + Multi-format exports + Offline mode (PWA Service Workers) |
| Phase 3 Hardening | 2026-07-22 | Crisis Communications (Multi-channel) + Performance optimization + SSO/SAML |
| Phase 4 Scale | 2026-10-01 | Vendor Risk + Compliance Mapper + ML analytics + Partner API |

---

## Phase Overview (Modular MVP Focus)

| Phase | Timeline | Duration | Focus | Key Deliverables | Success Metrics |
|-------|----------|----------|-------|------------------|-----------------|
| **Phase 0** | Weeks 1-4 | 4 weeks | Foundation | **Firebase Project Provisioning**, Auth Custom Claims, CI/CD for Vercel/Firebase, Firestore Base Schema | Tenant isolation verified (Security Rules), Auth functional, CI/CD operational |
| **Phase 1** | Weeks 5-8 | 4 weeks | Module 1 MVP | **Modular DR Exercise Engine**, PDF reports (Cloud Functions), Firebase Storage evidence, SMS check-in | Time-to-Exercise <4hrs, Task Completion >95%, Sync Latency <100ms |
| **Phase 2** | Weeks 9-16 | 8 weeks | Module 2 Alpha | BCP plan generation, Excel/Word exports, Offline mode (IndexedDB + Service Workers) | BCP Gen <2hrs, Template Accuracy >95%, Offline Sync Success >99% |
| **Phase 3** | Weeks 17-24 | 8 weeks | Hardening | Crisis communications, performance optimization, advanced third-party integrations | Notification Delivery >99%, Page Load <2s (p95), API <300ms |
| **Phase 4** | Weeks 25-36 | 12 weeks | Scale | Vendor risk, compliance mapper, ML analytics, partner API, internationalization | 100+ Tenants, $1M+ ARR, NPS >50 |

---

## Phase 0: Foundation (Weeks 1-4)

### Objectives
- [x] Provision Firebase Project and configure environment aliases (Dev/Staging/Prod).
- [x] Implement tenant isolation via Firebase Auth Custom Claims and Firestore Security Rules.
- [x] Set up CI/CD pipeline using GitHub Actions for Vercel (Frontend) and Firebase (Backend).
- [x] Create base Firestore schema for tenants, exercises, and tasks (including placeholders).
- [x] Implement feature flag system using Firebase Remote Config + Firestore overrides.

---

## Phase 1: Module 1 MVP - DR Exercise Execution Engine (Weeks 5-8)

### Objectives
- [x] **Sub-Phase 1.1: Environment & Tooling** (Vercel + Firebase Setup)
- [x] **Sub-Phase 1.2: Identity & Access Management** (Firebase Auth + Custom Claims)
- [x] **Sub-Phase 1.3: Data Layer & Multi-Tenancy** (Firestore + Security Rules)
- [x] **Sub-Phase 1.4: Evidence Management** (Firebase Storage + Cloud Functions)
- [x] **Sub-Phase 1.5: Core Business Logic** (DAG Engine + Cloud Functions)
- [x] **Sub-Phase 1.6: Automated Communications** (Firebase Extensions for Email/SMS)
- [x] **Sub-Phase 1.7: UI/UX Foundation** (Next.js on Vercel)
- [x] **Sub-Phase 1.8: Task Execution UI & Real-time Sync** (Firestore Real-time SDK)
- [x] **Sub-Phase 1.9: Compliance Reporting** (PDF Generation via Puppeteer)

### Success Metrics (Modular Architecture)

| Metric | Target | Baseline (Manual Excel) | Measurement Method |
|--------|--------|------------------------|-------------------|
| **Sync Latency** | < 100ms | N/A | Firestore SDK performance monitoring |
| **Free-Tier Usage** | > 90% | N/A | Billing console review |
| **Time-to-Exercise** | < 4 hours | ~12 hours | Onboarding to first execution start |
| **Task Completion** | > 95% | ~80% | Tasks completed / Tasks assigned |

### Resource Requirements (Modular Focus)

| Role | FTE | Weeks | Total Hours | Key Responsibilities |
|------|-----|-------|-------------|---------------------|
| Primary Agent | 1.0 | 4 | 160 | DAG logic, DAG validation, ADRs, modular system design |
| UX Agent | 1.0 | 4 | 160 | Next.js (Vercel), Tailwind CSS, Real-time UI, PWA components |
| Data Agent | 0.5 | 4 | 80 | Firestore schema, Security Rules, aggregation functions |
| Security Agent | 0.3 | 4 | 48 | Firebase Auth, Custom Claims, Virus scan, audit logging |
| DevOps Agent | 0.5 | 4 | 80 | GitHub Actions, Vercel config, Firebase Remote Config |
| Integration Agent | 0.5 | 2 | 40 | Firebase Extensions (Email/SMS), real-time presence |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 4.0 | 2026-03-31 | Primary Agent | Refactored for modular GCP/Firebase/Vercel architecture. |

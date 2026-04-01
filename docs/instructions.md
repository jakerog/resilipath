# Verification Instructions for ResiliPath Refactor (v4.0)

**Project:** ResiliPath
**Version:** 4.0 (Modular GCP/Firebase MVP)
**Last Updated:** 2026-03-31

---

## Overview

This document provides a non-developer-friendly guide to verify that the **ResiliPath** documentation has been correctly refactored according to **Modular Design** and **Single-Concern Principles**.

---

## Verification Steps

### Step 1: Verify Project Branding & Terminology
ResiliPath has moved away from legacy "BC/DR" and "Multi-Tenant" phrasing.
1. Open any core document (e.g., [README.md](../README.md), [mandates.md](mandates.md), [summary.md](summary.md)).
2. Confirm the project is consistently referred to as **ResiliPath**.
3. Confirm that "BC/DR" has been replaced with **Resilience**.
4. Confirm that "Multi-Tenant" has been replaced with **Isolated**.
5. Confirm that "DR Exercise" has been replaced with **Resilience Exercise**.

### Step 2: Verify Modular Phase 1 Structure
Phase 1 has been deconstructed from a single list into a directory of 9 discrete, independent modules.
1. Navigate to the `docs/phases/phase-1/` directory.
2. Confirm the presence of 10 files (9 sub-phases + 1 summary).
3. Open [summary.md](phases/phase-1/summary.md) and verify it acts as a central hub with links to all 9 sub-phases.

### Step 3: Verify Sub-Phase Atomicity
Each sub-phase must represent a single concern with a granular task list.
1. Open any sub-phase file (e.g., [1.2-identity.md](phases/phase-1/1.2-identity.md) or [1.3-datalayer.md](phases/phase-1/1.3-datalayer.md)).
2. Confirm the structure: **Sub-Phase Title**, **Primary Concern**, **Dependencies**, and **Atomic Task List**.
3. Verify that each task is a single, actionable unit of work (e.g., "Enable specific API" instead of "Set up the whole backend").

### Step 4: Verify Architectural Pivot (GCP/Firebase/Vercel)
The technology stack has transitioned to a modern, serverless foundation.
1. Open [ROADMAP.md](roadmap.md) or any [Architecture Decision Record (ADR)](adrs/).
2. Confirm that **GCP/Firebase** is listed as the primary backend and **Vercel** as the primary frontend.
3. Confirm that **Firestore** is the database and **Firebase Auth** is the identity provider.

### Step 5: Verify Free-Tier Priority
Resource optimization is a core requirement for the ResiliPath foundation.
1. Open any sub-phase tasklist in `docs/phases/phase-1/`.
2. Confirm that each sub-phase contains specific tasks for **Free-Tier Priority** optimization (e.g., billing alerts, batching, static generation).

### Step 6: Verify Requirement Synchronization
All mandates and rules must align with the new modular architecture.
1. Open [mandates.md](mandates.md) and [rules.md](rules.md).
2. Confirm that requirements for "Tenant Isolation" and "Evidence Collection" are explicitly defined for the **Firebase/GCP** stack.

---

## Conclusion
If all the above steps are confirmed, the refactor is successful and the documentation is ready for implementation kickoff.

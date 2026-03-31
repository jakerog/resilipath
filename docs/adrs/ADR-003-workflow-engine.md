# ADR-003: Workflow Engine Technology (v4.0 - Modular GCP/Firebase MVP)

**Status:** Accepted  
**Date:** 2026-03-31
**Deciders:** Primary Agent, Data Agent  
**Technical Context:** Resilience Exercise Task Orchestration - Single-Module MVP
**Compliance Impact:** SOC 2 CC7.1 (Change Management)

---

## Context

The platform requires a robust task orchestration engine for Resilience exercises with support for:
- Complex DAG (many-to-many relationship table)
- Sequential and Parallel workflows within stages
- Circular dependency prevention
- Go/No-Go decision points
- Real-time Gantt visualization with sub-100ms latency
- **Free-Tier Priority**: Optimize for serverless execution.

Previous model used Firestore many-to-many relationships. Shifting to **Firestore + Cloud Functions**.

---

## Decision

Build **Custom DAG Engine using Firestore + Cloud Functions** with the following characteristics for **Single-Module MVP**:

### Architecture (MVP Scope)
- **Data Store**: Firestore `tasks` collection with `predecessorIds` array (DAG representation).
- **Execution Logic**: Cloud Functions (Node.js) triggered by Firestore updates (`onUpdate` on `tasks` collection).
- **Circular Dependency Prevention**: Validation logic on task save (recursive check within Cloud Function) to prevent circularity.
- **Real-time Sync**: Firestore SDK native real-time listeners for the Gantt visualization (eliminating the need for custom WebSocket management).
- **Go/No-Go Workflow**: A simple `isDecisionPoint` field and `decisionValue` (Go/No-Go) toggle, enforced by Security Rules and Cloud Functions.

### Benefits
- **Sub-100ms Latency**: Native Firestore sync is optimized for low-latency updates.
- **Serverless Scaling**: Cloud Functions automatically scale with exercise load.
- **Cost**: Generous free tier for Cloud Functions and Firestore.

### Verification
- [ ] Circular dependency validation tests with mock DAGs.
- [ ] Real-time Gantt update latency verification under simulated load.
- [ ] Go/No-Go decision point workflow tested with audit log capture.

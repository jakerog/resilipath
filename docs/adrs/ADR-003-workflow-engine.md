
**💾 Save Instructions:** Copy content above → Create file `docs/adrs/ADR-002-auth-provider.md` → Save

---

## 📄 FILE 7: `docs/adrs/ADR-003-workflow-engine.md` (v3.0 - Single-Module MVP)

```markdown
# ADR-003: Workflow Engine Technology (v3.0 - Single-Module MVP)

**Status:** Accepted  
**Date:** 2026-03-30  
**Deciders:** Primary Agent, Data Agent  
**Technical Context:** DR Exercise Task Orchestration - Single-Module MVP  
**Compliance Impact:** SOC 2 CC7.1 (Change Management)

---

## Context

From clarification questions:
- **Q16 Task Dependencies:** Complex DAG (many-to-many relationship table) with circular dependency prevention
- **Q18 Execution Model:** Manual human-driven only (MVP); Outbound webhooks prepared for Phase 2 automation
- **Q22 Parallel Task Tracking:** Real-time Gantt visualization with WebSocket sync
- **Q23 Task Re-assignment:** Mid-exercise re-assignment with conflict resolution
- **Q9:B Go/No-Go Workflow:** Simple toggle: User marks "Go" or "No-Go" with optional note (no signature)

From DR Runbook Excel analysis:
- 90 tasks with complex predecessor relationships (e.g., Task 17 depends on Tasks 1-16)
- Sequential and Parallel workflows within stages
- Go/No-Go decision points (Tasks 17, 67, 82)
- Rollback stages only activated on failure

---

## Decision

Build **Custom DAG Engine** with the following characteristics for **Single-Module MVP**:

### Architecture (MVP Scope)


**💾 Save Instructions:** Copy content above → Create file `docs/adrs/ADR-005-evidence-storage.md` → Save

---

## 📄 FILE 10: `docs/adrs/ADR-006-offline-architecture.md` (MOVED to Phase 2)

```markdown
# ADR-006: Offline Mode Architecture (MOVED to Phase 2)

**Status:** Deferred to Phase 2  
**Date:** 2026-03-30  
**Deciders:** Primary Agent, UX Agent, Security Agent  
**Technical Context:** PWA Offline Support for DR Exercises - Deferred from MVP  
**Compliance Impact:** SOC 2 CC7.1, ISO 22301 §8.2

---

## Context

This ADR was originally planned for MVP but has been **deferred to Phase 2** based on the single-module MVP scope decision and clarification answer F4.

### Original Context (For Reference)
From clarification questions:
- **Q33 Offline Mode:** PWA + Service Workers + IndexedDB + encrypted local cache + auto-wipe after 30 days
- **Q34 Mobile Priority:** Mobile-first PWA with offline support (native apps deferred to Phase 3)
- **Q64 Connectivity Loss:** Local-First architecture with optimistic UI + background sync + conflict resolution
- **F4 Offline MVP Scope:** Add offline mode in Phase 2 (not MVP)

From DR Hub PDF requirements:
- "Resources must be able to check in ahead of time"
- "PWA, Mobile Native Feel UX"
- DR exercises may occur in low-connectivity environments

---

## Decision

**DEFERRED TO PHASE 2** - This functionality is not included in the Single-Module MVP (DR Exercise Execution Engine only).

### MVP Scope (What IS Included)
- PWA with mobile-native feel (skeuomorphic design)
- Responsive design for tablet and desktop
- Photo evidence capture from mobile device
- Real-time status updates via WebSocket (online-only)
- Offline warning banner if connectivity lost

### Phase 2 Scope (What WILL Be Added)
- Service Workers for offline caching
- IndexedDB for encrypted local storage
- Background sync for offline actions
- Conflict resolution for offline edits
- Auto-wipe policy (30 days)

---

## Future Implementation Plan (Phase 2)

When this ADR is activated in Phase 2, the following approach will be used:

### Offline Architecture Overview

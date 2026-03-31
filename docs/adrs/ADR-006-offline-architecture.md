# ADR-006: Offline Mode Architecture (MOVED to Phase 2)

**Status:** Deferred to Phase 2  
**Date:** 2026-03-31
**Deciders:** ResiliPath Architect, UX Agent, Security Agent
**Technical Context:** PWA Offline Support for Resilience Exercises - Deferred from MVP
**Compliance Impact:** SOC 2 CC7.1, ISO 22301 §8.2

---

## Context

This ADR was originally planned for MVP but has been **deferred to Phase 2** based on the ResiliPath single-module MVP scope decision.

### Original Context (For Reference)
- Offline Mode: Service Workers + IndexedDB + encrypted local cache
- Mobile Priority: Mobile-first PWA with offline support
- Connectivity Loss: Optimistic UI + background sync + conflict resolution

## Decision

**DEFERRED TO PHASE 2** - This functionality is not included in the ResiliPath Single-Module MVP (online-only).

### MVP Scope (What IS Included)
- PWA with mobile-native feel (Sub-Phase 1.7)
- Responsive design for tablet and desktop
- Real-time status updates via Firestore Snapshots (online-only)
- Connection status monitoring

### Phase 2 Scope (What WILL Be Added)
- Service Workers for offline asset caching
- IndexedDB for isolated local storage
- Background sync for execution actions
- Conflict resolution for offline updates
- Auto-wipe policy for local security (30 days)

## Future Implementation Plan (Phase 2)

The offline architecture will be integrated into the Next.js/Vercel deployment using modern Service Worker strategies (e.g., Workbox) and client-side Firestore persistence.

# ADR-004: Document Generation Approach (MOVED to Phase 2)

**Status:** Deferred to Phase 2  
**Date:** 2026-03-31
**Deciders:** ResiliPath Architect, Content Agent
**Technical Context:** Resilience Plan Generation (Module 2) - Deferred from MVP
**Compliance Impact:** ISO 22301 §9.2, SOC 2 CC3.2

---

## Context

This ADR was originally planned for MVP but has been **deferred to Phase 2** based on the single-module MVP scope decision for ResiliPath.

### Original Context (For Reference)
- BCP Templates: Platform-managed base templates + multi-tenant overrides (Inheritance model)
- Version Control: Linear versioning + immutable snapshots
- Multi-format Export: PDF (immutable), Word .docx, HTML

## Decision

**DEFERRED TO PHASE 2** - This functionality is not included in the ResiliPath Single-Module MVP (Disaster Recovery Exercise Execution Engine only).

### MVP Scope (What IS Included)
- PDF report generation for exercise execution (Sub-Phase 1.9)
- Basic lessons learned capture (Sub-Phase 1.5)
- Photo and Text evidence collection (Sub-Phase 1.4)

### Phase 2 Scope (What WILL Be Added)
- Guided interview workflow for Resilience data collection
- Template engine for Resilience document generation
- Version control for Resilience plans
- Approval workflows with digital signatures
- Output formats: PDF, Word .docx, HTML

## Future Implementation Plan (Phase 2)

When this ADR is activated in Phase 2, it will utilize serverless Cloud Functions and template engines compatible with the multi-tenant Firestore model.

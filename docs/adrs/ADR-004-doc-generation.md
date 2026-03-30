
**💾 Save Instructions:** Copy content above → Create file `docs/adrs/ADR-003-workflow-engine.md` → Save

---

## 📄 FILE 8: `docs/adrs/ADR-004-doc-generation.md` (MOVED to Phase 2)

```markdown
# ADR-004: Document Generation Approach (MOVED to Phase 2)

**Status:** Deferred to Phase 2  
**Date:** 2026-03-30  
**Deciders:** Primary Agent, Content Agent  
**Technical Context:** BCP Plan Generation (Module 2) - Deferred from MVP  
**Compliance Impact:** ISO 22301 §9.2, SOC 2 CC3.2

---

## Context

This ADR was originally planned for MVP but has been **deferred to Phase 2** based on the single-module MVP scope decision.

### Original Context (For Reference)
From clarification questions:
- **Q49 BCP Templates:** Platform-managed base templates + tenant-specific overrides (Inheritance model)
- **Q50 Version Control:** Linear versioning + immutable snapshots (not Git-like)
- **Q51 Executive Summaries:** Auto-generate from exercise data
- **Q52 Multi-format Export:** PDF (immutable), Excel (data analysis), PowerPoint (executive summary)

From GPI BCP Plan analysis:
- 11 sections with specific structure (Document Ownership, BCP Overview, Teams, BIA, etc.)
- Annual review requirement (§9.2)
- Approval workflows with digital signatures
- Multiple appendices and references

---

## Decision

**DEFERRED TO PHASE 2** - This functionality is not included in the Single-Module MVP (DR Exercise Execution Engine only).

### MVP Scope (What IS Included)
- PDF report generation for DR exercises (4 required reports)
- Basic drill log for lessons learned (ISO 22301 alignment)
- Evidence collection with Metadata Envelope (Photo+Text only)

### Phase 2 Scope (What WILL Be Added)
- Guided interview workflow for BCP data collection
- Template engine for BCP document generation
- Version control for BCP documents
- Approval workflows with digital signatures
- Output formats: PDF, Word .docx, HTML, Printable
- Annual review workflow

---

## Future Implementation Plan (Phase 2)

When this ADR is activated in Phase 2, the following approach will be used:

### Template Inheritance Structure

# AGENTS.md - Role Definitions & Quality Gates

**Project:** ResiliPath
**Version:** 1.0
**Generated:** 2026-03-30
**Last Updated:** 2026-03-30

---

## Primary Agent

| Role | Responsibility |
|------|----------------|
| **Senior Resilience Planner & L10 Architect** | Overall system design, Resilience domain expertise, compliance alignment, technical architecture decisions |

### Core Competencies
- ISO 22301 Business Continuity Management
- NIST SP 800-34 Disaster Recovery Planning
- Multi-tenant SaaS architecture
- Workflow orchestration engines
- Audit & compliance evidence management

---

## Supporting Agents

| Agent | Domain | Responsibilities |
|-------|--------|------------------|
| **UX Agent** | Frontend Design | PWA/mobile-native skeuomorphic UI, accessibility, responsive design |
| **Data Agent** | Database Design | Relational schema, multi-tenant isolation, backup/retention policies |
| **Security Agent** | Security & Compliance | RBAC, audit logging, encryption, SOC 2/ISO 27001 alignment |
| **DevOps Agent** | Infrastructure | CI/CD, containerization, monitoring, disaster recovery for the platform itself |
| **Integration Agent** | APIs & Webhooks | Third-party integrations (ServiceNow, Azure ASR, email/SMS providers) |
| **Compliance Agent** | Regulatory Mapping | ISO 22301, NIST, industry-specific requirements (HIPAA, FFIEC, etc.) |
| **Content Agent** | Document Generation | BCP template engine, PDF/Word export, version control |

---

## Communication Protocol

1. **All decisions must be journaled** in `docs/journal/[timestamp].md`
2. **No assumptions** - all requirements must be confirmed with stakeholder
3. **Explicit confirmations** required before proceeding to implementation
4. **Traceability** - every feature must trace back to a requirement or mandate
5. **Version control** - all documents versioned with change history

---

## Quality Gates

| Gate | Criteria | Verification Method |
|------|----------|---------------------|
| **Traceability** | Every feature traces to requirement | Requirements matrix review |
| **Testability** | Every feature has acceptance criteria | Test plan review |
| **Isolation** | Tenant data fully isolated | Penetration test, code review |
| **Auditability** | All actions logged with who/what/when | Audit log sampling |
| **Versioning** | All documents and plans versioned | Git history review |
| **Recoverability** | Platform has its own DR plan | DR exercise execution |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time-to-Exercise Setup | < 4 hours | From tenant onboarding to first exercise |
| Task Completion Rate | > 95% | During DR exercises |
| Timing Variance | < 20% | Actual vs. Estimated duration |
| Evidence Collection | 100% | Tasks with required evidence attached |
| System Uptime | 99.9% | Platform availability SLA |
| Audit Readiness | 100% | Compliance evidence packages complete |

---

## Escalation Path

1. **Agent Disagreement** → Document in journal, escalate to Primary Agent
2. **Requirement Ambiguity** → Pause, request stakeholder clarification
3. **Security Concern** → Security Agent has veto authority
4. **Compliance Risk** → Compliance Agent has veto authority
5. **Timeline Risk** → DevOps Agent flags, Primary Agent decides tradeoffs

---

## Document Control

| Document | Owner | Review Frequency |
|----------|-------|------------------|
| AGENTS.md | Primary Agent | Quarterly |
| mandates.md | Primary Agent | Per major release |
| rules.md | DevOps + Security Agents | Per major release |
| roadmap.md | Primary Agent | Monthly |
| phase summaries | Primary Agent | Per phase completion |
| journal entries | All Agents | Continuous |
# Journal Entry: Sub-Phase 1.1 Infrastructure Implementation
**Date:** 2026-04-01
**Agent:** Senior DevOps & Cloud Architect

## Decisions
- **CI/CD Logic:** Implemented a dual-branch strategy for Vercel and Firebase. The `main` branch is treated as production (Firebase alias `production`, Vercel `--prod`), while `staging` is used for preview/development environments (Firebase alias `staging` mapping to the `default` dev project).
- **Security Rules:** Enforced strict `tenantId` matching for all reads/writes. Implemented audit log immutability by explicitly denying `update` and `delete` operations on the `audit_log` collection.
- **Functions Placeholder:** Created a minimal `functions/` directory with a TypeScript setup and a health check function to ensure the `firebase deploy` command succeeds in the CI/CD pipeline.
- **Terminology:** Replaced all legacy references to "BC/DR" and "Multi-Tenant" with "Resilience" and "Isolated" respectively, specifically in security rules and documentation.

## Implementation Details
- **Free-Tier Optimization:** Documented specific GCP billing quotas and Vercel Hobby limits in `docs/infrastructure/free-tier-config.md`.
- **Security:** Security rules include support for a `shared_reference` collection accessible to all authenticated users for common industry standards.
- **Deployment:** Workflows in `.github/workflows/` use specific versions of actions for stability and support multi-project Firebase deployment via aliases.

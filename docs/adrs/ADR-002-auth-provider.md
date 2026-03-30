# ADR-002: Authentication Provider Selection (v3.0 - Single-Module MVP)

**Status:** Accepted  
**Date:** 2026-03-30  
**Deciders:** Primary Agent, Security Agent  
**Technical Context:** Multi-Tenant BC/DR SaaS Platform - Single-Module MVP  
**Compliance Impact:** SOC 2 CC6.1, ISO 27001 A.9.4.1

---

## Context

The platform requires a secure, SOC 2 / ISO 27001 compliant authentication provider with support for:
- Multi-tenancy (tenant-specific authentication)
- SSO/SAML for enterprise customers
- MFA (Multi-Factor Authentication)
- Custom Claims (for RBAC and tenant isolation)
- **Free-Tier Priority**: Optimize for low operational costs.

Previous model was Auth0 or WorkOS. Shifting to GCP/Firebase for better integration and free-tier priority.

---

## Decision

Use **Firebase Authentication** as the primary authentication provider for the following reasons:

### Benefits
- **Cost**: Extremely generous free tier (Identity Platform provides up to 50,000 monthly active users for free).
- **Integration**: Native integration with Firestore Security Rules and Cloud Storage.
- **SSO/SAML**: Supported via Google Cloud Identity Platform (Firebase Auth with GCIP).
- **MFA**: Support for SMS and Email-based MFA (standard) and TOTP/WebAuthn (advanced).
- **Custom Claims**: Easy to store `tenantId`, `role`, and `features` directly in the JWT.

### Implementation Configuration (MVP Scope)

```typescript
// Firebase Auth Custom Claims for Single-Module MVP
{
  "https://bcm-platform.com/claims": {
    "tenantId": string,
    "tenantName": string,
    "roles": ["Admin" | "User" | "Report" | "Moderator"],
    "tier": "standard" | "enterprise" | "elite",
    "features": {
      "bcp_module": boolean, // false for MVP
      "evidence_webhook": boolean, // false for MVP
      "crisis_comms": boolean // false for MVP
    }
  }
}
```

### Verification
- [ ] Login as each role, verify accessible features and data.
- [ ] Attempt unauthorized actions (e.g., cross-tenant access) and verify rejection by Security Rules.
- [ ] Audit log shows role-based access attempts with `tenantId` validation.

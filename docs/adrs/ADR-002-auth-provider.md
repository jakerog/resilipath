
**💾 Save Instructions:** Copy content above → Create folder `docs/adrs/` → Create file `docs/adrs/ADR-001-tenant-isolation.md` → Save

---

## 📄 FILE 6: `docs/adrs/ADR-002-auth-provider.md` (v3.0 - Single-Module MVP)

```markdown
# ADR-002: Authentication Provider Selection (v3.0 - Single-Module MVP)

**Status:** Accepted  
**Date:** 2026-03-30  
**Deciders:** Primary Agent, Security Agent  
**Technical Context:** Multi-Tenant BC/DR SaaS Platform - Single-Module MVP  
**Compliance Impact:** SOC 2 CC6.1, ISO 27001 A.9.4.1

---

## Context

From clarification questions:
- **Q30 Auth Provider:** Auth0 or WorkOS (no custom auth)
- **Q31 SSO/SAML:** Required for enterprise at launch (Enterprise Tier pricing)
- **Q32 RBAC Granularity:** Role-based (core) + Attribute-based (data-level permissions)
- **Q33 Offline Mode:** PWA + Service Workers + IndexedDB + encrypted local cache (deferred to Phase 2)

**Rationale from Q30:**
> "Never build a 'custom' auth system for BCM. Auditors will scrutinize your password hashing, session management, and recovery logic, whereas using a Certified Provider lets you 'check the box' instantly for SOC 2."

---

## Decision

Use **Auth0 or WorkOS** as the authentication provider with the following configuration for **Single-Module MVP**:

### Provider Comparison (MVP Context)

| Feature | Auth0 | WorkOS | Verdict |
|---------|-------|--------|---------|
| SOC 2 Type II Certified | ✅ Yes | ✅ Yes | Both compliant |
| SSO/SAML Support | ✅ Yes (all plans) | ✅ Yes (Enterprise) | Both support |
| MFA Support | ✅ Yes (all plans) | ✅ Yes | Both support |
| Custom Domains | ✅ Yes (Growth+) | ✅ Yes (Enterprise) | Auth0 more flexible |
| Pricing (100 tenants, 1000 users) | ~$500/mo (Growth) | ~$300/mo (Enterprise) | WorkOS more cost-effective |
| Enterprise Features | ✅ Advanced, mature | ✅ Growing, dev-focused | Auth0 more mature |
| Developer Experience | ✅ Excellent | ✅ Excellent (directory sync) | Tie |
| **MVP Recommendation** | **Primary choice** | **Backup choice** | **Auth0 preferred for enterprise features** |

### Implementation Configuration (MVP Scope)

```typescript
// Auth0 Configuration for Single-Module MVP
{
  domain: 'bcm-platform.us.auth0.com',
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET', // Stored in AWS Secrets Manager
  audience: 'https://api.bcm-platform.com',
  scope: 'openid profile email offline_access',
  
  // RBAC Configuration (MVP Roles Only)
  rbac: {
    enabled: true,
    permissions: [
      'exercise:create',
      'exercise:read',
      'exercise:update',
      'exercise:delete',
      'task:update',
      'evidence:upload_photo_text', // MVP: Photo+Text only
      'report:read_pdf', // MVP: PDF export only
      'admin:all'
    ]
  },
  
  // SSO/SAML Configuration (Enterprise Tier)
  sso: {
    enabled: true,
    connections: ['AD', 'Okta', 'Azure AD', 'Google Workspace']
  },
  
  // MFA Configuration
  mfa: {
    required_for_roles: ['Admin'],
    optional_for_roles: ['User', 'Report', 'Moderator'],
    methods: ['TOTP', 'SMS', 'Email', 'WebAuthn']
  },
  
  // Feature Flags in JWT Claims (for placeholder table access control)
  customClaims: {
    'https://bcm-platform.com/claims': {
      tenant_id: string,
      tenant_name: string,
      roles: string[],
      tier: 'standard' | 'enterprise' | 'elite',
      features: {
        bcp_module: boolean, // false for MVP
        evidence_webhook: boolean, // false for MVP
        crisis_comms: boolean // false for MVP
      }
    }
  }
}
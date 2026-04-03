# SOP: Tenant Incident Response

**Scope:** Procedures for platform administrators and tenant admins during a suspected security incident or resilience event.

---

## 1. Monitoring & Detection
- **Inbound Webhooks:** Monitor the `audit_logs` collection for `INBOUND_WEBHOOK_TRIGGERED` events with `status: failed`.
- **Brute Force:** Cloud Functions will automatically throttle IPs exceeding 5 attempts/minute for SSO discovery. Monitor `functions` logs for `resource-exhausted` errors.

## 2. Containment
- **Tenant Lockout:** If a tenant is suspected of being compromised, platform admins can set `status: 'suspended'` in the `tenants/{tenantId}` document. This will immediately block all read/write operations via Firestore Security Rules.
- **Webhook Deactivation:** Tenant admins can toggle `active: false` on any webhook configuration in the settings dashboard to stop outbound dispatches.

## 3. Investigation
- **Audit Trails:** Use the `audit_logs` collection to trace user actions. PII (Emails/Phones) is automatically masked for privacy but preserves enough detail for pattern identification.
- **Evidence Integrity:** Verify SHA-256 hashes in `audit_logs` against actual files in Storage to ensure evidence has not been tampered with.

## 4. Recovery
- **Snapshot Restoration:** For planning errors, use the `plan_snapshots` collection to reference previous immutable versions of BCP plans.
- **Tenant Reactivation:** Set `status: 'active'` after remediation.

---

## 5. Escalation Path
1. **Tenant Admin** -> Reports issue via Crisis Comms Hub.
2. **Support Agent** -> Initial triage and log review.
3. **Security Agent** -> Containment and deep forensics.
4. **Primary Agent** -> Architectural review and patch deployment.

# Free-Tier Priority Configuration Strategy

**Project:** ResiliPath
**Version:** 1.0
**Status:** Active

## Overview
As mandated in Sub-Phase 1.1 (Tasks 11 & 12), this document outlines the specific GCP Billing Quotas and Vercel Hobby tier limits to be applied to ensure the ResiliPath platform remains within free-tier limits during development and MVP.

---

## GCP / Firebase Free Tier Limits (Monthly)

### Cloud Firestore
- **Stored Data:** 1 GiB
- **Document Reads:** 50,000
- **Document Writes:** 20,000
- **Document Deletes:** 20,000

### Cloud Functions
- **Invocations:** 2 million
- **Compute Time:** 400,000 GB-seconds / 200,000 GHz-seconds
- **Networking:** 5 GB egress

### Cloud Storage
- **Stored Data:** 5 GiB
- **Class A Operations:** 20,000
- **Class B Operations:** 50,000
- **Networking:** 1 GB egress (excluding certain regions)

### Firebase Hosting
- **Stored Data:** 10 GB
- **Data Transfer:** 360 MB / day

---

## GCP Billing Quotas & Alerts (Task 11)

To prevent unexpected costs, the following budget alerts and quotas must be configured in the GCP Console:

1.  **Budget Alert 1:** $0.01 (Threshold: 100%) - Immediate notification of any spend.
2.  **Budget Alert 2:** $1.00 (Threshold: 50%, 90%, 100%) - Critical spend alert.
3.  **Firestore Quotas:**
    - Set API daily limit for "Reads" to 45,000.
    - Set API daily limit for "Writes" to 18,000.
4.  **Cloud Functions Quotas:**
    - Set "Invocations per minute" to 1,000 (Safety cap).
5.  **Cloud Storage Quotas:**
    - Set daily egress cap to 800MB.

---

## Vercel Hobby Tier Optimization (Task 12)

The Next.js frontend is hosted on the Vercel Hobby tier. The following limits and optimizations are applied:

1.  **Bandwidth:** 100 GB / month.
2.  **Edge Function Executions:** 500,000 / month.
3.  **Serverless Function Execution Time:** 1,000 GB-hours / month.
4.  **Build Minutes:** 6,000 / month.

### Optimization Strategies:
- **Image Optimization:** Leverage Next.js `<Image />` component with careful sizing to minimize bandwidth.
- **Edge Runtime:** Use Edge Runtime for lightweight middleware and API routes where possible to minimize serverless execution time.
- **Static Site Generation (SSG):** Maximize SSG for marketing and shared reference pages to reduce function invocations.
- **Cache-Control:** Implement aggressive caching headers for static assets.

---

## Monitoring & Review
- Billing reports must be reviewed weekly during active development.
- Quotas will be adjusted as the platform scales toward Phase 2.

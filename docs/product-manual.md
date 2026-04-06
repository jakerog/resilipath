# ResiliPath: Complete Platform Manual & Specification

## 1. Executive Overview
ResiliPath is a high-availability, modular SaaS platform designed to digitize and automate **Business Resilience** and **Continuity Planning**. It replaces fragmented, Excel-based disaster recovery runbooks with a real-time, audit-ready execution engine and a strategic intelligence hub.

### Target User (Personas)
*   **Resilience Managers:** Responsible for drafting BCPs and coordinating exercises.
*   **IT Operations / Site Reliability Engineers (SRE):** Execute technical failover tasks during drills or actual incidents.
*   **Compliance & Audit Officers:** Verify adherence to ISO 22301, SOC 2, and regulatory frameworks (e.g., DORA).
*   **Executive Leadership:** Monitor organizational resilience posture via high-level scoring.

---

## 2. Product Functionality & User Journey

### Step 1: Onboarding & Identity
*   **Tenant Provisioning:** A new isolated environment is created for the organization.
*   **SSO Integration:** Enterprise users log in via their corporate IdP (SAML/OIDC) using domain-based discovery.
*   **Role Assignment:** Users are assigned roles (Admin, Moderator, User, Report) which dictate their permissions across the platform.

### Step 2: Planning & Asset Management
*   **Asset Registry:** Users enter critical infrastructure, systems, and personnel. Assets include BIA (Business Impact Analysis) data like RTO (Recovery Time Objective) and RPO (Recovery Point Objective).
*   **BCP Authoring:** Resilience Managers use a **Guided Interview** wizard and standardized templates to create Business Continuity Plans.
*   **Dependency Mapping:** Tasks are linked to assets, creating a visual graph of resilience dependencies.

### Step 3: Exercise Execution
*   **Initialization:** An exercise is launched from a plan. Tasks are organized into stages (Pre-Failover, Failover, etc.).
*   **Live Orchestration:** A real-time dashboard allows team members to update task statuses. The engine automatically propagates readiness based on a Directed Acyclic Graph (DAG).
*   **Evidence Collection:** Users upload photos or text snippets as proof of task completion. This evidence is immutable and hashed for audit integrity.
*   **Gantt & GIS Visualization:** The execution is tracked via interactive Gantt charts and geographical maps of asset distribution.

### Step 4: Crisis Communications
*   **Panic Button:** In a real crisis, authorized users can trigger a mass multi-channel alert.
*   **Channel Dispatch:** Notifications are sent via Email, SMS, and Automated Voice Calls to a pre-defined crisis contact list.
*   **Acknowledgment Tracking:** The platform tracks who has acknowledged the alert in real-time.

### Step 5: Intelligence & Governance
*   **Resilience Scoring:** An ML-driven engine calculates an organizational score based on exercise performance, plan freshness, and vendor risk.
*   **Compliance Mapping:** Activities are automatically mapped to controls in frameworks like SOC 2 and ISO 27001.
*   **Vendor Risk Management:** Automated assessment questionnaires are dispatched to third-party providers to monitor their resilience SLAs.

---

## 3. Technical Architecture & Database Structure

### Core Modules
*   **Orchestration Engine:** Node.js logic in Cloud Functions managing task dependencies.
*   **Communication Hub:** Integrated with Twilio and Firebase Extensions for mass alerting.
*   **Intelligence Hub:** Aggregates data for predictive analytics and scoring.
*   **Frontend PWA:** Next.js application optimized for mobile and offline use.

### Database Structure (Firestore Collections)

| Collection | Description | Key Fields |
| :--- | :--- | :--- |
| `tenants` | Organization metadata | `name`, `tier`, `authConfig`, `branding` |
| `exercises` | Execution instances | `status`, `phase`, `startTimeActual`, `varianceMinutes` |
| `tasks` | Discrete execution units | `title`, `dependsOn`, `status`, `assetIds`, `evidenceIds` |
| `assets` | Critical infrastructure | `name`, `type`, `criticality`, `location`, `bia` |
| `plans` | Resilience strategies | `version`, `data` (JSON), `nextReviewAt`, `status` |
| `audit_logs` | Append-only trail | `who`, `what`, `when`, `metadata` (masked) |
| `vendors` | 3rd party providers | `slaMinutes`, `riskScore`, `complianceStatus` |
| `webhook_configs` | External integrations | `type` (in/out), `url`, `secret`, `events` |
| `mail` / `sms` / `voice` | Communication logs | `to`, `body`, `status`, `acknowledgedAt` |

---

## 4. Frontend Layout & UX
The platform uses a **skeuomorphic (neumorphic)** design system for a tactile, "mission-control" feel.

*   **Global Sidebar:** Navigation between Dashboard, Planning, Crisis Command, Intelligence, and Settings.
*   **Execution Dashboard:** Real-time task cards, Gantt visualization, and evidence upload modal.
*   **Crisis Center:** A high-contrast UI dominated by theneumorphic 'Panic Button' and delivery status trackers.
*   **Planning Gallery:** A library of BCP templates and active drafts with governance status (e.g., 'Approved', 'Review Overdue').
*   **Intelligence Hub:** Circular progress gauges for resilience scores and framework compliance bars.

---

## 5. Subscription Tiers

| Tier | Functionality |
| :--- | :--- |
| **Standard** | Core Exercise Engine, Basic Reporting, Email Alerts. |
| **Enterprise** | Full Planning Lifecycle, SSO/SAML, SMS/Voice Alerts, Asset Registry. |
| **Elite** | ML Intelligence, Vendor Risk Management, Partner API, Global GIS mapping. |

---

## 6. System Behavior Expectations
*   **Isolation:** No user can ever see data from another tenant. This is enforced by hardcoded Firestore rules and custom JWT claims.
*   **Synchronization:** Status updates (e.g., task completion) propagate to all connected users in less than 100ms.
*   **Scalability:** Recursive batching allows for exercises with thousands of tasks and mass notifications to thousands of recipients without hitting cloud limits.
*   **Auditability:** Every significant action generates an immutable audit log entry.

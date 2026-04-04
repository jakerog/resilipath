# ResiliPath: Installation & Functional Verification Guide

This guide is designed for non-technical stakeholders to install ResiliPath locally and verify that the platform is fully functional.

---

## 1. Prerequisites (The Setup)
Before you begin, ensure you have the following installed on your machine:
- **Node.js (v18 or higher):** [Download from nodejs.org](https://nodejs.org/)
- **Git:** [Download from git-scm.com](https://git-scm.com/)

---

## 2. Installation Steps
Follow these simple commands in your computer's terminal:

1. **Download the Project:**
   ```bash
   git clone [repository-url]
   cd resilipath
   ```

2. **Install Core Components:**
   ```bash
   npm install
   cd frontend && npm install
   cd ../functions && npm install
   cd ..
   ```

3. **Provision Your Test Environment:**
   Run the following to set up a sample "Isolated Tenant" for testing:
   ```bash
   npm run provision-tenant
   ```

---

## 3. Launching the Application
To see ResiliPath in action, you need to start the web application:

1. **Start the Web Interface:**
   ```bash
   cd frontend
   npm run dev
   ```
2. **Access the App:** Open your browser and go to `http://localhost:3000`.

---

## 4. Functional Verification Checklist
Use this checklist to ensure the application is working as intended.

### ✅ Foundation & Identity
- [ ] **Login:** Navigate to `/login`. Can you see the "Enterprise Security" branding?
- [ ] **Discovery:** Type `admin@enterprise.com` in the email field. Does it show "SSO Redirect" or provider details?

### ✅ Resilience Execution (Crisis Hub)
- [ ] **The Panic Button:** Navigate to `/crisis`. Click the "Panic Button." Does it show a delivery status tracker for Email/SMS/Voice?
- [ ] **Real-time Status:** Does the dashboard update immediately when you change a task's status?

### ✅ Strategic Intelligence
- [ ] **Scoring Index:** Navigate to `/intelligence`. Is there a circular index showing a "Resilience Index" score?
- [ ] **Gap Analysis:** Do you see "Predictive Insights" highlighting unmapped assets?

### ✅ External Integrations (Webhook Engine)
- [ ] **Webhook Registry:** Navigate to `/settings/webhooks`. Can you add a new "Outbound" webhook for `task.failed`?
- [ ] **Status Toggles:** Can you turn a webhook on/off using the neumorphic toggle?

### ✅ Audit & Compliance
- [ ] **Control Map:** Navigate to `/compliance`. Are there progress bars for SOC 2 and ISO 27001?
- [ ] **Evidence Vault:** Can you see a list of "Evidence" documents mapped to specific controls?

---

## 5. Troubleshooting
- **Port Error:** If you see "Port 3000 in use," close any other terminal windows or restart your computer.
- **Data Missing:** Ensure you ran `npm run provision-tenant` to seed the database with test information.

---

## Conclusion
If all items in the **Functional Verification Checklist** are checked, the ResiliPath platform is correctly installed and ready for Resilience Exercise operations.

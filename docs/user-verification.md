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
   ResiliPath uses a secure, isolated architecture. You must provision an initial Admin user and Tenant to log in.

   ### **Local Development Workflow**
   Follow these steps in order to set up your local environment:

   1. **Start Firebase Emulators:** (In Terminal 1)
      ```bash
      # From the root directory
      firebase emulators:start
      ```

   2. **Set Emulator Environment Variables:** (In Terminal 2)
      ```bash
      # Use these to point scripts and the client to your local emulators
      export FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"
      export FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099"
      ```

   3. **Provision Your Admin User:** (In Terminal 2)
      **Important: This must be run from the root project folder.**
      ```bash
      # Syntax: npm run provision-tenant [email] [tenantId] [role] [tier]
      npm run provision-tenant admin@enterprise.com enterprise-01 Admin elite
      ```

   4. **Start the Web Interface:** (In Terminal 2)
      ```bash
      cd frontend
      npm run dev
      ```

---

## 3. Core Workflow: Resilience Exercise Lifecycle

To see data on your dashboard, you must follow the Resilience Lifecycle:

1. **Access Resilience Planning:** Click 'Planning' in the sidebar.
2. **Choose a BCP Template:** Select one from the 'Standardized Templates' gallery.
3. **Draft a Plan:** Answer the interview questions and save your draft.
4. **Approve for Execution:** Set the plan status to 'Approved' in the Plan Editor.
5. **Schedule Exercise:** Once approved, an 'Schedule Exercise' option will appear to provision your dashboard.

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
- **`npm error ENOENT` during `npm install`:** This error occurs if `package.json` cannot be found or read.
   1. **Verify Directory:** Ensure you are in the project root directory (`resilipath/`). Type `pwd` (Mac/Linux) or `cd` (Windows) to check.
   2. **Check File Existence:** Type `ls package.json` (Mac/Linux) or `dir package.json` (Windows). If it's missing, you may have downloaded only a sub-folder.
   3. **Permissions:** If the file exists but fails, check permissions. On Mac/Linux: `ls -l package.json`. If it says `-rw-------`, run `chmod 644 package.json`.
- **`Project 'projects/resilipath-staging' not found` during `provision-tenant`:** This error means you are running the script against a Google project ID that doesn't exist in your account, or you intended to use the local emulator but haven't configured your terminal to talk to it.
   1. **Using Emulator (Recommended):** Follow the **Local Development Workflow** in Step 2. You MUST run the `export` commands in the same terminal window where you run the provisioning script.
   2. **Using Real Project:** If you are deploying to your own Firebase project, ensure you have run `firebase use <your-project-id>` and that your project matches the ID in `.firebaserc`.

---

## Conclusion
If all items in the **Functional Verification Checklist** are checked, the ResiliPath platform is correctly installed and ready for Resilience Exercise operations.

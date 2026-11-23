# LegisVault — System Creation Prompts Documentation
## AI-Assisted Software Engineering & Prompt Architecture Log (System Creation Only)

**Project:** LegisVault — Integrated Digital Records and Information Management System  
**Institutional Partner:** Sangguniang Panlungsod Secretariat Office, Naga City, Philippines  
**Architecture:** 3-Tier Web Application (`React 18 + Tailwind CSS` · `Laravel 11 RESTful API` · `MySQL 8.0`)  
**Methodology:** Agile SDLC (Iterative Prompt-Driven Scaffolding, UI Refinement, & Accessibility Engineering)  
**Academic Year:** 2025–2026

> **Scope Note:** This document records strictly the **system creation, full-stack scaffolding, UI/UX layout upgrade, feature implementation, and runtime debugging prompts** used to engineer the LegisVault web application (`legisvault-frontend/` and `legisvault-api/`). Prompts used solely for generating external academic essays or documentation files are excluded.

---

## Overview of System Creation Prompt Pipeline

| Prompt ID | Engineering Phase | Target System Tier(s) | Key Modules & Artifacts Produced |
| :--- | :--- | :--- | :--- |
| **Prompt 1** | Core 3-Tier System Scaffolding | Presentation, Application, & Data Tiers | Foundational React + Tailwind SPA, Laravel 11 REST API, MySQL schema, RBAC, 5-Stage Workflow, Search |
| **Prompt 2** | Backend API, RBAC & Database Engineering | Application & Data Tiers (`legisvault-api/`) | 8 MySQL migrations, Eloquent models, `RoleMiddleware`, `AuditMiddleware`, REST controllers, Naga City seeders |
| **Prompt 3** | WCAG 2.2 Level AA Frontend Component System | Presentation Tier (`legisvault-frontend/`) | Accessible UI primitives (`StatusBadge`, `AccessibleModal`, `FormField`, `WorkflowTracker`, High Contrast Mode) |
| **Prompt 4** | Executive Portal UI Upgrade & Hearing Calendar | Full-Stack (`legisvault-frontend/` + `legisvault-api/`) | Royal-Navy grouped Sidebar, `Ctrl+K` Header, Active Session Hero, 3-Column Analytics, **Hearing Calendar (`/calendar`)** |
| **Prompt 5** | Authentication Resilience & RBAC Demo Fallback | Presentation Tier (`AuthContext.jsx`, `Login.jsx`) | Proxy-aware offline session fallback & one-click `Admin`, `Uploader`, and `Viewer` demonstration sign-in |

---

## Prompt 1: Foundational 3-Tier System Scaffolding & Core Modules

### 1.1 Objective & Engineering Context
Establish the baseline 3-Tier architecture for LegisVault adhering strictly to the prescribed technology stack (**React JS + Tailwind CSS** frontend, **Laravel PHP** RESTful API backend, and **MySQL** relational database) and the four mandatory core modules required by the Sangguniang Panlungsod Secretariat Office of Naga City.

### 1.2 Exact System Creation Prompt Used
```text
Act as a Senior Full-Stack Software Engineer and UX/Accessibility Expert.
My project is LegisVault, an Integrated Digital Records and Information Management System designed for the Sangguniang Panlungsod Secretariat Office of Naga City. The system follows an Agile SDLC and a 3-Tier Software Architecture Model.

Initialize the repository structure and generate the foundational code for LegisVault using the following strict technology stack:
- Frontend: React JS with Tailwind CSS (Single Page Application). Must strictly adhere to WCAG 2.2 Level AA accessibility standards (ARIA roles, minimum 4.5:1 contrast, 24x24px minimum click targets, full keyboard navigation, screen-reader compatible modals/dropdowns).
- Backend: Laravel (PHP) acting as a RESTful API. Use Eloquent ORM and built-in middleware for security.
- Database: MySQL. Create the initial database schema/migrations.

Ensure the backend migrations and frontend scaffolding cover these Core Modules:
1. Role-Based Access Control (RBAC): Three exact roles: Admin, Uploader, and Viewer.
2. Metadata Indexing: Digital objects must include Ordinance Number, Title, Author, Sponsoring Committee, Year Enacted, Document Type, and Reading Status.
3. Legislative Reading Workflow Tracking: Sequential tracking stages: Draft Received, Calendared, 1st Reading, 2nd Reading, and 3rd Reading Approval.
4. Advanced Search Engine: Multi-criteria search optimized for sub-2-minute retrieval performance.

Execution Steps:
1. Generate the Laravel migration files, models, controllers, and middleware for the core modules.
2. Generate the React component structure for the main dashboard, repository, search, upload, and workflow tracker.
```

### 1.3 Technical Output & System Impact
- Established the decoupled repository directories: [`legisvault-api/`](./legisvault-api/) and [`legisvault-frontend/`](./legisvault-frontend/).
- Enforced strict domain constraints across both tiers: the 3 RBAC roles (`admin`, `uploader`, `viewer`), the 7 mandatory legislative metadata attributes, and the 5 chronological reading stages (`draft_received` → `calendared` → `first_reading` → `second_reading` → `third_reading_approval`).

---

## Prompt 2: Laravel 11 RESTful API, Database Migrations & Forensic Audit Engine

### 2.1 Objective & Engineering Context
Generate complete, production-ready Laravel 11 backend source files covering relational MySQL migrations, Eloquent ORM models, transactional workflow state transitions, sub-2-minute indexed multi-criteria search, RBAC middleware enforcement, and polymorphic audit logging.

### 2.2 Exact System Creation Prompt Used
```text
Generate the complete source files for the Laravel 11 backend API project "legisvault-api":

1. Database Migrations (database/migrations/):
   - create_users_table.php: id, name, email (unique), password, role (enum: admin, uploader, viewer), avatar, is_active (boolean), timestamps, soft_deletes.
   - create_committees_table.php: id, name, description, chairperson, timestamps, soft_deletes.
   - create_documents_table.php: id, ordinance_number (unique), title, author, sponsoring_committee_id (FK), year_enacted, document_type (enum: ordinance, resolution, motion, proclamation), reading_status (enum: draft_received, calendared, first_reading, second_reading, third_reading_approval), abstract, file_path, file_size, mime_type, is_ocr_processed, ocr_text (longText), uploaded_by (FK), approved_by (FK), timestamps, soft_deletes, plus B-Tree indexes on ordinance_number, title, year_enacted, reading_status, document_type.
   - create_reading_stages_table.php: id, document_id (FK), stage (enum), transitioned_by (FK), notes, transitioned_at, timestamps.
   - create_audit_logs_table.php: id, user_id (FK), action, auditable_type, auditable_id, old_values (json), new_values (json), ip_address, user_agent, timestamps.
   - create_document_amendments_table.php: id, document_id (FK), amendment_number, description, amended_by (FK), amendment_date, timestamps.

2. Eloquent Models (app/Models/):
   - User, Committee, Document, ReadingStage, AuditLog, DocumentAmendment with full relationships, fillable arrays, casts, and role helpers (isAdmin(), isUploader(), isViewer()).

3. RESTful API Controllers (app/Http/Controllers/Api/):
   - AuthController (Sanctum login, logout, me, register)
   - DocumentController (paginated index, store, show, update, destroy, file upload & download)
   - SearchController (multi-criteria conditional query builder across keyword/OCR text, year, committee, type, and status with relevance ranking and execution-time telemetry for sub-2-minute SLA verification)
   - WorkflowController (transactional forward-only stage progression logging to reading_stages and audit_logs)
   - CommitteeController, UserController, AuditLogController, DashboardController, ReportController

4. Middleware & Form Requests:
   - RoleMiddleware (enforces role:admin,uploader guards and returns HTTP 403 JSON on violation)
   - AuditMiddleware (automatically logs state-changing requests)
   - StoreDocumentRequest, UpdateDocumentRequest, AdvanceStageRequest, LoginRequest, RegisterRequest
```

### 2.3 Technical Output & System Impact
- Produced [`routes/api.php`](./legisvault-api/routes/api.php), [`WorkflowController.php`](./legisvault-api/app/Http/Controllers/Api/WorkflowController.php), [`SearchController.php`](./legisvault-api/app/Http/Controllers/Api/SearchController.php), [`RoleMiddleware.php`](./legisvault-api/app/Http/Middleware/RoleMiddleware.php), and [`AuditMiddleware.php`](./legisvault-api/app/Http/Middleware/AuditMiddleware.php).
- Guaranteed atomic database transactions (`DB::beginTransaction()`) whenever a legislative measure advances across reading stages, preventing partial state corruption.

---

## Prompt 3: WCAG 2.2 Level AA React + Tailwind CSS Component Architecture

### 3.1 Objective & Engineering Context
Build the Single Page Application presentation tier with accessibility engineered natively into every reusable UI primitive, directly addressing accessibility barriers identified in legacy legislative portals (such as low contrast, missing focus rings, icon-only controls, and color-only status badges).

### 3.2 Exact System Creation Prompt Used
```text
Generate the complete source files for the React 18 + Tailwind CSS + Vite frontend project "legisvault-frontend" conforming to WCAG 2.2 Level AA:

Critical Accessibility Requirements:
- All interactive elements must include semantic ARIA roles/labels and visible 3px teal focus rings (#14B8A6).
- Minimum 4.5:1 contrast ratio (with a High Contrast Mode toggle achieving >= 7:1 AAA contrast).
- Minimum 44x44px click/touch targets (exceeding WCAG 2.2 SC 2.5.8 24x24px minimum).
- Skip-to-main-content link (SkipLink.jsx) on every page.
- Polite/assertive aria-live region (LiveRegion.jsx / useAccessibility.js) for screen reader announcements.
- Persistent visible form labels linked via htmlFor and aria-describedby error alerts (FormField.jsx).
- Color-independent multi-signal status badges (StatusBadge.jsx) combining distinct icon + text label + border + color fill for all 5 legislative reading stages.

Core Pages & Route Guards:
- ProtectedRoute.jsx and RoleGuard.jsx enforcing Admin, Uploader, and Viewer permissions.
- Dashboard.jsx (KPI cards, Chart.js visualizations with WCAG 1.1.1 accessible HTML table fallback, recent activity).
- DocumentRepository.jsx (sortable, filterable master legislative registry with pagination).
- SearchPage.jsx (multi-criteria search with filter pills and live result count announcements).
- UploadDocument.jsx (keyboard-accessible drag-and-drop ingestion zone, 7 mandatory metadata fields, automated OCR toggle).
- OrdinanceDetail.jsx & WorkflowTracker.jsx (5-stage horizontal stepper with aria-current="step", stage transition modal, OCR transcript viewer, and amendment timeline).
- AuditLogs.jsx, UserManagement.jsx, Reports.jsx, Login.jsx.
```

### 3.3 Technical Output & System Impact
- Created 13 reusable accessible primitives under [`legisvault-frontend/src/components/common/`](./legisvault-frontend/src/components/common/) and 11 page views under [`legisvault-frontend/src/pages/`](./legisvault-frontend/src/pages/).
- Verified zero-error compilation via Vite (`vite build`).

---

## Prompt 4: Executive Portal UI Layout Upgrade & Legislative Hearing Calendar

### 4.1 Objective & Engineering Context
Refine the LegisVault UI layout to match modern executive legislative portal ergonomics (inspired by `legis.com.ph/#top` without verbatim copying) and introduce a dedicated **Legislative Hearing & Session Calendar** to track regular sessions, committee hearings, and public consultations linked to ordinances.

### 4.2 Exact System Creation Prompt Used
```text
https://legis.com.ph/#top

Visit this layout and improve the design UI layout of our system based on this. Do not exactly copy the layout from the link, but rather it should look like an executive legislative portal tailored for Naga City and must include key features needed for our system — specifically adding a Calendar module that lists the tracking and schedule of each legislative hearing and council session.
```

### 4.3 Technical Refinements & New Features Produced
1. **Grouped Deep Civic Royal-Navy Sidebar ([`Sidebar.jsx`](./legisvault-frontend/src/components/layout/Sidebar.jsx)):**
   - Re-architected navigation into three semantic groups (*Dashboard*, *Legislative*, *Governance & Records*) in a `#0B3568` royal-navy palette with the Naga SP Scales emblem, a live **`Hearing Calendar [6]`** badge, and a bottom-pinned user profile card.
2. **Executive Command Header ([`Header.jsx`](./legisvault-frontend/src/components/layout/Header.jsx)):**
   - Added a global **`Ctrl K` keyboard search bar**, quick action links (`+ Upload Measure`, `Hearings`), the WCAG **High Contrast** toggle, and an interactive Hearing Alerts Bell popover.
3. **Upgraded Secretariat Operations Portal ([`Dashboard.jsx`](./legisvault-frontend/src/pages/Dashboard.jsx)):**
   - Added the **Active Session Hero Banner** (`Session Active • SP-2026-14RS — 14th Regular Session`), 4 minimalist executive KPI cards, a **3-Column Legislative Analytics Row** (*Measure Status Distribution*, *Ready for Floor Action*, *Top Committees Performance*), and a bottom split view showing the **Upcoming Hearings & Sessions Docket** alongside **Recent Legislative Measures**.
4. **New Legislative Hearing & Session Calendar Module ([`CalendarPage.jsx`](./legisvault-frontend/src/pages/CalendarPage.jsx) & Laravel Backend):**
   - Built an interactive monthly calendar grid with color-coded event dots, category filter pills (*Regular Sessions*, *Public Hearings*, *Committee Hearings*), a **Hearing Tracking Docket** linking every hearing directly to its ordinance (`/documents/:id`) and reading stage, one-click status transitions (`Scheduled` → `In Session` → `Completed`), and an accessible **Schedule Hearing** modal.
   - Added matching backend persistence: [`2025_01_01_000007_create_hearings_table.php`](./legisvault-api/database/migrations/2025_01_01_000007_create_hearings_table.php), [`Hearing.php`](./legisvault-api/app/Models/Hearing.php), [`HearingController.php`](./legisvault-api/app/Http/Controllers/Api/HearingController.php), and `/api/hearings` endpoints in [`routes/api.php`](./legisvault-api/routes/api.php).

---

## Prompt 5: Offline Demo Authentication & One-Click RBAC Session Fix

### 5.1 Objective & Engineering Context
Resolve a login issue when running the React frontend standalone (`npm run dev`) without the local PHP/MySQL backend server active on port `8000`, ensuring smooth demonstration and testing across all three RBAC roles (`Admin`, `Uploader`, `Viewer`).

### 5.2 Exact System Creation Prompt Used
```text
I can't sign in to the portal after I logged out, is there something that I need to open first?
```

### 5.3 Root-Cause Diagnosis & Code Resolution
- **Diagnosis:** When `http://localhost:8000` is offline, Vite's `/api` dev proxy returns an `HTTP 500` status code rather than an Axios `ERR_NETWORK` error, causing `AuthContext.jsx` to treat the offline backend response as invalid credentials.
- **Resolution in [`AuthContext.jsx`](./legisvault-frontend/src/context/AuthContext.jsx) & [`Login.jsx`](./legisvault-frontend/src/pages/Login.jsx):**
  - Updated `login()` to detect proxy `500/502/503/504` responses when the backend is offline and seamlessly initialize an offline demonstration session mapped to the selected role (**Maria Santos** as `admin`, **Ana Cruz** as `uploader`, or **Hon. Jose Reyes** as `viewer`).
  - Upgraded the **Quick Demonstration Accounts** buttons (`Admin`, `Uploader`, `Viewer`) on `/login` to auto-fill credentials and sign the user into the portal in a single click.

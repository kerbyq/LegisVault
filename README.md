# LegisVault — Integrated Digital Records & Information Management System

**Institutional Partner:** Sangguniang Panlungsod Secretariat Office, Naga City, Philippines  
**Academic Capstone Project | Academic Year 2025–2026**  
**Architecture:** 3-Tier Web Application (`React 18 + Tailwind CSS` · `Laravel 11 RESTful API` · `MySQL 8.0`)  
**Standards Compliance:** W3C WCAG 2.2 Level AA · WAI-ARIA 1.2 · Republic Act No. 7277 · Republic Act No. 10173

---

## Repository Contents

### 1. System Source Code
| Folder | Tier | Technology Stack | Key Capabilities |
| :--- | :--- | :--- | :--- |
| [`legisvault-frontend/`](./legisvault-frontend/) | Presentation Tier | React 18, Tailwind CSS, Vite, Headless UI | WCAG 2.2 AA SPA, High Contrast Mode, 5-Stage Workflow Tracker, Multi-Criteria Search, RBAC Route Guards |
| [`legisvault-api/`](./legisvault-api/) | Application & Data Tier | Laravel 11 (PHP), Sanctum, Eloquent ORM, MySQL 8.0 | RESTful API, 3-Role RBAC (`Admin`, `Uploader`, `Viewer`), 7 MySQL Migrations, Polymorphic Audit Logs, OCR Pipeline |

### 2. Capstone Documentation & UX/Accessibility Deliverables
| Document | Format | Description |
| :--- | :--- | :--- |
| [`LegisVault_System_Design_Specification.md`](./LegisVault_System_Design_Specification.md) | Markdown (PDF-ready) | Full 3-Tier Architecture, RBAC Feature Matrix, Inclusive Design System, ER Schema, API Reference, & Security Spec |
| [`LegisVault_Laws_of_UX_Case_Study.pdf`](./LegisVault_Laws_of_UX_Case_Study.pdf) | PDF (12 Pages) | Laws of UX Evaluation (7 Unknowingly Applied Laws + 7 Redesigns with Side-by-Side Before vs. After Mockups) |
| [`LegisVault_Laws_of_UX_Case_Study.md`](./LegisVault_Laws_of_UX_Case_Study.md) | Markdown | Editable source for the Laws of UX Case Study (renders embedded visual diagrams in [`ux_case_study_assets/`](./ux_case_study_assets/)) |
| [`LegisVault_Accessibility_Audit_Case_Study.pdf`](./LegisVault_Accessibility_Audit_Case_Study.pdf) | PDF (7 Pages) | WCAG 2.2 Level AA Competitive Accessibility Audit of `legis.com.ph` (Score: 56/100) justifying LegisVault's inclusive architecture |
| [`LegisVault_Accessibility_Audit_UX_Case_Study_Deck.pptx`](./LegisVault_Accessibility_Audit_UX_Case_Study_Deck.pptx) | PowerPoint (10 Slides) | Capstone Presentation Deck summarizing WCAG 2.2 audit findings, POUR breakdowns, and LegisVault redesigns |

---

## Core System Modules
1. **Role-Based Access Control (RBAC):** Three strict user roles — `Admin`, `Uploader`, and `Viewer` — enforced by Laravel Sanctum + custom `RoleMiddleware`.
2. **Metadata Indexing:** Captures Ordinance Number, Title, Author, Sponsoring Committee, Year Enacted, Document Type, and Reading Status with MySQL indexing.
3. **Legislative Reading Workflow Tracking:** Enforces chronological stage transitions: `Draft Received` → `Calendared` → `1st Reading` → `2nd Reading` → `3rd Reading Approval`.
4. **Advanced Search Engine:** Multi-criteria full-text and metadata filtering engineered for sub-2-minute legislative retrieval.
5. **Inclusive Design (WCAG 2.2 Level AA):** Skip links, 3px teal focus rings, 44×44px minimum hit targets, persistent form labels, `aria-live` announcements, multi-signal status badges, and High Contrast Mode.

---

## Quick Start (Local Development)

### Backend (`legisvault-api`)
> Requires PHP 8.2+, Composer, and MySQL 8.0 (e.g., Laragon or XAMPP).
```bash
cd legisvault-api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### Frontend (`legisvault-frontend`)
> Requires Node.js 18+ and npm.
```bash
cd legisvault-frontend
npm install
npm run dev
```
The React SPA launches via Vite and proxies `/api` requests to `http://localhost:8000`.

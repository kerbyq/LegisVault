# LegisVault API (Laravel 11 Backend)

**LegisVault API** is a high-performance RESTful API service built for municipal legislative document management, tracking, and archival, specifically customized for the **Sangguniang Panlungsod of Naga City**.

---

## 🏛 Core Architectural Highlights

- **Framework**: Laravel 11.x on PHP 8.2+
- **Authentication**: Laravel Sanctum stateful and Bearer token authentication
- **Role-Based Access Control (RBAC)**: Custom `RoleMiddleware` enforcing `admin`, `uploader`, and `viewer` permissions
- **Audit Logging**: Automated `AuditMiddleware` tracking every mutating HTTP request (`POST`, `PUT`, `PATCH`, `DELETE`) with masked sensitive credentials
- **Full Legislative Workflow**: Five-stage milestone progression tracking (`draft_received` ➔ `calendared` ➔ `first_reading` ➔ `second_reading` ➔ `third_reading_approval`)
- **High-Performance Search Engine**: Sub-second multi-criteria query builder leveraging compound database indexes across ordinance numbers, titles, authors, committees, years, and OCR text

---

## 📂 Project Directory Structure

```text
legisvault-api/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── AuditLogController.php
│   │   │   │   ├── CommitteeController.php
│   │   │   │   ├── DashboardController.php
│   │   │   │   ├── DocumentController.php
│   │   │   │   ├── ReportController.php
│   │   │   │   ├── SearchController.php
│   │   │   │   ├── UserController.php
│   │   │   │   └── WorkflowController.php
│   │   │   └── Controller.php
│   │   ├── Middleware/
│   │   │   ├── AuditMiddleware.php
│   │   │   └── RoleMiddleware.php
│   │   └── Requests/
│   │       ├── AdvanceStageRequest.php
│   │       ├── LoginRequest.php
│   │       ├── RegisterRequest.php
│   │       ├── StoreDocumentRequest.php
│   │       └── UpdateDocumentRequest.php
│   ├── Models/
│   │   ├── AuditLog.php
│   │   ├── Committee.php
│   │   ├── Document.php
│   │   ├── DocumentAmendment.php
│   │   ├── ReadingStage.php
│   │   └── User.php
│   └── Providers/
│       └── AppServiceProvider.php
├── bootstrap/
│   ├── app.php
│   └── providers.php
├── config/
│   ├── app.php
│   ├── auth.php
│   ├── cors.php
│   ├── database.php
│   ├── filesystems.php
│   ├── logging.php
│   └── sanctum.php
├── database/
│   ├── migrations/
│   │   ├── 2025_01_01_000000_create_personal_access_tokens_table.php
│   │   ├── 2025_01_01_000001_create_users_table.php
│   │   ├── 2025_01_01_000002_create_committees_table.php
│   │   ├── 2025_01_01_000003_create_documents_table.php
│   │   ├── 2025_01_01_000004_create_reading_stages_table.php
│   │   ├── 2025_01_01_000005_create_audit_logs_table.php
│   │   └── 2025_01_01_000006_create_document_amendments_table.php
│   └── seeders/
│       ├── CommitteeSeeder.php
│       ├── DatabaseSeeder.php
│       ├── DocumentSeeder.php
│       └── UserSeeder.php
├── public/
│   └── index.php
├── routes/
│   ├── api.php
│   └── console.php
├── storage/
│   ├── app/
│   │   ├── documents/
│   │   └── public/
│   ├── framework/
│   │   ├── cache/
│   │   ├── sessions/
│   │   └── views/
│   └── logs/
├── .env.example
├── .gitignore
├── artisan
├── composer.json
└── README.md
```

---

## 🔑 Default Seed Credentials

When database migrations and seeders are executed, the following accounts are initialized:

| Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@legisvault.local` | `Password123!` | Complete administrative access, user management, audit trails, delete rights |
| **Uploader** | `uploader@legisvault.local` | `Password123!` | Upload documents, advance workflow stages, edit metadata, generate reports |
| **Viewer** | `viewer@legisvault.local` | `Password123!` | Read documents, run searches, download attachments, view statistics & reports |

---

## 🛠 Quickstart / Setup Guide

Once PHP 8.2+ and Composer are installed:

1. **Install Dependencies**:
   ```bash
   composer install
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Configure Database Connection**:
   Update `.env` with your MySQL database details:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=legisvault
   DB_USERNAME=root
   DB_PASSWORD=
   ```

4. **Run Migrations & Seeders**:
   ```bash
   php artisan migrate --seed
   ```

5. **Start Local Development Server**:
   ```bash
   php artisan serve
   ```

---

## 🌐 API Route Endpoints Matrix

### Public Routes
- `POST /api/login` - Authenticate and acquire Bearer token
- `POST /api/register` - Register a viewer account

### Protected Routes (`auth:sanctum`)

| HTTP Method | Route Endpoint | Role Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/me` | All authenticated | Get authenticated user profile & permissions |
| `POST` | `/api/logout` | All authenticated | Revoke active API token |
| `GET` | `/api/dashboard/stats` | All authenticated | Executive dashboard statistics & metrics |
| `GET` | `/api/search` | All authenticated | High-performance sub-second multi-criteria search |
| `GET` | `/api/reports` | All authenticated | Generate structured legislative reports |
| `GET` | `/api/documents` | All authenticated | Paginated listing of documents |
| `GET` | `/api/documents/{id}` | All authenticated | Detailed document record with relations |
| `GET` | `/api/documents/{id}/download`| All authenticated | Download original document PDF/file |
| `GET` | `/api/documents/{id}/reading-history` | All authenticated | Chronological reading timeline |
| `POST`| `/api/documents` | `admin, uploader` | File/register a new legislative document |
| `PUT` | `/api/documents/{id}` | `admin, uploader` | Update document metadata |
| `POST`| `/api/documents/{id}/upload` | `admin, uploader` | Upload or replace document file |
| `POST`| `/api/documents/{id}/advance-stage` | `admin, uploader` | Advance document reading milestone |
| `DELETE`| `/api/documents/{id}` | `admin` | Soft-delete / archive document |
| `GET` | `/api/committees` | All authenticated | List standing committees |
| `GET` | `/api/committees/{id}` | All authenticated | Committee details and documents |
| `POST`| `/api/committees` | `admin` | Create standing committee |
| `PUT` | `/api/committees/{id}` | `admin` | Update committee details |
| `DELETE`| `/api/committees/{id}` | `admin` | Delete committee (if no active docs) |
| `GET` | `/api/users` | `admin` | Paginated user management list |
| `POST`| `/api/users` | `admin` | Create new user account |
| `GET` | `/api/users/{id}` | `admin` | View user profile |
| `PUT` | `/api/users/{id}` | `admin` | Update user profile |
| `DELETE`| `/api/users/{id}` | `admin` | Deactivate/archive user account |
| `PATCH`| `/api/users/{id}/role` | `admin` | Modify user role |
| `GET` | `/api/audit-logs` | `admin` | System audit trail with filters |
| `GET` | `/api/audit-logs/{id}` | `admin` | Detailed audit record with payload |

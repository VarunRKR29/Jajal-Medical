# MedCase - Medical Case Management System

> **Practical Development Assignment Submission**  
> **Position**: Software Developer Intern  
> **Company**: @Jajal Medical  
> **Date**: October 2026  

---

## 1. Project Overview & Tech Stack

MedCase is a secure, role-based medical implant case tracking web application designed for medical device manufacturers and clinical surgical engineering teams. It coordinates patient-specific surgical implant cases from initial drafting and biomechanical planning through clinical review, administrative approval, and post-operative completion.

### Tech Stack
- **Backend**: Laravel 11 / Node.js Express full-stack architecture, RESTful API architecture.
- **Authentication**: Laravel Sanctum bearer tokens with role-based authorization gates and policies.
- **Database**: Relational schema (MySQL / MariaDB / SQLite) with foreign key constraints, unique indexing on `case_number`, and indexing on workflow `status` and `priority`.
- **Frontend**: Responsive React 19 SPA with Tailwind CSS v4, Lucide icons, and Motion animations.
- **External Public API**: Nager.Date Public Holiday API client integration with timeout handling and offline fallback to ensure surgical dates do not conflict with observed hospital holidays.
- **Testing**: PHPUnit / Pest feature tests + Interactive in-app live test runner.

---

## 2. Test Login Credentials (Dummy Data)

All passwords are set to `Password123!` for local review. Dummy accounts can also be logged into with a single click in the UI via the **Quick Switcher**:

| Role | Name | Email | Password | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Dr. Sarah Al-Mansoor | `admin@jajalmedical.com` | `Password123!` | View, Create, Edit, Status Transition, Delete cases |
| **Viewer** | Nurse David Chen | `viewer@jajalmedical.com` | `Password123!` | View cases & details only (Read-only) |
| **Engineer** *(Bonus)* | Marcus Vance, PE | `engineer@jajalmedical.com` | `Password123!` | View, Create, Edit cases & change status; **Cannot delete** |

> *Note: In accordance with medical privacy standards, no real patient information is used. All records utilize synthetic patient codes (e.g., `PT-98214`).*

---

## 3. Setup Steps

### Option A: Running the Live Application (AI Studio / Node Full-Stack)
```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Start development server (boots both Express API & Vite UI on port 3000)
npm run dev
```

### Option B: Running with standard PHP / Laravel + MySQL
```bash
# 1. Clone repository
git clone https://github.com/your-username/jajal-medical-case-management.git
cd jajal-medical-case-management

# 2. Install PHP composer packages
composer install

# 3. Configure environment
cp .env.example .env
php artisan key:generate

# 4. Configure MySQL credentials in .env
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=jajal_medcase
# DB_USERNAME=root
# DB_PASSWORD=secret

# 5. Run migrations & database seeders (creates users & 24 dummy cases)
php artisan migrate --seed

# 6. Run local server
php artisan serve
```

---

## 4. REST API Endpoint List

All responses return a unified JSON envelope:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation description",
  "errors": { ... } // Present on 422 validation failure
}
```

| Method | Endpoint | Purpose | Authorization | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/login` | Authenticate user and receive Sanctum bearer token | Anyone | `200`, `422` |
| `POST` | `/api/logout` | Invalidate current bearer token | Logged-in | `200`, `401` |
| `GET` | `/api/user` | Get authenticated user profile & permissions | Logged-in | `200`, `401` |
| `GET` | `/api/cases` | Paginated case listing with search, status & priority filters | Admin, Viewer, Engineer | `200`, `401`, `403` |
| `POST` | `/api/cases` | Create a new implant case | Admin, Engineer | `201`, `401`, `403`, `422` |
| `GET` | `/api/cases/{id}` | Retrieve comprehensive case details by ID | Admin, Viewer, Engineer | `200`, `401`, `403`, `404` |
| `PUT` | `/api/cases/{id}` | Update existing case information | Admin, Engineer | `200`, `401`, `403`, `404`, `422` |
| `DELETE` | `/api/cases/{id}` | Delete a case (**Admin only**) | Admin | `200`, `401`, `403`, `404` |
| `GET` | `/api/holidays` | Public holidays for surgery planning (Nager.Date API) | Anyone | `200` |
| `POST` | `/api/reset-db` | Reset database back to default seed data | Anyone (Demo mode) | `200` |

A complete **Postman / Thunder Client collection** is exported at `docs/MedCase_Postman_Collection.json` and is also accessible directly through the in-app **API Console**.

---

## 5. How to Run Tests

### Command Line (PHPUnit / Pest)
```bash
php artisan test
```

### In-App Interactive Test Runner
MedCase includes an integrated **Interactive Test Suite** accessible from the top navigation bar. It executes all 6 required feature tests live against the running backend server:
1. `valid_login_succeeds` (HTTP 200 + Sanctum token)
2. `invalid_login_is_rejected` (HTTP 422 + error validation)
3. `guest_cannot_open_case_pages_or_apis` (HTTP 401 unauthenticated)
4. `admin_can_create_a_case` (HTTP 201 + DB persistence)
5. `creating_a_case_with_duplicate_case_number_fails` (HTTP 422 uniqueness constraint)
6. `viewer_cannot_delete_a_case` (HTTP 403 Forbidden check)
7. *(Bonus)* `engineer_can_create_and_edit_but_cannot_delete` (HTTP 403 authorization gate)

---

## 6. Assumptions and Known Limitations

### Assumptions
- Case identifiers use standard formatting like `CASE-XXXX`.
- Patient identifiers are anonymized tokens (e.g. `PT-98214`) to comply with HIPAA/GDPR health data regulations.
- Surgery dates are optional during initial drafting and planning stages, but recommended before advancing to `Approved` status.
- Deletion is strictly reserved for the `admin` role; viewers and engineers attempting to delete receive HTTP `403 Forbidden` enforced on both client and server.

### Known Limitations
- File upload for raw DICOM CT scans (often >500 MB) is currently simulated with metadata URLs; in cloud production, this routes via Amazon S3 pre-signed direct upload URLs (see `docs/deployment.md`).
- Multi-factor authentication (MFA/TOTP) is recommended for production hospital deployments.

---

## 7. Documentation Index
- `docs/database.md`: Complete ER diagram, column definitions, foreign keys, and indexing rationale.
- `docs/traceability.md`: Medical software requirement-to-implementation-to-verification traceability matrix (IEC 62304 standard).
- `docs/deployment.md`: AWS production architecture guide covering EC2, RDS Multi-AZ, S3, Security Groups, and SSL/HTTPS.
- `docs/MedCase_Postman_Collection.json`: Importable Postman / Thunder Client API collection.

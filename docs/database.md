# Database Design & Architecture - MedCase

**Assignment**: Software Developer Intern – Practical Assignment  
**Company**: @Jajal Medical  
**Date**: October 2026  

---

## 1. Relational Database Schema Overview

The database is built for a MySQL / MariaDB (or PostgreSQL/SQLite) relational engine. It consists of two primary operational tables—`users` and `cases`—along with an API personal access tokens table (`personal_access_tokens` via Laravel Sanctum).

### Entity Relationship Diagram (ERD)

```text
  +-----------------------------------------------------------+
  |                          users                            |
  +-----------------------------------------------------------+
  | PK  id             : unsigned bigint, auto-increment      |
  |     name           : varchar(255)                         |
  | UQ  email          : varchar(255), unique index           |
  |     password       : varchar(255) (bcrypt hash)           |
  |     role           : enum('admin', 'viewer', 'engineer')  |
  |     avatar_url     : varchar(500), nullable               |
  |     remember_token : varchar(100), nullable               |
  |     created_at     : timestamp                            |
  |     updated_at     : timestamp                            |
  +-----------------------------------------------------------+
                               |
                               | 1
                               | hasMany (created_by)
                               |
                               | 0..*
  +-----------------------------------------------------------+
  |                          cases                            |
  +-----------------------------------------------------------+
  | PK  id                : unsigned bigint, auto-increment   |
  | UQ  case_number       : varchar(50), unique index         |
  |     patient_reference : varchar(50) (dummy code, not PII) |
  |     surgeon_name      : varchar(255)                      |
  |     implant_type      : varchar(255)                      |
  | IDX status            : enum('Draft', 'Planning',         |
  |                       :      'In Review', 'Approved',     |
  |                       :      'Completed', 'Cancelled')    |
  | IDX priority          : enum('Low', 'Medium', 'High')     |
  |     surgery_date      : date, nullable                    |
  | FK  created_by        : unsigned bigint -> users(id)      |
  |     notes             : text, nullable                    |
  |     hospital_site     : varchar(255), nullable            |
  |     created_at        : timestamp                         |
  |     updated_at        : timestamp                         |
  +-----------------------------------------------------------+

  Foreign Key Constraint:
  cases.created_by -> references users.id ON DELETE RESTRICT ON UPDATE CASCADE
```

---

## 2. Table Specifications

### Table: `users`

| Column | Type | Nullable | Default | Index / Key | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | No | AUTO_INCREMENT | PRIMARY KEY | Unique user identifier |
| `name` | `VARCHAR(255)` | No | - | - | Full legal/display name of medical professional |
| `email` | `VARCHAR(255)` | No | - | UNIQUE (`users_email_unique`) | User login credential |
| `password` | `VARCHAR(255)` | No | - | - | Salted bcrypt hashed password |
| `role` | `ENUM('admin', 'viewer', 'engineer')` | No | `'viewer'` | INDEX (`users_role_index`) | Role for authorization policies |
| `avatar_url` | `VARCHAR(500)` | Yes | NULL | - | Profile picture URL |
| `remember_token` | `VARCHAR(100)` | Yes | NULL | - | Sanctum / Laravel session token |
| `created_at` | `TIMESTAMP` | Yes | CURRENT_TIMESTAMP | - | Record creation timestamp |
| `updated_at` | `TIMESTAMP` | Yes | CURRENT_TIMESTAMP | - | Record last update timestamp |

### Table: `cases`

| Column | Type | Nullable | Default | Index / Key | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | No | AUTO_INCREMENT | PRIMARY KEY | Case internal auto-increment ID |
| `case_number` | `VARCHAR(50)` | No | - | UNIQUE (`cases_case_number_unique`) | Medical case tracking code (e.g. CASE-0001) |
| `patient_reference` | `VARCHAR(50)` | No | - | - | Dummy code for anonymized patient (e.g. PT-98214) |
| `surgeon_name` | `VARCHAR(255)` | No | - | INDEX (`cases_surgeon_name_index`) | Full name of the lead surgeon |
| `implant_type` | `VARCHAR(255)` | No | - | - | Specific implant device name (e.g. Cranial PEEK) |
| `status` | `ENUM('Draft', ...)` | No | `'Draft'` | INDEX (`cases_status_index`) | Current workflow state |
| `priority` | `ENUM('Low', 'Medium', 'High')` | No | `'Medium'` | INDEX (`cases_priority_index`) | Clinical priority |
| `surgery_date` | `DATE` | Yes | NULL | INDEX (`cases_surgery_date_index`) | Scheduled surgical procedure date |
| `created_by` | `BIGINT UNSIGNED` | No | - | FOREIGN KEY (`cases_created_by_foreign`) | References `users.id` |
| `notes` | `TEXT` | Yes | NULL | - | Clinical engineering or surgical planning notes |
| `hospital_site` | `VARCHAR(255)` | Yes | NULL | - | Medical facility / surgery center |
| `created_at` | `TIMESTAMP` | Yes | CURRENT_TIMESTAMP | - | Creation audit timestamp |
| `updated_at` | `TIMESTAMP` | Yes | CURRENT_TIMESTAMP | - | Last modification audit timestamp |

---

## 3. Indexing Strategy & Performance Rationale

1. **`cases_case_number_unique`**:
   - Ensures strict uniqueness for case identifier numbers across the entire enterprise. Prevents duplicate case generation under concurrent requests.
2. **`cases_status_index`**:
   - The dashboard executes aggregate count queries grouped by status (`COUNT(*) WHERE status = 'Planning'`), and the case listing features a status filter. An index on `status` enables fast index scans.
3. **`cases_surgeon_name_index`**:
   - Enables fast prefix search when hospital coordinators search cases by surgeon name.
4. **`cases_created_by_foreign` (with B-Tree Index)**:
   - Improves performance of joins when resolving creator relationships (`cases.created_by = users.id`) and enforces referential integrity.

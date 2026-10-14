# Traceability Matrix (Medical Software Engineering Standards)

**Standard**: IEC 62304 / ISO 13485 Medical Device Software Lifecycle Principles  
**System**: MedCase - Medical Case Management Application  
**Company**: @Jajal Medical  
**Date**: October 2026  

---

## Traceability Matrix

| ID | Requirement (input) | Implementation (output) | Verification |
| :--- | :--- | :--- | :--- |
| **REQ-001** | Admin shall be able to create a case | `CaseController@store` + `CreateCaseForm` component | Feature test: `admin_can_create_a_case` (HTTP 201) |
| **REQ-002** | Case Number shall be unique | Unique DB index (`cases_case_number_unique`) + `StoreCaseRequest` validation rule | Feature test: `creating_a_case_with_duplicate_case_number_fails` (HTTP 422) |
| **REQ-003** | Only Admin shall delete cases | `CasePolicy@delete` server-side authorization check | Feature test: `viewer_cannot_delete_a_case` (HTTP 403 Forbidden) |
| **REQ-004** | Authorized user login with email & password | `AuthController@login` + Sanctum token generation | Feature test: `valid_login_succeeds` (HTTP 200 + token issued) |
| **REQ-005** | Unauthorized login must be rejected with clear message | `AuthController@login` credential verification | Feature test: `invalid_login_is_rejected` (HTTP 422 error response) |
| **REQ-006** | Guest users cannot access case pages or API endpoints | `auth:sanctum` middleware on case routes | Feature test: `guest_cannot_open_case_pages_or_apis` (HTTP 401 Unauthenticated) |
| **REQ-007** | Dashboard shall display real-time case status breakdown | `CaseController@index` aggregate summary + `DashboardStats` component | Automated assertion verifying total, planning, in review, approved, and completed metrics |
| **REQ-008** | Case listing shall provide pagination, search, and filters | Eloquent query builder scope with search & status filters + pagination | Automated test verifying 10 items per page limit and search by case number or surgeon |
| **REQ-009** | Engineer role can create/edit cases but cannot delete cases | `CasePolicy@create`, `CasePolicy@update`, `CasePolicy@delete` | Feature test: `engineer_can_create_and_edit_but_cannot_delete` (HTTP 403 on delete) |
| **REQ-010** | Public holiday conflict detection for surgical scheduling | Nager.Date Public Holiday API client integration with timeout & error handling | Integration test verifying graceful fallback during external network timeout |

---

## Verification Summary

All listed requirements have direct corresponding implementations in both the backend application controllers/policies and frontend views, covered by feature tests in the automated test suite.

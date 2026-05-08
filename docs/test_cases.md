# Test Case Management

## Login Module

### Automated
| ID | Title | Spec File |
| --- | --- | --- |
| LMU-001 | Login page loads with required controls | `tests/auth/login.spec.ts` |
| LMU-002 | Password field masks input | `tests/auth/login.spec.ts` |
| LMU-004 | Login fails with invalid password | `tests/auth/login.spec.ts` |
| LMU-005 | Login fails with empty User Id | `tests/auth/login.spec.ts` |
| LMU-006 | Login fails with empty Password | `tests/auth/login.spec.ts` |
| LMU-007 | Both fields empty shows validations | `tests/auth/login.spec.ts` |
| LMU-008 | Forgot password navigation works | `tests/auth/forgot-password.spec.ts` |
| FP-01 | Forgot password success email request | `tests/auth/forgot-password.spec.ts` |
| FP-02 | Forgot password empty/invalid user validation | `tests/auth/forgot-password.spec.ts` |
| FP-03 | Reset flow back navigation | `tests/auth/forgot-password.spec.ts` |
| FP-04 | Login with reset password | `tests/auth/forgot-password.spec.ts` |
| LMU-012 | Mood popup loads after login | `tests/auth/login.spec.ts` |
| LMU-013 | Happy mood redirects to dashboard | `tests/auth/login.spec.ts` |
| LMU-014 | Neutral mood redirects to dashboard | `tests/auth/login.spec.ts` |
| LMU-015 | Sad mood redirects to dashboard | `tests/auth/login.spec.ts` |
| LMU-017 | Mood popup appears once per day/session | `tests/auth/login.spec.ts` |
| LMU-018 | Session established for protected URL access | `tests/auth/login.spec.ts` |

### Pending
| ID | Title | Reason |
| --- | --- | --- |
| LMU-003 | Sign in succeeds with valid credentials | Needs valid test credentials and stable test account data |

### Blocked Scenarios
| ID | Title | Reason |
| --- | --- | --- |
| LMU-009 | Microsoft login initiates SSO flow | Blocked by bug `IEJP-9314` |
| LMU-010 | Microsoft login succeeds and returns to app | Blocked by bug `IEJP-9314` |
| LMU-011 | Microsoft login canceled by user | SSO flow currently unreliable in stage |
| LMU-019 | Unauthorized access redirects to login | Stage currently shows `Invalid data` page instead of redirect |

### Manual Only
| ID | Title | Reason |
| --- | --- | --- |
| LMU-016 | Prevent proceeding without mood selection | Business rule not confirmed for strict enforcement |
| LMU-020 | Cross-browser smoke for login + mood popup | Run as release/regression cycle |
| LMU-021 | Accessibility keyboard navigation on login | Requires accessibility test instrumentation |
| LMU-022 | Accessibility mood icon operability | Requires accessibility test instrumentation |

## Dashboard Module

### Cultural Dashboard (`tests/dashboard/cultural-dashboard.spec.ts`)

| ID | Title | Status | Notes |
|----|-------|--------|-------|
| CDV-001 | Cultural dashboard loads with Cultural Activities and Procedure Misses panels | Automated | widget8 + widget9 |
| CDV-002 | Cultural Activity Summary table is visible | Automated | widget8 |
| CDV-003 | Coaching row present in summary table | Automated | Bug IEJP-9366 resolved — `test.fail` removed |
| CDV-004 | Cultural Activities heading shows current and previous year | Automated | widget8 |
| CDV-005 | Procedure Misses heading shows JUN–MAY fiscal range | Automated | widget9; date range is JUN–MAY fiscal year |
| CDV-006 | Select year 2025 updates Cultural Activities heading | Automated | widget10 year-select |
| CDV-007 | Select year 2024 updates Cultural Activities heading | Automated | widget10 year-select |
| CDV-008 | Empty-year behavior uses stable UI (soft) | Automated | soft assertions; avoids live-count brittleness |

### User Dashboard (`tests/dashboard/user-dashboard.spec.ts`)

| ID | Title | Status | Notes |
|----|-------|--------|-------|
| UDL-001 | User dashboard loads Current Year dropdown and Leave Summary | Automated | widget6 year-select + widget7 |
| UDL-002 | Current Year dropdown shows year options | Automated | widget6 `#year-select` options |
| UDY-003 | Select year 2026 updates Leave Summary heading | Automated | widget6 → widget7 |
| UDY-004 | Select year 2025 updates Leave Summary heading | Automated | widget6 → widget7 |
| UDY-005 | Select year 2024 updates Leave Summary heading | Automated | widget6 → widget7 |
| UDL-003 | Selecting 2024 updates Leave Summary heading | Automated | widget6 → widget7 |
| UDL-004 | Selecting 2026 updates Leave Summary heading | Automated | widget6 → widget7 |
| UDL-005 | Selecting 2025 updates Leave Summary heading | Automated | widget6 → widget7 |
| UDY-009 | Switching years repeatedly keeps Leave Summary heading consistent | Automated | loop: 2026 → 2025 → 2024 → 2026 |

> **Scope note:** User Dashboard tests only assert Leave Summary (widget7). Cultural Activities (widget8) and Procedure Misses (widget9) are not present in User Dashboard view and are covered exclusively by `cultural-dashboard.spec.ts`.

## Teams Module

Coverage classification pending implementation.

## WhatsApp Module

Coverage classification pending implementation.

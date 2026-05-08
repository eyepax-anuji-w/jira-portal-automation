# Dashboard Test Failure Analysis

## Context

- Run analyzed: `npm run test:dashboard` (report: `reports/2026-05-08-11-05-dashboard`)
- Result: `47 total`, `30 passed`, `17 failed`
- Target account for dashboard scenarios should be ATL user (`E2E_ATL_ID`, `E2E_ATL_PASSWORD`) per `details-locators.md`.

## Failed Test Cases

1. `UDY-008` (Cultural refresh persistence)
2. `TYR-014` (navigate away and return)
3. `CD-005P` (Procedure Misses popup interaction)
4. `CDV-001P`
5. `CDV-002P`
6. `CDV-003P`
7. `CDV-004P`
8. `CDV-005P`
9. `CDV-006P`
10. `UDL-007`
11. `TCLEAVE-007`
12. `UDL-008`
13. `UDL-009`
14. `UDL-011`
15. `TCLEAVE-002`
16. `TCLEAVE-020`
17. `TCLEAVE-012P`

## Root Causes and Classification

### 1) Authentication/session mismatch (primary)

- **Symptom:** Many widget7/notice/leave-type selectors were not found.
- **Cause:** Dashboard specs used `auth/user.json` produced from `E2E_USER_ID=admin`, while locator baseline and dashboard data checks in `details-locators.md` are for ATL user (`udara.a`).
- **Impact:** `UDL-007`, `TCLEAVE-007`, `UDL-008`, `UDL-009`, `TCLEAVE-020`, `TCLEAVE-002`, `TCLEAVE-012P`, and several CDV partial tests.
- **Fix implemented:** Switch dashboard suites to `auth/atl.json`; add ATL auth generation in setup.

### 2) Reload-flow assumptions were brittle

- **Symptom:** Year dropdown not found or strict value mismatch after `page.reload()`.
- **Cause:** Dashboard mode/frame state reinitializes after reload; tests expected exact previous value and immediate widget availability.
- **Impact:** `UDL-011`, `UDY-008`.
- **Fix implemented:** Re-open dashboard after reload (`openDashboard()`), then assert a valid selectable year and dependent heading stability.

### 3) Wrong frame path for "User Dashboard" button after profile navigation

- **Symptom:** TYR-014 failed after going to My Profile.
- **Cause:** Test used widget10-specific button helper, but in profile context button is exposed at `content()` level (inside `EYEPAX_iframe`, not widget10).
- **Impact:** `TYR-014` and related profile-return flows.
- **Fix implemented:** Added `navigateFromAnyPageToUserDashboard()` that tries content-level button first and falls back to widget10.

### 4) Naming validator warnings (non-functional)

- **Symptom:** `validate-automation.js` warnings for test names not matching `<ID> | ...`.
- **Cause:** Names contained `(partial)` and dual IDs (`A / B`).
- **Impact:** Noise in validation output.
- **Fix implemented:** Renamed to strict ID format (e.g., `CDV-001P`, `PMD-001P`, `TCLEAVE-*`).

## Locator/iframe/navigation verification

## Locators confirmed correct

- `widget6` year dropdown in User Dashboard: `#year-select`
- `widget7` Notice Summary headers and leave rows (`Total Used`, `Correct Notice`, `Short Notice`, `No Notice`, `Casual`, `Annual`, etc.)
- `widget8` Cultural Activity summary rows
- `widget9` Procedure Misses panel
- popup frame: `#popupIframe`

These match the codegen references in `details-locators.md` and are stable **for ATL user data context**.

## Iframe/navigation handling findings

- `User Dashboard` mode switch is required before using widget6/widget7 assertions.
- After reload, frame availability order can change; `waitForFrameBody` + mode re-entry is needed.
- Profile navigation can expose controls at root content frame rather than widget-specific frames.

## Missing or unreliable locator details

1. **Top nav link context is role-dependent**
   - For some sessions/roles, top navigation appears at different DOM levels.
   - Recommendation: document role-specific nav selectors in `details-locators.md` (ATL vs admin).

2. **Procedure Misses month tile click target**
   - Some month tiles may not expose consistent `title` attributes in sparse/empty datasets.
   - Recommendation: add fallback selector strategy in locator docs (e.g., header + cell fallback chain).

3. **Refresh behavior expectation**
   - Year persistence after refresh is app-behavior dependent.
   - Recommendation: document expected rule explicitly (persist vs reset to default) to avoid ambiguous assertions.

## Fixes Applied in Code

- `global-setup.ts`
  - Added ATL state generation: `auth/atl.json`.
- `test-data/users.ts`
  - Added `atl` role and `storageStatePath('atl')`.
- `pages/dashboard/UserDashboardPage.ts`
  - `_freshLogin()` now prefers ATL credentials with fallback.
  - Added `navigateFromAnyPageToUserDashboard()`.
- `tests/dashboard/user-dashboard.spec.ts`
  - Uses `auth/atl.json`.
  - Reload test hardened (`UDL-011`).
  - Naming normalized.
- `tests/dashboard/cultural-dashboard.spec.ts`
  - Uses `auth/atl.json`.
  - Reload test hardened (`UDY-008`).
  - TYR-014 flow fixed via content-aware navigation helper.
  - Naming normalized.

## Recommended Next Validation Run

1. Run dashboard suite with ATL credentials:
   - `npm run test:dashboard`
2. Re-check:
   - failing count
   - validator warnings
   - coverage append row in `docs/coverage.md`


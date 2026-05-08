---
name: Login Stabilization and Reports
overview: Stabilize the Login automation module with headed sequential execution, timestamped HTML report folders, env-driven login path, expanded login test coverage, and restructured documentation including a per-module TEST_CASES.md and updated COVERAGE.md.
todos:
  - id: config-headed-sequential
    content: "Update playwright.config.ts: dynamic HTML output folder, headless/workers env-controlled, fullyParallel false"
    status: completed
  - id: run-tests-script
    content: "Create scripts/run-tests.js: timestamped report folder, spawn playwright, update coverage"
    status: completed
  - id: pkg-scripts-crossenv
    content: "Update package.json: add test:login, test:login:headed scripts; add cross-env dependency"
    status: completed
  - id: env-login-path
    content: Update .env.example with E2E_LOGIN_PATH and HEADED; update test-data/module-urls.ts to read E2E_LOGIN_PATH from env
    status: completed
  - id: login-tests-expand
    content: Add LMU-012 through LMU-015, LMU-017, LMU-018 to tests/auth/login.spec.ts
    status: completed
  - id: forgot-password-expand
    content: Add FP-03 and FP-04 to tests/auth/forgot-password.spec.ts
    status: completed
  - id: test-cases-doc
    content: Create docs/TEST_CASES.md with full login module categorization (Automated / Pending / Blocked / Manual)
    status: completed
  - id: coverage-module-summary
    content: Expand docs/COVERAGE.md with per-module summary table and add Module column to execution history table
    status: completed
  - id: gitignore-reports
    content: Add reports/ to .gitignore
    status: completed
isProject: false
---

# Login Stabilization & Report Improvements

## Summary of Changes

| Area | What changes |
| ---- | ------------ |
| `playwright.config.ts` | Dynamic HTML output folder via env var; headed/sequential controlled via env |
| `scripts/run-tests.js` | New wrapper — computes timestamp, sets report folder, runs playwright, updates coverage |
| `package.json` | New scripts `test:login`, `test:login:headed`, update `test`, `test:headed` |
| `.env.example` | Add `E2E_LOGIN_PATH` and `HEADED` flags |
| `test-data/module-urls.ts` | Read `E2E_LOGIN_PATH` from env |
| `pages/LoginPage.ts` | Minor: use env-driven login path |
| `tests/auth/login.spec.ts` | Add LMU-012, LMU-013–015, LMU-017, LMU-018 |
| `tests/auth/forgot-password.spec.ts` | Add FP-03 (back navigation), FP-04 |
| `docs/TEST_CASES.md` | New — all login cases categorized: Automated / Pending / Manual only / Blocked |
| `docs/COVERAGE.md` | Expand with per-module section table |

---

## 1. Timestamped HTML Reports

The Playwright HTML reporter accepts `outputFolder` from config. We make it dynamic via env var `PLAYWRIGHT_HTML_OUTPUT`, set by a new wrapper script before running tests.

### `scripts/run-tests.js` (new)

```javascript
// Usage: node scripts/run-tests.js [suite] [...playwrightArgs]
// suite: login | dashboard | all
// Example: node scripts/run-tests.js login --headed

const suite = argv[0] (e.g. "login")
const timestamp = new Date() → "2026-05-07-10-30"
const folder = `reports/${timestamp}-${suite}`
process.env.PLAYWRIGHT_HTML_OUTPUT = folder
// then: spawn("playwright test", suiteArgs)
// then: run update-coverage.js
```

Report output: `reports/2026-05-07-10-30-login/index.html`

### `playwright.config.ts` — dynamic reporter output

```typescript
reporter: [
  ['html', { open: 'never', outputFolder: process.env.PLAYWRIGHT_HTML_OUTPUT ?? 'playwright-report' }],
  ['junit', { outputFile: 'test-results/junit.xml' }],
  ['allure-playwright'],
],
```

Add `reports/` to `.gitignore`.

---

## 2. Headed Sequential Execution

Controlled by env vars `HEADED=true` and `WORKERS=1` (default for local non-CI).

### `playwright.config.ts` additions

```typescript
const headed = process.env.HEADED === 'true';
const workers = process.env.WORKERS ? parseInt(process.env.WORKERS) : (isCI ? 2 : 1);

export default defineConfig({
  fullyParallel: false,          // always sequential
  workers,
  use: {
    headless: !headed,
    ...
  }
})
```

`WORKERS=1` + `fullyParallel: false` ensures one test at a time, one browser window.

### `package.json` new scripts

```json
"test:login":        "node scripts/run-tests.js login",
"test:login:headed": "cross-env HEADED=true node scripts/run-tests.js login",
"test:headed":       "cross-env HEADED=true node scripts/run-tests.js all",
```

Add `cross-env` dependency (handles Windows env var passing).

---

## 3. Env-Driven Login Path

### `.env.example` additions

```
BASE_URL=https://jira2-stage.eyepax.info
E2E_LOGIN_PATH=/app_login/
HEADED=false
```

### `test-data/module-urls.ts`

```typescript
export function loginPagePath(): string {
  return process.env.E2E_LOGIN_PATH ?? '/app_login/';
}
```

`LoginPage.gotoLogin()` already calls `loginPagePath()` — no change needed there.

---

## 4. Expanded Login Test Coverage

### Tests to add in `tests/auth/login.spec.ts`

- `LMU-012` — Mood popup loads after successful login (requires creds, skips without)
- `LMU-013` — Select Happy mood redirects to dashboard
- `LMU-014` — Select Neutral mood redirects to dashboard
- `LMU-015` — Select Sad mood redirects to dashboard
- `LMU-017` — Mood popup does not reappear on second login same day (regression)
- `LMU-018` — Session established: protected URL accessible after login

### Tests to add in `tests/auth/forgot-password.spec.ts`

- `FP-03` — Back navigation from reset page returns to login
- `FP-04` — Login with reset password (skip without creds)

### Tests to remain skipped/manual

- `LMU-009`, `LMU-010`, `LMU-011` — Microsoft SSO (external redirect, known bug IEJP-9314, blocked)
- `LMU-020` — Cross-browser (run per-release manually)
- `LMU-021`, `LMU-022` — Accessibility (manual/partial)
- `LMU-016` — Mood enforcement (partial feasibility)
- `LMU-019` — Redirect guard (skipped: stage shows "Invalid data" not redirect; see screenshot)

---

## 5. `docs/TEST_CASES.md` (new file)

Categorizes all Login module test cases from `test cases/test cases - (login).csv`:

```markdown
# Test Case Management

## Login Module

### Automated
| ID | Title | Spec file |
| -- | ----- | --------- |
| LMU-001 | Login page loads with required controls | tests/auth/login.spec.ts |
| LMU-002 | Password field masks input | ... |
| LMU-005–007 | Validation: empty fields | ... |
| LMU-012–015 | Mood popup + mood selection | ... |
| LMU-017–018 | Session / regression | ... |
| LMU-004 | Login fails with invalid password | ... |
| LMU-008, FP-01, FP-02, FP-03, FP-04 | Forgot password flow | tests/auth/forgot-password.spec.ts |

### Pending (needs credentials / env setup)
| ID | Title | Reason |
| -- | ----- | ------ |
| LMU-003 | Sign in with valid credentials | E2E_USER_ID + E2E_PASSWORD required |

### Blocked
| ID | Title | Reason |
| -- | ----- | ------ |
| LMU-009–011 | Microsoft SSO | Bug IEJP-9314 — redirects to production |
| LMU-019 | Unauthorized redirect | Stage returns "Invalid data" not /app_login/ |

### Manual Only
| ID | Title | Reason |
| -- | ----- | ------ |
| LMU-020 | Cross-browser smoke | Run per-release |
| LMU-021–022 | Accessibility | Keyboard/screen-reader tooling needed |
| LMU-016 | Enforce mood selection | Behaviour not confirmed |
```

Future module sections (Dashboard, Teams, WhatsApp, etc.) are pre-stubbed.

---

## 6. `docs/COVERAGE.md` Expansion

### Module Coverage Summary (above history table)

```markdown
## Module Coverage Summary

| Module | Total Cases | Automated | Pending | Blocked | Manual |
| ------ | ----------- | --------- | ------- | ------- | ------ |
| Login  | 22          | 14        | 1       | 3       | 4      |
| Dashboard | —        | —         | —       | —       | —      |
| Teams  | —           | —         | —       | —       | —      |
| WhatsApp | —         | —         | —       | —       | —      |
```

### Coverage History table — add Module column

The execution history table gains a **Module** column between Date and Total. The `scripts/update-coverage.js` script reads the module name from a new env var `TEST_SUITE` (set by `scripts/run-tests.js` before each run) and writes it into the row.

```markdown
| Date | Module | Total | Passed | Failed | Skipped | Notes |
| ---- | ------ | ----- | ------ | ------ | ------- | ----- |
| 2026-05-07 | login | 11 | 7 | 0 | 4 | Initial login run |
| 2026-05-07 | login + dashboard | 30 | 7 | 0 | 23 | Full suite |
```

The `run-tests.js` wrapper passes `TEST_SUITE=<suite>` when invoking `update-coverage.js`. The `update-coverage.js` script reads `process.env.TEST_SUITE` and inserts it as the second column in the row it appends.

---

## 7. `.gitignore` Update

Add `reports/` (timestamped HTML report tree).

---

## File Change Summary

- [`playwright.config.ts`](playwright.config.ts) — dynamic `outputFolder`, `headless`, `workers`, `fullyParallel: false`
- [`scripts/run-tests.js`](scripts/run-tests.js) — new wrapper (timestamp + spawn playwright + update-coverage)
- [`package.json`](package.json) — add `test:login`, `test:login:headed`, `cross-env` dep
- [`.env.example`](.env.example) — add `E2E_LOGIN_PATH`, `HEADED`
- [`test-data/module-urls.ts`](test-data/module-urls.ts) — env-driven `loginPagePath()`
- [`tests/auth/login.spec.ts`](tests/auth/login.spec.ts) — add LMU-012–015, LMU-017, LMU-018
- [`tests/auth/forgot-password.spec.ts`](tests/auth/forgot-password.spec.ts) — add FP-03, FP-04
- [`docs/TEST_CASES.md`](docs/TEST_CASES.md) — new per-module test case registry
- [`docs/COVERAGE.md`](docs/COVERAGE.md) — add module summary section + **Module column in history table**
- [`scripts/update-coverage.js`](scripts/update-coverage.js) — read `TEST_SUITE` env var and write it as the Module column
- [`.gitignore`](.gitignore) — add `reports/`

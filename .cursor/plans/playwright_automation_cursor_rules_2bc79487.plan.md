---
name: Playwright Automation Cursor Rules
overview: Create two focused Cursor rules that enforce consistent Playwright automation behavior (execution flow, reporting, coverage) and coding standards (naming, POM, selectors), plus a validation script called automatically after every test run to verify folder structure, naming conventions, and TEST_CASES.md completeness.
todos:
  - id: rule-execution
    content: "Create .cursor/rules/playwright-execution.mdc — alwaysApply: true, enforces runner usage, report generation, coverage update flow"
    status: completed
  - id: rule-standards
    content: Create .cursor/rules/playwright-standards.mdc — scoped to tests/**/*.spec.ts and pages/**/*.ts, enforces naming, POM, selectors, docs alignment
    status: completed
  - id: validate-script
    content: Create scripts/validate-automation.js — folder structure, naming convention, and TEST_CASES.md consistency checks
    status: completed
  - id: runner-update
    content: Update scripts/run-tests.js to call validate-automation.js after coverage update
    status: completed
isProject: false
---

# Playwright Automation Cursor Rules

## Deliverables

| Item | Type | Purpose |
| ---- | ---- | ------- |
| `.cursor/rules/playwright-execution.mdc` | Rule (`alwaysApply: true`) | Enforces runner usage, timestamped reports, coverage updates, dry-run guard |
| `.cursor/rules/playwright-standards.mdc` | Rule (`globs: tests/**/*.spec.ts, pages/**/*.ts`) | Enforces naming, POM, selector priority, docs alignment |
| `scripts/validate-automation.js` | New Node.js script | Validates folder structure, naming conventions, TEST_CASES.md spec file paths |
| `scripts/run-tests.js` | Update | Call `validate-automation.js` after coverage update |

---

## Rule 1 — `playwright-execution.mdc` (alwaysApply: true)

Guides the AI agent on how every test execution must be performed and what post-run checks are required.

```markdown
---
description: Enforces Playwright test execution conventions, timestamped reports, and coverage updates
alwaysApply: true
---

# Playwright Execution Conventions

## Always use the runner wrapper
- Run tests via `npm run test:login`, `npm run test:dashboard`, or `npm test` (full suite)
- NEVER run `npx playwright test` directly for module-level or full suite runs
- Direct `npx playwright test` is only for ad-hoc grep/debug runs

## After every run the framework automatically
1. Generates HTML report → `reports/YYYY-MM-DD-HH-mm-<suite>/`
2. Appends a row to `docs/COVERAGE.md` (Date | Module | Total | Passed | Failed | Skipped)
3. Runs `scripts/validate-automation.js` to check folder structure and TEST_CASES.md

## Manual overrides
- `HEADED=true` → browser visible
- `SLOW_MO=500` → slow down actions for visual monitoring
- `--list` / `--help` → dry run, no coverage update
```

---

## Rule 2 — `playwright-standards.mdc` (file-scoped)

Guides the AI agent when creating or editing spec files and page objects.

```markdown
---
description: Playwright naming, POM, and selector standards for all automation modules
globs: tests/**/*.spec.ts,pages/**/*.ts
alwaysApply: false
---

# Automation Standards

## Naming convention
- Test title: `<TestCaseId> | <Module> - <Short scenario>`
- Spec files: `tests/<module>/<feature>.spec.ts`
- Page objects: `pages/<module>/<Name>Page.ts` extending `BasePage`

## Folder structure (each new module)
1. Add URL → `test-data/module-urls.ts`
2. Add Page Object → `pages/<module>/`
3. Add spec → `tests/<module>/`
4. Register in `docs/test_cases.md`

## Selector priority (Scriptcase)
1. `getByRole` with accessible name
2. `getByLabel` / `getByPlaceholder`
3. `locator('[name="..."]')`
4. `getByText` / `filter({ hasText })`
5. Never: dynamic `id` with hash suffix, absolute XPath

## POM method style
- Methods expose business language, not raw selectors
- All iframe resolution goes through `BasePage.content()` / `grid()`

## Dashboard two-view architecture
The dashboard has two distinct views rendered in separate widget iframes. Tests must use the correct
frame and page object for each view:

**Cultural Dashboard view (default on load):**
- `widget8` — Cultural Activities (`frameCulturalActivities`)
- `widget9` — Procedure Misses (`frameProcedureMisses`)
- `widget10` — controls frame; holds `#year-select` and the "User Dashboard" button (`frameControls`)
- `CulturalDashboardPage.yearDropdown()` → inside `widget10` (controlsFrame)

**User Dashboard view (reached by clicking "User Dashboard" in widget10):**
- `widget6` — nav frame; holds `#year-select` and "Cultural Dashboard" button (`frameDashboardNav`)
- `widget7` — Leave Summary (`frameLeaveSummary`)
- `UserDashboardPage.yearDropdown()` → inside `widget6` (dashboardNavFrame)

Rules:
- Never assert `widget8` / `widget9` from a `UserDashboardPage` test
- Never use `UserDashboardPage.yearDropdown()` in a `CulturalDashboardPage` test
- `CulturalDashboardPage` overrides `yearDropdown()` to point to `widget10`
- `openDashboard()` in `CulturalDashboardPage` must NOT click "User Dashboard"
- `openDashboard()` in `UserDashboardPage` must click "User Dashboard" if currently in Cultural mode

## Docs alignment
- Every automated test must appear in `docs/test_cases.md`
- Blocked/skipped tests must have a reason string in `test.skip()` / `test.fail()`
```

---

## Validation Script — `scripts/validate-automation.js`

Called by `run-tests.js` after coverage update. Performs three checks and prints warnings (does not block the run).

### Check 1 — Folder structure
- Every `tests/<module>/` must have a matching `pages/<module>/` directory
- Spec file names must end in `.spec.ts`

### Check 2 — Naming conventions
- Every `test('...')` and `test.describe('...')` in `tests/auth/` must match `/^[A-Z]+-\d+\s*\|/` (TestCaseId prefix)
- Warns if any test title in `tests/**/*.spec.ts` is missing the `ID | Module - Scenario` pattern

### Check 3 — test_cases.md consistency
- For every spec file in `tests/`, verify the filename is referenced at least once in `docs/test_cases.md`
- Warns if a spec file is present but not registered

### Output
- Prints `[validate] OK` if all checks pass
- Prints `[validate] WARN: <message>` for each violation (non-blocking)

---

## Update to `scripts/run-tests.js`

Call validator **after** the coverage update and **before** any `process.exit` checks.
The validator is warn-only — its exit code is intentionally ignored so it never blocks CI.

```javascript
const coverageExit = run('node', ['scripts/update-coverage.js'], coverageEnv);
run('node', ['scripts/validate-automation.js'], process.env); // warn-only, exit code ignored

if (testExit !== 0) process.exit(testExit);
if (coverageExit !== 0) process.exit(coverageExit);
```

---

## File Change Summary

- [`c:\Eyepax\Projects\Jira Portal\.cursor\rules\playwright-execution.mdc`](.cursor/rules/playwright-execution.mdc) — new rule, always applies
- [`c:\Eyepax\Projects\Jira Portal\.cursor\rules\playwright-standards.mdc`](.cursor/rules/playwright-standards.mdc) — new rule, scoped to spec/page files
- [`c:\Eyepax\Projects\Jira Portal\scripts\validate-automation.js`](scripts/validate-automation.js) — new validation script
- [`c:\Eyepax\Projects\Jira Portal\scripts\run-tests.js`](scripts/run-tests.js) — call validator after coverage update

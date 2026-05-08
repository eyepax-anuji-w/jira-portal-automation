# Test Writing Guidelines & Test Case Standards

> Canonical file path: `docs/test_guidlines.md` (kept as-is for backward compatibility).

## Test Case ID in Title

Every automated case derived from `test cases/` should prefix the title:

```text
<TestCaseId> | <Module> - <Short scenario>
```

Example: `UDY-003 | User Dashboard - Year 2026 updates leave summary heading`

Use `test.describe` blocks to group by module or CSV section.

---

## Assertions

- Prefer `expect` on visible text/role: `toHaveText`, `toContainText`, `toBeVisible`.
- For multiple independent checks in one test, use `expect.soft()` so all run.
- Avoid strict numeric equality for **live** dashboard counts unless the test user’s data is locked; use ranges or relative checks when documented in `test-data/expected-values.ts`.

---

## Known Failures & Bugs

```typescript
// Document Jira and keep test executable but marked
test.fail(true, 'Bug IEJP-XXXX — description');
test('CDV-XXX | ...', async ({ page }) => { /* ... */ });
```

Or `test.skip(condition, 'reason')` for environment-specific skips.

> **IEJP-9366** (Sit-with count mismatch) — resolved. `test.fail` annotation removed from CDV-003.

---

## Selector Priority (Scriptcase)

1. `getByRole('button', { name: '...' })` / other roles with accessible name  
2. `getByLabel` / `getByPlaceholder`  
3. `locator('[name="field_name"]')`  
4. `getByText` / `filter({ hasText })` for static copy  
5. Container-scoped CSS (e.g. panel + child)  
6. **Do not** use auto-generated `id` with random suffix, or brittle absolute XPath  

---

## Iframes

- Never hardcode long `frameLocator` chains in specs.
- Use `BasePage` → `content()` / `grid()` or `frame-helper` utilities.
- After navigation, wait for the target frame’s `body` (or a known stable locator) before acting.

### Dashboard widget frames

The dashboard has two mutually exclusive views. Widget numbering changes between views:

| View | Year-select frame | Content frames |
|------|------------------|----------------|
| Cultural Dashboard (default) | `dbifrm_widget10` | widget8 (Cultural Activities), widget9 (Procedure Misses) |
| User Dashboard | `dbifrm_widget6` | widget7 (Leave Summary) |

Page Object rules:
- `CulturalDashboardPage.yearDropdown()` → widget10
- `UserDashboardPage.yearDropdown()` → widget6
- Never assert widget8/widget9 from a `UserDashboardPage` test — those frames do not exist in that view.

### Session expiry

When `/EYEPAX/` returns "Invalid data", the PHP session has expired. `openDashboard()` detects this automatically and calls `_freshLogin()`. No manual intervention needed; the test will recover and continue. If credentials are missing from `.env`, the fallback will silently fail.

---

## Flakiness

- Do **not** use `page.waitForTimeout()` for readiness; use `expect(locator).toBeVisible()` or `waitForLoadState` where appropriate.  
- For Scriptcase XHR bursts, `waitForLoadState('networkidle')` may be used sparingly after major navigation (document why in a comment if used).

---

## Data & Secrets

- Credentials: only from `.env` / CI secrets, loaded via `test-data/users.ts`.  
- Never commit `.env` or `auth/*.json`.

---

## Running Subsets

```bash
# Preferred (runner-based: timestamped reports + coverage update)
npm run test:login
npm run test:login:headed
npm run test:dashboard

# Direct Playwright (debug/ad-hoc; does not run wrapper coverage flow)
npx playwright test --grep "LMU"
npx playwright test tests/auth/login.spec.ts
```

---

## Login Selector Stability

For Scriptcase reset forms, plain `.fill()` may intermittently fail to persist in the target textbox (observed in `FP-01`).
Use this stable pattern before submit:

```typescript
await input.click();
await input.fill('');
await input.type(value, { delay: 20 });
await expect(input).toHaveValue(value); // verify before clicking OK
```

---

## Locator Maintenance

- When the UI changes, update **one** Page Object file for that module.  
- Re-run `npm run codegen` for a short session; diff against the Page Object, not the spec.  
- Keep `docs/video-analysis/` notes aligned with complex flows.

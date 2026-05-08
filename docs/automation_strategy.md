# Complete Automation Strategy — Jira Portal (Hybrid)

## Purpose

This document finalizes the **Hybrid** UI automation strategy for the Scriptcase-based JIRA Portal using **Playwright (TypeScript)**. It combines:

| Layer | Role |
| ----- | ---- |
| **Discovery (Approach B)** | `playwright codegen`, dev-only discovery scripts, rapid iframe/selector mapping |
| **Structure (Approach A)** | Page Object Model, fixtures, shared utilities, CI-ready reporting |

See also: [ui automation strategy.md](./ui%20automation%20strategy.md) for the original two-pillar comparison.

---

## Goals

1. Automate manual cases from `test cases/` and recordings with traceability (test IDs in titles).
2. Maintain stable selectors despite Scriptcase-generated HTML (nested iframes, dynamic IDs).
3. Support multi-role flows (User, Supervisor, Admin) via `storageState`.
4. Produce **HTML + JUnit + Allure** artifacts and append execution summaries to [COVERAGE.md](./COVERAGE.md).

---

## Hybrid Selector Lifecycle

1. Run `npm run codegen` (or `npx playwright codegen <BASE_URL>/app_login/`) for a new module.
2. Paste raw output into `utils/selector-discovery.ts` **temporarily** or keep notes in `docs/video-analysis/`.
3. Refine locators per [TEST_GUIDELINES.md](./TEST_GUIDELINES.md) (role/label/name/text; avoid hashed IDs).
4. Move **only** stable locators into `pages/<module>/` Page Objects.
5. Centralize routes in `test-data/module-urls.ts` — specs never hardcode full URLs.

---

## Phased Implementation

| Phase | Status | Scope |
| ----- | ------ | ----- |
| **1** | COMPLETE | Config, fixtures, frame helpers, Login/User dashboard page objects, docs, coverage script |
| **2** | COMPLETE | Login specs (`login.spec.ts`, `forgot-password.spec.ts`) stable with terminal list output and timestamped reports |
| **3** | COMPLETE | Dashboard specs (`cultural-dashboard.spec.ts`, `user-dashboard.spec.ts`) — 19 cases passing; correct widget frame mapping confirmed via codegen; session fallback added; Allure reporter wired |
| **4** | IN PROGRESS | Teams, Clockwise, Leave History; GitHub Actions CI; visual snapshots; expand from XLSX |

---

## Risk Register

| Risk | Mitigation |
| ---- | ---------- |
| Nested Scriptcase iframes | Single path in `utils/frame-helper.ts`; Page Objects use `BasePage` only |
| Dynamic `id` attributes | Prefer `name`, `aria-*`, role+name, scoped text |
| Slow PHP/XHR | `actionTimeout` / `navigationTimeout`; wait on frame body, not arbitrary sleeps |
| Flaky data (CDV) | Dedicated test user + `expected-values.ts`; soft assertions where appropriate |
| Known bugs | `test.fail` / `test.skip` with Jira key (e.g. IEJP-9366) |

---

## Execution Commands

```bash
npm test                               # full suite (login + dashboard) with timestamped report
npm run test:login                     # login module only
npm run test:login:headed              # login module with visible browser
npm run test:headed                    # full suite with visible browser
npm run test:ui                        # Playwright UI mode
npm run test:grep -- "LMU"             # filter by test ID/name

# optional runtime tuning from env
# HEADED=true SLOW_MO=500 WORKERS=1
```

---

## Test Runner Wrapper

The project uses `scripts/run-tests.js` as the primary runner for normal executions:

- Sets `PLAYWRIGHT_HTML_OUTPUT=reports/<timestamp>-<suite>` so each run has its own HTML report folder
- Runs Playwright for selected suite (`login`, `dashboard`, or `all`)
- Sets `TEST_SUITE` and runs `scripts/update-coverage.js` to append coverage history rows
- Skips coverage update automatically when running dry commands like `--list` or `--help`

---

## References

- [ARCHITECTURE.md](./ARCHITECTURE.md) — layout and components  
- [test_guidlines.md](./test_guidlines.md) — standards and selectors  
- [TEST_CASES.md](./TEST_CASES.md) — module-wise automation coverage and status  
- [COVERAGE.md](./COVERAGE.md) — run history  

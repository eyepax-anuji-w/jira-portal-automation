# Coverage History

Execution summaries are appended by `npm run coverage:update` (reads `test-results/junit.xml`). Run after each meaningful execution.

## Module Coverage Summary

| Module | Total Cases | Automated | Pending | Blocked | Manual |
| ---- | ---- | ---- | ---- | ---- | ---- |
| Login | 22 | 17 | 1 | 4 | 4 |
| Dashboard (Cultural) | 23 | 23 | 0 | 0 | 0 |
| Dashboard (User) | 24 | 24 | 0 | 0 | 0 |
| Teams | - | - | - | - | - |
| WhatsApp | - | - | - | - | - |

## Execution History

| Date | Module | Total | Passed | Failed | Skipped | Notes |
| ---- | ---- | ----- | ------ | ------ | ------- | ----- |
| 2026-05-07 | login + dashboard | 30 | 7 | 0 | 23 | Initial run (no E2E creds: dashboard suite skipped; LMU-019 env skip) |
| 2026-05-07 | login | 19 | 13 | 1 | 5 | junit.xml |
| 2026-05-07 | login | 19 | 13 | 0 | 6 | junit.xml |
| 2026-05-07 | login | 19 | 14 | 0 | 5 | junit.xml |
| 2026-05-07 | login | 19 | 14 | 0 | 5 | junit.xml |
| 2026-05-07 | dashboard | 1 | 0 | 1 | 0 | junit.xml |
| 2026-05-07 | dashboard | 1 | 0 | 1 | 0 | junit.xml |
| 2026-05-07 | dashboard | 1 | 0 | 1 | 0 | junit.xml |
| 2026-05-07 | dashboard | 1 | 0 | 1 | 0 | junit.xml |
| 2026-05-07 | dashboard | 1 | 0 | 0 | 0 | junit.xml |
| 2026-05-07 | dashboard | 1 | 0 | 0 | 0 | junit.xml |
| 2026-05-07 | dashboard | 1 | 0 | 0 | 0 | junit.xml |
| 2026-05-07 | dashboard | 1 | 0 | 0 | 0 | junit.xml |
| 2026-05-07 | dashboard | 1 | 0 | 0 | 0 | junit.xml |
| 2026-05-07 | dashboard | 1 | 0 | 0 | 0 | junit.xml |
| 2026-05-07 | dashboard | 1 | 1 | 0 | 0 | junit.xml |
| 2026-05-07 | dashboard | 19 | 19 | 0 | 0 | junit.xml |
| 2026-05-07 | login | 19 | 14 | 0 | 5 | junit.xml |
| 2026-05-07 | dashboard | 19 | 15 | 4 | 0 | UDY-003/004/005/009 failing (widget8 assertions invalid in User Dashboard view) |
| 2026-05-07 | dashboard | 19 | 19 | 0 | 0 | All 19 dashboard cases passing after widget frame + year-select mapping fixes |
| 2026-05-08 | dashboard | 47 | 30 | 7 | 0 | junit.xml |

---

## How to Update

1. Run tests via runner: `npm test`, `npm run test:login`, or `npm run test:dashboard`.
2. Ensure `test-results/junit.xml` exists (JUnit reporter in `playwright.config.ts`).
3. `scripts/run-tests.js` sets `TEST_SUITE` and then calls `npm run coverage:update`.
4. Optional: archive HTML report from `reports/<timestamp>-<suite>/`.

---

## Coverage Interpretation

This log tracks **automated test execution counts**, not code coverage %. Module expansion increases **Total** over time as specs are added from `test cases/` and recordings.

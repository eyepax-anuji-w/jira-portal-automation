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

Selectors and iframe chains follow [`details-locators.md`](../details-locators.md): `EYEPAX_iframe` → `dbifrm_widget6` (User Dashboard controls), `widget7` Leave Summary, `widget8` Cultural Activities, `widget9` Procedure Misses, `widget10` Cultural mode controls, `#popupIframe` overlays.

### Cultural Dashboard (`tests/dashboard/cultural-dashboard.spec.ts`)

| ID | Title | Status | Notes |
|----|-------|--------|-------|
| CD-001 | Loads Cultural Activities and Procedure Misses panels | Automated | widget8 + widget9 |
| CD-003 | Most Recent Events + summary table structure | Automated | widget8 |
| CD-002 | Current Year dropdown visible | Automated | widget10 `#year-select` |
| CD-004 | Procedure Misses: Top 3 section + monthly strip | Automated | widget9 |
| CD-005 (partial) | Month interaction opens overlay popup | Automated | widget9 → `#popupIframe` |
| UDY-006 | Procedure Misses fiscal heading updates with year | Automated | `HEADING_PATTERNS.procedureMisses` |
| UDY-007 | Cultural summary + Procedure Misses year labels refresh | Automated | widget8 / widget9 column headers |
| UDY-008 | Selected year persists after browser refresh | Automated | widget10 |
| TYR-014 | Year persists after My Profile → User Dashboard → Cultural Dashboard | Automated | widget10 ↔ widget6 navigation |
| CDV-001 | Coaching Conducted row visible | Automated | widget8 grid row |
| CDV-002 | Coaching Participated row visible | Automated | widget8 |
| CDV-003 | Sit-with Conducted row visible | Automated | widget8 |
| CDV-004 | Sit-with Participated row visible | Automated | widget8 |
| CDV-005 | 1 on 1 Conducted row visible | Automated | widget8 |
| CDV-006 | 1 on 1 Participated row visible | Automated | widget8 |
| CDV-007 | Year switch updates Cultural Activities headings | Automated | widget10 → widget8 |
| CDV-008 | Empty-year UI stable (soft) | Automated | widget8 table |
| CDV-001 (partial) | Coaching Sessions — As a Coach grid loads | Automated (partial) | Structural; count parity not asserted |
| CDV-002 (partial) | Coaching Sessions — As a Coachee grid loads | Automated (partial) | Same |
| CDV-003 (partial) | Sit-with — As a Supervisor grid loads | Automated (partial) | Same |
| CDV-004 (partial) | Sit-with — As a Participant grid loads | Automated (partial) | Same |
| CDV-005 (partial) | 1 on 1 — supervisor tab grid loads | Automated (partial) | Same |
| CDV-006 (partial) | 1 on 1 — participant tab grid loads | Automated (partial) | Same |

### User Dashboard (`tests/dashboard/user-dashboard.spec.ts`)

| ID | Title | Status | Notes |
|----|-------|--------|-------|
| UDL-001 | Loads Current Year dropdown and Leave Summary | Automated | widget6 + widget7 |
| UDL-002 | Current Year dropdown shows year options | Automated | widget6 `#year-select` |
| UDL-003 … UDL-005 | Leave Summary heading for 2024 / 2026 / 2025 | Automated | widget6 → widget7 |
| UDY-003 … UDY-005 | Same (duplicate CSV IDs) | Automated | widget6 → widget7 |
| UDY-009 | Repeated year switches keep Leave Summary consistent | Automated | widget7 |
| UDL-006 | Notice Summary “No Records Found” for 2024 (soft) | Automated | widget7; data-dependent |
| UDL-007 | Notice Summary column groups (Total Used / Correct / Short / No Notice) | Automated | widget7 |
| TC-LEAVE-007 | Notice headers + year sub-columns | Automated | widget7 |
| UDL-008 / TC-LEAVE-009 | Leave type rows (Casual, Annual, Medical, Lieu, No-Pay) | Automated | widget7 |
| UDL-009 | Notice year columns refresh when year changes | Automated | widget7 |
| UDL-010 | Rapid year switching + Notice Summary stable | Automated | widget7 |
| UDL-011 | Selected year + heading after page reload | Automated | widget6 |
| TC-LEAVE-002 | Top navigation links visible | Automated | page chrome |
| TC-LEAVE-005 | Upcoming leaves / pending message visible | Automated | widget7 banner |
| TC-LEAVE-010 | User Profile button leaves dashboard view | Automated | widget6 |
| TC-LEAVE-011 | Cultural Dashboard button shows widget8 | Automated | widget6 → widget8 |
| TC-LEAVE-020 | Leave type link opens `#popupIframe` with Close | Automated | widget7 + popup |
| TC-LEAVE-012 (partial) | My Leave History table loads | Automated (partial) | Profile navigation |
| PMD-001 (partial) | Procedure Misses report grid from ClockWise | Automated (partial) | widget2 table smoke |

### User Dashboard — authorization (`tests/dashboard/user-dashboard.spec.ts`)

| ID | Title | Status | Notes |
|----|-------|--------|-------|
| UDL-013 | `/EYEPAX/` not usable when logged out | Automated | Empty `storageState`; expects login or denied |

### Dashboard — manual / not UI-automated / pending product rules

| ID | Source CSV | Classification | Reason |
|----|------------|----------------|--------|
| UDY-001 … UDY-005, UDY-008, UDY-009, UDY-010, TYR-014 | Change year / User dash CSV | Covered by automated equivalents where noted | UDY-010 negative year: partial UI only |
| UDY-013 | Cross-browser year switch | Manual | Release matrix per `test cases` CSV |
| UDY-014, TYR-015, UDL-012 | Keyboard a11y | Manual | Dedicated a11y tooling |
| UDY-003 … UDY-005 (Culture headings) | Culture + year | Covered | See UDY-006/007 in cultural spec |
| CD-005 full drill | Dashboard vs ClockWise sum | Partial / manual | Long multi-step reconciliation; dynamic data |
| PMD-002 … PMD-007 | Month vs report totals | Manual / data-dependent | Count parity needs stable dataset |
| TC-LEAVE-012 full | Dashboard vs My Leave History sums | Partial | Needs controlled leave data + filters |
| TC-LEAVE-013 … TC-LEAVE-018 | Reconciliation & boundary rules | Pending / manual | Cancelled-leave rule, rounding, cross-year split need AC |
| TC-LEAVE-019 | Two-user leakage | Blocked | Needs second stored auth (`auth/supervisor.json`) |
| TC-LEAVE-020 full | Popup vs leave report parity | Partial | IEJP-9367 navigation bug noted in CSV |

> **Scope note:** On **User Dashboard** view, automated assertions focus on Leave Summary + Notice Summary (widget7) and navigation from widget6. **Cultural Dashboard** view covers widget8–widget10 via `cultural-dashboard.spec.ts`.

## Teams Module

Coverage classification pending implementation.

## WhatsApp Module

Coverage classification pending implementation.

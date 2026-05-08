# UI Automation Strategy – Scriptcase JIRA Portal

## 1. Introduction

This document explains two approaches for implementing UI automation for the Scriptcase-based JIRA Portal using Playwright (TypeScript).

---

## 2. Approach A – Structured Automation Framework

### Overview

Approach A is a scalable and structured automation framework designed to convert existing manual test cases into automated tests. It is suitable for long-term use and full system coverage.

### How It Works

**1. Discovery**
- Use Playwright codegen to record user actions
- Capture:
  - Selectors
  - iframe structures
  - Navigation flows
- Analyze:
  - Existing test cases
  - Walkthrough videos
- Identify expected outputs and edge cases

**2. Automation Development**
- Convert recorded scripts into structured tests using:
  - Page Object Model (POM)
- Each manual test case becomes:
  - An automated test with assertions
- Known bugs are:
  - Tagged and skipped until fixed

**3. Expansion & Maintenance**
- Gradually automate all modules
- Add:
  - Visual regression checks (UI snapshots)
- Maintain:
  - Stable selectors (avoid dynamic IDs)

### Key Features

- Handles nested iframes natively
- Multi-user testing (Admin, User, Supervisor) using session reuse
- Uses stable selectors (text, labels, aria attributes)
- Supports CI/CD integration and automated reporting

### Benefits

- High scalability
- Full regression coverage
- Maintainable test structure
- Production-ready automation

### Limitations

- Higher initial setup time
- Requires structured implementation effort

---

## 3. Approach B – Lightweight Practical Automation

### Overview

Approach B is a simple and fast implementation approach focused on automating critical user flows. It is ideal for quick results and initial validation.

### How It Works

**1. Test Creation**
- Write scripts for key flows:
  - Login
  - Navigation
  - Dashboard access
  - Basic operations

**2. Helper Utilities**
- Create reusable functions for:
  - Login handling
  - Navigation
  - iframe interaction

**3. Environment Configuration**
- Use `.env` files to store:
  - URLs
  - Credentials
- Enables running tests across environments

**4. Selector Strategy**
- Use:
  - Visible text
  - Labels
  - Button names
- Handle iframe complexity using helper functions

**5. Test Execution**
- Run tests in:
  - Headless mode (CI)
  - Headed mode (debugging)
  - UI mode (interactive)

### Additional Tools

- **Codegen** – records user actions
- **Discovery scripts** – help identify selectors

### Benefits

- Quick setup
- Easy to implement
- Suitable for demos and smoke testing

### Limitations

- Limited coverage
- Less structured
- Requires manual updates when UI changes

---

## 4. Comparison of Approaches

| Feature        | Approach A            | Approach B      |
| -------------- | --------------------- | --------------- |
| Structure      | High (POM)            | Low             |
| Coverage       | Full system           | Critical paths  |
| Setup Time     | Longer                | Faster          |
| Scalability    | High                  | Medium          |
| Maintenance    | Easier long-term      | Manual          |
| CI/CD          | Fully supported       | Optional        |

---

## 5. Recommendation

- Use **Approach B** for:
  - Initial setup
  - Quick validation
  - Demonstrations

- Transition to **Approach A** for:
  - Full automation coverage
  - Long-term maintainability
  - CI/CD integration

> **Recommended strategy:** Start simple (Approach B) → Gradually evolve into structured automation (Approach A)

---

## 6. Conclusion

Both approaches enable effective UI automation without source code access by leveraging Playwright's browser-based capabilities.

- **Approach A** ensures scalability and long-term reliability
- **Approach B** provides fast and practical implementation

A combined approach allows achieving both quick results and sustainable automation.

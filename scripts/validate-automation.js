/**
 * Post-run validation for Playwright automation (warn-only).
 * Checks: folder structure vs tests/modules, naming prefixes in tests/auth,
 * and that each spec filename appears in docs/test_cases.md (Linux-safe path).
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const TESTS_DIR = path.join(ROOT, 'tests');
const PAGES_DIR = path.join(ROOT, 'pages');
const TEST_CASES_MD = path.join(ROOT, 'docs', 'test_cases.md');

const AUTH_TESTCASE_PREFIX = /^[A-Z]+-\d+\s*\|/;
const TITLE_PATTERN_DOC = /^[A-Z]+-\d+\s*\|/;

function listDirs(absDir) {
  if (!fs.existsSync(absDir)) return [];
  return fs
    .readdirSync(absDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function collectSpecFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) collectSpecFiles(full, acc);
    else if (ent.isFile() && ent.name.endsWith('.spec.ts')) acc.push(full);
  }
  return acc;
}

function extractTestCaseTitles(source) {
  const titles = [];
  // Only `test('...')` / `test.only(...)` — not `test.describe` (group labels are free-form).
  const re =
    /\btest\s*(?:\.(?:only|skip|fixme))?\s*\(\s*(['"`])([\s\S]*?)\1/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    titles.push(m[2]);
  }
  return titles;
}

function checkFolderStructure(warnings) {
  const modules = listDirs(TESTS_DIR);
  for (const mod of modules) {
    const modPages = path.join(PAGES_DIR, mod);
    if (fs.existsSync(modPages)) continue;

    // Legacy: login lives at pages/LoginPage.ts for auth module
    if (mod === 'auth' && fs.existsSync(path.join(PAGES_DIR, 'LoginPage.ts'))) {
      continue;
    }

    warnings.push(
      `[validate] WARN: tests/${mod}/ exists but pages/${mod}/ is missing (add pages/${mod}/ or align structure).`,
    );
  }
}

function checkAuthNaming(warnings) {
  const authSpecs = collectSpecFiles(path.join(TESTS_DIR, 'auth'));
  for (const file of authSpecs) {
    const src = fs.readFileSync(file, 'utf8');
    const titles = extractTestCaseTitles(src);
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    for (const t of titles) {
      if (!AUTH_TESTCASE_PREFIX.test(t.trim())) {
        warnings.push(
          `[validate] WARN: ${rel} — title/describe "${t.slice(0, 80)}${t.length > 80 ? '…' : ''}" should start with TestCaseId prefix (e.g. LMU-001 | ...).`,
        );
      }
    }
  }
}

function checkSpecTitlesGlobally(warnings) {
  const allSpecs = collectSpecFiles(TESTS_DIR);
  for (const file of allSpecs) {
    if (file.replace(/\\/g, '/').includes('/tests/auth/')) continue;
    const src = fs.readFileSync(file, 'utf8');
    const titles = extractTestCaseTitles(src);
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    for (const t of titles) {
      const trimmed = t.trim();
      if (!TITLE_PATTERN_DOC.test(trimmed)) {
        warnings.push(
          `[validate] WARN: ${rel} — "${trimmed.slice(0, 72)}${trimmed.length > 72 ? '…' : ''}" should match "<ID> | ..." pattern.`,
        );
      }
    }
  }
}

function checkTestCasesDoc(warnings) {
  let doc = '';
  try {
    doc = fs.readFileSync(TEST_CASES_MD, 'utf8');
  } catch {
    warnings.push(
      `[validate] WARN: Missing ${path.relative(ROOT, TEST_CASES_MD)} — create it for CI/Linux path checks.`,
    );
    return;
  }

  const specs = collectSpecFiles(TESTS_DIR);
  for (const abs of specs) {
    const base = path.basename(abs);
    const posixRel = path.relative(ROOT, abs).replace(/\\/g, '/');
    if (!doc.includes(base) && !doc.includes(posixRel)) {
      warnings.push(
        `[validate] WARN: Spec "${posixRel}" not referenced in docs/test_cases.md (mention filename or path).`,
      );
    }
  }
}

function main() {
  const warnings = [];
  checkFolderStructure(warnings);
  checkAuthNaming(warnings);
  checkSpecTitlesGlobally(warnings);
  checkTestCasesDoc(warnings);

  if (warnings.length === 0) {
    // eslint-disable-next-line no-console
    console.log('[validate] OK');
    process.exit(0);
    return;
  }
  for (const w of warnings) {
    // eslint-disable-next-line no-console
    console.warn(w);
  }
  process.exit(1);
}

main();

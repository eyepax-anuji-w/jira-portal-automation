/**
 * Appends a row to docs/COVERAGE.md from test-results/junit.xml (after Playwright run).
 */
const fs = require('fs');
const path = require('path');

const junitPath = path.join(process.cwd(), 'test-results', 'junit.xml');
const coveragePath = path.join(process.cwd(), 'docs', 'COVERAGE.md');

function parseTestsuiteAttrs(attrs) {
  const num = (name) => {
    const x = new RegExp(`${name}="(\\d+)"`).exec(attrs);
    return x ? parseInt(x[1], 10) : 0;
  };
  const tests = num('tests');
  const failures = num('failures');
  const skipped = num('skipped') || num('disabled');
  const errors = num('errors');
  const passed = Math.max(0, tests - failures - skipped - errors);
  return { tests, failures, skipped, passed };
}

function parseJUnitSummary(xml) {
  const root = xml.match(/<testsuites\s+([^>]+)>/);
  if (root) return parseTestsuiteAttrs(root[1]);
  const first = xml.match(/<testsuite\s+([^>]+)>/);
  if (!first) return null;
  return parseTestsuiteAttrs(first[1]);
}

function insertCoverageRow(md, rowLine) {
  const lines = md.split('\n');
  const sepIdx = lines.findIndex((l) => /^\|\s*Date\s*\|\s*Module\s*\|/.test(l));
  if (sepIdx === -1) return md + `\n${rowLine}\n`;

  let insertAt = sepIdx + 2;
  while (insertAt < lines.length && /^\| /.test(lines[insertAt])) {
    insertAt++;
  }
  lines.splice(insertAt, 0, rowLine);
  return lines.join('\n');
}

function main() {
  if (!fs.existsSync(junitPath)) {
    console.warn('[coverage:update] No test-results/junit.xml — run `npm test` first.');
    process.exit(0);
  }

  const xml = fs.readFileSync(junitPath, 'utf8');
  const parsed = parseJUnitSummary(xml);
  if (!parsed || !parsed.tests) {
    console.warn('[coverage:update] Could not parse junit.xml');
    process.exit(0);
  }

  const date = new Date().toISOString().slice(0, 10);
  const moduleName = process.env.TEST_SUITE ?? 'unspecified';
  const { tests, passed, failures, skipped } = parsed;
  const rowLine = `| ${date} | ${moduleName} | ${tests} | ${passed} | ${failures} | ${skipped} | junit.xml |`;

  let md = fs.readFileSync(coveragePath, 'utf8');
  md = insertCoverageRow(md, rowLine);
  fs.writeFileSync(coveragePath, md, 'utf8');
  console.log('[coverage:update] Inserted row:', rowLine);

  const snapshotDir = path.join(process.cwd(), 'coverage-reports', date);
  const reportDir = path.join(process.cwd(), 'playwright-report');
  if (fs.existsSync(reportDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
    const marker = path.join(snapshotDir, 'README.txt');
    fs.writeFileSync(
      marker,
      `Snapshot placeholder for ${date}. Copy playwright-report/ here after runs if you want dated HTML archives.\n`,
      'utf8'
    );
  }
}

main();

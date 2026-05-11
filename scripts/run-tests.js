const { spawnSync } = require('child_process');

function pad(n) {
  return String(n).padStart(2, '0');
}

function timestampString(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(
    date.getHours()
  )}-${pad(date.getMinutes())}`;
}

function suiteArgs(suite) {
  if (suite === 'login') return ['tests/auth/'];
  if (suite === 'dashboard') return ['tests/dashboard/'];
  if (suite === 'teams') return ['tests/teams/'];
  if (suite === 'sitwith') return ['tests/sitwith/'];
  return [];
}

function suiteLabel(suite) {
  if (suite === 'all') return 'login + dashboard + teams + sitwith';
  return suite;
}

function run(command, args, env) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env,
    shell: process.platform === 'win32',
  });
  return result.status ?? 1;
}

function main() {
  const [, , suiteArg = 'all', ...extraArgs] = process.argv;
  const suite = ['login', 'dashboard', 'teams', 'sitwith', 'all'].includes(suiteArg) ? suiteArg : 'all';
  const isDryRun = extraArgs.includes('--list') || extraArgs.includes('--help');

  const stamp = timestampString(new Date());
  const reportFolder = `reports/${stamp}-${suite}`;

  const runEnv = {
    ...process.env,
    PLAYWRIGHT_HTML_OUTPUT: reportFolder,
  };

  const playwrightArgs = ['playwright', 'test', ...suiteArgs(suite), ...extraArgs];
  const testExit = run('npx', playwrightArgs, runEnv);
  if (isDryRun) process.exit(testExit);

  const coverageEnv = {
    ...process.env,
    TEST_SUITE: suiteLabel(suite),
    PLAYWRIGHT_HTML_OUTPUT: reportFolder,
  };
  const coverageExit = run('node', ['scripts/update-coverage.js'], coverageEnv);

  // Warn-only post-run checks (exit code ignored so CI is not blocked).
  run('node', ['scripts/validate-automation.js'], process.env);

  if (testExit !== 0) process.exit(testExit);
  if (coverageExit !== 0) process.exit(coverageExit);
}

main();

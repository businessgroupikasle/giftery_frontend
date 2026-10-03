import { readFile, writeFile, mkdir } from 'node:fs/promises';

const input = new URL('../test-results/playwright-results.json', import.meta.url);
const output = new URL('../test-results/playwright-summary.md', import.meta.url);
const report = JSON.parse(await readFile(input, 'utf8'));
const rows = [];

const visitSuite = (suite, parents = []) => {
  const path = [...parents, suite.title].filter(Boolean);
  for (const spec of suite.specs || []) {
    for (const test of spec.tests || []) {
      const results = test.results || [];
      const last = results.at(-1) || {};
      rows.push({
        suite: path.join(' > '),
        title: spec.title,
        status: test.status || last.status || 'unknown',
        duration: results.reduce((sum, result) => sum + (result.duration || 0), 0),
        retries: Math.max(0, results.length - 1),
        project: test.projectName || '',
      });
    }
  }
  for (const child of suite.suites || []) visitSuite(child, path);
};

for (const suite of report.suites || []) visitSuite(suite);
const passed = rows.filter((row) => row.status === 'expected').length;
const failed = rows.filter((row) => !['expected', 'skipped'].includes(row.status)).length;
const skipped = rows.filter((row) => row.status === 'skipped').length;
const duration = rows.reduce((sum, row) => sum + row.duration, 0);
const slowest = [...rows].sort((a, b) => b.duration - a.duration).slice(0, 10);
const resultLabel = failed === 0 ? 'PASS' : 'FAIL';

const markdown = [
  '# GIFTERY Playwright Execution Report',
  '',
  `- **Result:** ${resultLabel}`,
  `- **Generated:** ${new Date().toISOString()}`,
  `- **Total:** ${rows.length}`,
  `- **Passed:** ${passed}`,
  `- **Failed:** ${failed}`,
  `- **Skipped:** ${skipped}`,
  `- **Cumulative test duration:** ${(duration / 1000).toFixed(2)}s`,
  '',
  '## Test Results',
  '',
  '| Status | Suite | Test | Duration | Retries |',
  '|---|---|---|---:|---:|',
  ...rows.map((row) => `| ${row.status} | ${row.suite} | ${row.title} | ${(row.duration / 1000).toFixed(2)}s | ${row.retries} |`),
  '',
  '## Slowest Tests',
  '',
  '| Test | Duration |',
  '|---|---:|',
  ...slowest.map((row) => `| ${row.title} | ${(row.duration / 1000).toFixed(2)}s |`),
  '',
  '## Report Artifacts',
  '',
  '- Interactive HTML: `playwright-report/index.html`',
  '- Machine-readable JSON: `test-results/playwright-results.json`',
  '- CI-compatible JUnit: `test-results/playwright-results.xml`',
  '- Failure traces, screenshots, and videos: `test-results/artifacts/`',
  '',
].join('\n');

await mkdir(new URL('../test-results/', import.meta.url), { recursive: true });
await writeFile(output, markdown, 'utf8');
console.log(`Detailed summary written to ${output.pathname}`);
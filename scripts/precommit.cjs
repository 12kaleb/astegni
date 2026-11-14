const { execFileSync } = require('node:child_process');

const files = execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR'], { encoding: 'utf8' })
  .split(/\r?\n/)
  .filter((file) => /\.(?:js|jsx|mjs|cjs|json|css|md)$/.test(file));

if (!files.length) process.exit(0);
execFileSync('npx', ['prettier', '--write', ...files], { stdio: 'inherit' });
execFileSync('npx', ['eslint', ...files], { stdio: 'inherit' });
execFileSync('git', ['add', ...files], { stdio: 'inherit' });

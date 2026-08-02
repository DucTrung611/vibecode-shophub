// Cross-platform wrapper for `npm run seed`. Package.json script strings can't
// portably chain "build, ignore its exit code, then run" across cmd.exe/PowerShell/
// bash — `;`/`&&` behave differently on each. Doing it here in plain Node sidesteps
// the shell entirely.
//
// tsc is expected to exit non-zero here: two pre-existing spec files unrelated to
// the seed script fail type-check (see auth.service.spec.ts / review.service.spec.ts),
// but tsc still emits JS for everything else. We only care that dist/prisma/seed/
// exists and is current.
const { spawnSync } = require('child_process');

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

console.log('Building (tsc)...');
spawnSync(npx, ['tsc', '-p', 'tsconfig.json'], { stdio: 'inherit' });

console.log('Running seed script...\n');
const result = spawnSync('node', ['dist/prisma/seed/index.js'], { stdio: 'inherit' });
process.exit(result.status ?? 1);

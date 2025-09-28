'use strict';

import { execSync } from 'child_process';

const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
const args = process.argv.slice(2).join(" ").trim();
const vitestArgs = isCI ? ' -- --no-color' : args;

const commands: string[] = [
    'npm run check-types',
    `dotenvx run --env-file tests/.ancillary/fixtures/.env.test -- "npm run vitest ${vitestArgs}"`
];

try {
    commands.forEach((cmd) => {
        console.log(`Running: ${cmd}`);
        execSync(cmd, { stdio: 'inherit' });
    });
} catch (_error) {
    const error = _error as Error;

    console.error(`Error running command: ${error.message}`);

    process.exit(1);
}

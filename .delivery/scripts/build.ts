'use strict';

import { execSync } from 'child_process';

const commands: string[] = [
    'npm run test',
    'npm run lint',
    "npm run package:lint:readme",
    'rimraf ./.delivery/.builds/dist',
    'tsc -p ./.delivery/configuration/tsconfig.json',
    'npm run package:de-alias',
    'npm run package:bundle:copy',
    'npm run package:pack'
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

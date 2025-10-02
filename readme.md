# expand-env

Allows expanding placeholders in JavaScript object / JSON with matched name env variables' values.

The env variables can be loaded in the environment any way (Linux custom `export` scripts, [dotenvx](https://dotenvx.com/docs/quickstart#run-anywhere), [k8](https://kubernetes.io/docs/concepts/configuration/secret/) / [Docker](https://docs.docker.com/engine/swarm/secrets/) Swarm configs and secrets, centralized secrets managers ([HashiCorp Vault](https://www.hashicorp.com/en/products/vault)) etc.) before applying `expand-env`.

**Package Status**

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=WhereJuly_59-expand-env&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=WhereJuly_59-expand-env)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=WhereJuly_59-expand-env&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=WhereJuly_59-expand-env)
![min+gzip](https://img.shields.io/bundlejs/size/@wherejuly/expand-env)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?color=green)](https://opensource.org/licenses/MIT)

<details>
<summary><b>Contents</b></summary>

- [Core Principles](#core-principles)
- [The Difference vs `dotenv-expand`](#the-difference-vs-dotenv-expand)
- [Usage](#usage)
- [API](#api)
  - [`expandEnv`](#expandenv)
  - [`ExpandEnvException`](#expandenvexception)
- [Recommended Use](#recommended-use)
- [Maintenance](#maintenance)
  - [Contributions](#contributions)
  - [License](#license)
  - [Potential](#potential)

</details>

## Core Principles

- No secrets or config hard-coded in code repositories.
- Your application or service may not be responsible for env validation. Apply env validation at CI/CD (test or build) time using, e.g. [env-schema-cli](https://www.npmjs.com/package/env-schema-cli) to ensure your env files match the expected `.env.example` content.
- Same build artifact should run on every environment, env injected at deploy time.
- Deploy artifacts (your app or service) and env variables aren’t mixed.

## The Difference vs `dotenv-expand`

- Interpolate nested JS objects and arrays in addition to strings.
- Convert strings to: int, boolean using respective modifiers (see the example below), resembling Docker Compose [interpolation syntax](https://docs.docker.com/reference/compose-file/interpolation/).
- Silently pass the env placeholders in place of the missing variables. Throw for invalid boolean values.

Modifies string integers to integers with `|-int` modifier if the value can be transformed to integer. Otherwise it becomes string. Modifies boolean value with `|-bool` modifier (throws for invalid values).

## Usage

```bash
npm install @wherejuly/expand-env
```

Given the following `.env` file is loaded into the process environment:

```env
NODE_ENV=development

SERVICE_URL="http://some.com"
CORS_HOST="http://cors.com"

API_KEY="abra"
ENCRYPTION_SECRET="cadabra"
JWT_EXPIRY=3600
SOME_BOOLEAN=false
```

And the `src/config/config.json` is provided with your application:

```json
{
 "password_strength": 1,
 "service_url": "${SERVICE_URL}",
 "email_templates": { "confirmation": "./templates/confirmation.hbs" },
 "cors": ["http://localhost", "${CORS_HOST}"],
 "security": {
  "api_key": "${API_KEY}",
  "encryption_secret": "${ENCRYPTION_SECRET}",
  "jwt_expiry": "${JWT_EXPIRY}",
  "jwt_expiry_int": "${JWT_EXPIRY}|-int"
 },
 "a_boolean": "${SOME_BOOLEAN}|-bool"
}
```

Do the following somewhere in your application code:

```javascript
import { expandEnv } from 'expand-env';

import config from 'src/config/config.json' with {type: 'json'};

const expanded = expandEnv(config);

console.dir(expanded);
```

The console output comes as:

```javascript
{
  password_strength: 1,
  service_url: 'http://some.com',
  email_templates: { confirmation: './templates/confirmation.hbs' },
  cors: [ 'http://localhost', 'http://cors.com' ],
  security: {
    api_key: 'abra',
    encryption_secret: 'cadabra',
    jwt_expiry: '3600',
    jwt_expiry_int: 3600
  }
  a_boolean: false
}
```

## API

### `expandEnv`

**Signature:**

```typescript
export default function expandEnv(obj: any, customEnv?: Record<string, any>): Record<string, any>;
```

Expands environment variable placeholders in an object, array, or string. Supports type modifiers like `|-int` and `|-bool` to convert values.

- `obj`: The input object/array/string containing placeholders (e.g., `"${API_KEY}"`).
- `customEnv`: Optional map of environment variables. Defaults to `process.env` if not provided.

**Returns:** A copy of `obj` with all placeholders replaced and converted.

### `ExpandEnvException`

**Usage:**

```typescript
try {
 const expanded = expandEnv(config);
} catch (error) {
 console.log(error instanceof ExpandEnvException);
 // logs 'true'`
}
```

Custom error type thrown when environment expansion fails (e.g., unsupported modifier, invalid boolean, or malformed placeholder), so far implemented only when `|-bool` modifier faces the non-boolean value.

- **`message`**: Description of the failure.

**Extends:** `Error`.

## Recommended Use

It is convenient to have multiple JSON files in your application config folder dedicated per a service dependency like below. You combine them all under `Config.valueobject.ts` class, pre-processing with `expand-env`, provide TypeScript typings for configuration sub-objects. Instantiate the class, register and inject it with IoC container (e.g. [tsyringe](https://www.npmjs.com/package/tsyringe)) and use this configuration object centrally throughout your application.

```
app/config
├── s3.json
├── auth.json
├── database.json
```

## Maintenance

The package is written in TypeScript with the informative JSDoc blocks available on hover for public interface (e.g. in VS Code) for comfortable programmatic usage. The code is carefully crafted with TDD allowing simple extension. The project is production-ready and actively maintained.

### Contributions

Filling issues, questions in Discussions are all welcome.

### License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file

### Potential

This is for my internal use.

- [ ] Optionally throw for missing variables
  - Now it silently keeps their placeholders names, which proved to be useful;
  - Good
    - To throw on some critical variables on application start (when configuration bootstrapping usually should happen) so that the missing env variable error does not pop up unexpectedly while application runs;
    - To offload throwing on the env variable from the application code to the single specific location (SRP);
  - Could set throw behavior via config like `expandEnv(json, {throw: true})`;
  - It requires then marking some missing variables pass silently (`|-silent`) so that not all them throw unconditionally.

The example with all the commands could be `${JWT_EXPIRY}|-int,silent`.

Currently explored up to:

- The [regex](regexr.com/7utvp) to parse the string into placeholder and behaviors;
- The `placeholderStringParser` [function](src/potential/placeholderStringParser.ts) working draft;

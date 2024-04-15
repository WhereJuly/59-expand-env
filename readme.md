# expand-env

**Contents**

- [expand-env](#expand-env)
  - [Usage](#usage)
  - [Potential](#potential)
  
Allows expand placeholders in JavaScript objects with matched named env variables.

Modifies string integers to integers with `|-int` modifier if the value can be transformed to integer. Otherwise it becomes string.

## Usage

``` bash
npm install @wherejuly/expand-env
```

Given:

.env
``` env

NODE_ENV=development

SERVICE_URL="http://some.com"
CORS_HOST="http://cors.com"

API_KEY="abra"
ENCRYPTION_SECRET="cadabra"
JWT_EXPIRY=3600
```

config.json
``` json
{
    "password_strength": 1,
    "service_url": "${SERVICE_URL}",
    "email_templates": { "confirmation": "./templates/confirmation.hbs" },
    "cors": ["http://localhost", "${CORS_HOST}"],
    "security": {
        "api_key": "${API_KEY}",
        "encryption_secret": "${ENCRYPTION_SECRET}",
        "jwt_expiry": "${JWT_EXPIRY}",
        "jwt_expiry_int": "${JWT_EXPIRY}|-int",
    }
}
```

Somewhere in an application code
``` javascript
import config from 'config.json';
import { expandEnv } from 'expand-env';

const expanded = expandEnv(config);

console.dir(expanded);
```

console output
``` javascript
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
}
```

## Potential

- [ ] Transform to boolean on `|-bool` modifier;
- [ ] Optionally throw for missing variables 
  + Now it silently keeps their placeholders names, which proved to be useful;
  + Good 
    - To throw on some critical variables on application start (when configuration bootstrapping usually should happen) so that the missing env variable error does not pop up unexpectedly while application runs;
    - To offload throwing on the env variable from the application code to the single specific location (SRP);
  + Could set throw behavior via config like `expandEnv(json, {throw: true})`;
  + It requires then marking some missing variables pass silently (`|-silent`) so that not all them throw unconditionally.

The example with all the commands could be `${JWT_EXPIRY}|-int,silent`.

Currently explored up to:

- The [regex](regexr.com/7utvp) to parse the string into placeholder and behaviors;
- The `placeholderStringParser` [function](src/potential/placeholderStringParser.ts) working draft;

The difference vs `dotenv-expand`: 
- interpolate the nested JS objects, arrays;
- convert strings to: int, boolean;
- optionally throw for missing values;

Naming:
- core: Interpolate Environment Variables, Evaluate Env Placeholders
- variants:
  + envaluate;
  + iev;
  + envilate;
  + envolate;
  + enpolate;

Value:
- could present myself: publish to npm.js, refer to my envaluate.valentineshi.dev where I could describe on one page how it is different from dotenv-expand, list usages from simples to more involved (e.g. my configuration in Vue), describe the principles to configuration via json and `ConfigVO`.
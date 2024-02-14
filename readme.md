# expand-env

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
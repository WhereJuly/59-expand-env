'use strict';

import process from 'process';
import cloneDeep from 'lodash.clonedeep';
import isObject from 'lodash.isobject';
import isString from 'lodash.isstring';
import mapValues from 'lodash.mapvalues';

let localEnv: Record<string, any>;

/**
 * Replace placeholders in JSON/JS objects with matching named values from the environment variables.
 * Processes nested objects and arrays
 * 
 * Can modify the replacement value to integer.
 * @example `"${JWT_EXPIRY}|-int"`, see below.
 * 
 * ```env
 * SERVICE_URL="http://some.com"
 * CORS_HOST="http://cors.com"
 * API_KEY="api-key"
 * ENCRYPTION_SECRET="secret"
 * JWT_EXPIRY=3600
 * ```
 * 
 * ```json
 * {
 *  "service_url": "${SERVICE_URL}",
 *  "cors": ["http://localhost", "${CORS_HOST}"],
 *  "security": {
 *      "api_key": "${API_KEY}",
 *      "jwt_expiry": "${JWT_EXPIRY}|-int"
 *  }
 * }
 * ```
 */
export default function expandEnv(obj: any, customEnv?: Record<string, any>): Record<string, any> {
    const clonedObj = cloneDeep(obj);
    localEnv = customEnv ?? process.env;
    return expand(clonedObj);
}

function expand(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(expand);
    } else if (isObject(obj)) {
        return mapValues(obj, expand);
    } else if (isString(obj)) {
        return expandString(obj);
    } else {
        return obj;
    }
}

function expandString(obj: string): any {
    let hasIntSuffix = false;

    const stringWithEnvReplaced = obj.replace(/\${(.*?)}(\|-int)?/g, (match, placeholder, intSuffix) => {
        const envValue = localEnv[placeholder];

        // If the environment variable is not found, return the original placeholder
        if (!envValue) { return match; }

        if (intSuffix && typeof envValue === 'string') {
            hasIntSuffix = !!intSuffix;

            const intValue = parseInt(envValue, 10);
            return isNaN(intValue) ? envValue : intValue;
        }
        return envValue;


    });

    // Check if the resulting value is numeric, and if so, assign it as a number
    return isNaN(Number(stringWithEnvReplaced)) ? stringWithEnvReplaced : (hasIntSuffix ? Number(stringWithEnvReplaced) : stringWithEnvReplaced);
}

function parseBool(value: string): boolean {
    if (value === "true") return true;
    if (value === "false") return false;

    throw new Error(`Invalid boolean value: ${value}`);
}
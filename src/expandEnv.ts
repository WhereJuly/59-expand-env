'use strict';

import process from 'process';
import cloneDeep from 'lodash.clonedeep';
import isObject from 'lodash.isobject';
import isString from 'lodash.isstring';
import mapValues from 'lodash.mapvalues';

import ExpandEnvException from './ExpandEnv.exception.js';

enum EEnvValueModifiers {
    Int = '|-int',
    Bool = '|-bool'
}

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

/**
 * REFACTOR: These all are good candidates to extract to a processor objects,
 * responsible for deciding on modifier and process the value.
 */
function expandString(obj: string): any {
    const flags = {
        isInt: false,
        isBool: false
    };

    const isInt = (envValue: any, modifier: EEnvValueModifiers) => {
        return modifier === EEnvValueModifiers.Int && typeof envValue === 'string';
    };

    const isBool = (envValue: any, modifier: EEnvValueModifiers) => {
        return modifier === EEnvValueModifiers.Bool && typeof envValue === 'string';
    };

    const stringWithEnvReplaced = obj.replace(/\${(.*?)}(\|-(int|bool))?/g, (match, placeholder, modifier: EEnvValueModifiers) => {
        const envValue = localEnv[placeholder];

        // If the environment variable is not found, return the original placeholder
        if (!envValue) { return match; }

        if (isInt(envValue, modifier)) {
            const intValue = parseInt(envValue as string, 10);

            if (!isNaN(intValue)) {
                flags.isInt = true;
                return intValue;
            }
        }

        if (isBool(envValue, modifier)) {
            flags.isBool = true;
        }

        return envValue;

    });

    if (flags.isInt) {
        return Number(stringWithEnvReplaced);
    }

    if (flags.isBool) {
        return parseBool(stringWithEnvReplaced);
    }

    return stringWithEnvReplaced;

}

function parseBool(value: string): boolean {
    if (value === "true") return true;
    if (value === "false") return false;

    throw new ExpandEnvException(`Invalid boolean value: "${value}"`);
}
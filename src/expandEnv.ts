'use strict';

import process from 'process';
import cloneDeep from 'lodash.clonedeep';
import isObject from 'lodash.isobject';
import isString from 'lodash.isstring';
import mapValues from 'lodash.mapvalues';

let localEnv: Record<string, any>;

export default function expandEnv(obj: any, customEnv?: Record<string, any>): any {
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

    let stringWithEnvReplaced = obj.replace(/\${(.*?)}(\|-int)?/g, (match, placeholder, intSuffix) => {
        const envValue = localEnv[placeholder];
        if (envValue !== undefined) {
            if (intSuffix && typeof envValue === 'string') {
                hasIntSuffix = !!intSuffix;

                const intValue = parseInt(envValue, 10);
                return isNaN(intValue) ? envValue : intValue;
            }
            return envValue;
        }
        // If the environment variable is not found, return the original placeholder
        // Return any as there could be either number or string.
        return match as any;
    });

    // Check if the resulting value is numeric, and if so, assign it as a number
    return isNaN(Number(stringWithEnvReplaced)) ? stringWithEnvReplaced : (hasIntSuffix ? Number(stringWithEnvReplaced) : stringWithEnvReplaced);
}



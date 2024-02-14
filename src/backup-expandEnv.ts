'use strict';

import process from 'process';
import cloneDeep from 'lodash.clonedeep';
import isObject from 'lodash.isobject';
import isString from 'lodash.isstring';
import mapValues from 'lodash.mapvalues';

function expand(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(expand);
    } else if (isObject(obj)) {
        return mapValues(obj, expand);
    } else if (isString(obj)) {
        let stringWithEnvReplaced = obj.replace(/\${(.*?)}(\|-int)?/g, (match, placeholder, intSuffix) => {
            const envValue = process.env[placeholder];
            if (envValue !== undefined) {
                if (intSuffix && typeof envValue === 'string') {
                    const intValue = parseInt(envValue, 10);
                    return isNaN(intValue) ? envValue : intValue;
                }
                return envValue;
            }
            // If the environment variable is not found, return the original placeholder
            // Return any as there could be either number or string.
            return match as any;
        });

        return isNaN(Number(stringWithEnvReplaced)) ? stringWithEnvReplaced : Number(stringWithEnvReplaced);
    } else {
        return obj;
    }
}

export default function expandEnv(obj: any): any {
    const clonedObj = cloneDeep(obj);
    return expand(clonedObj);
}

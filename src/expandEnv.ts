'use strict';

import process from 'process';
import isObject from 'lodash.isobject';
import isString from 'lodash.isstring';
import map from 'lodash.map';
import mapValues from 'lodash.mapvalues';

export default function expandEnv(obj: any): any {
    if (Array.isArray(obj)) {
        return map(obj, expandEnv);
    } else if (isObject(obj)) {
        return mapValues(obj, expandEnv);
    } else if (isString(obj)) {
        return obj.replace(/\${(.*?)}/g, (match, placeholder) => {
            const envValue = process.env[placeholder];
            return envValue !== undefined ? envValue : match;
        });
    } else {
        return obj;
    }
}

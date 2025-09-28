'use strict';

import { describe, expect, it, } from 'vitest';

import fixture from './.ancillary/fixtures/fixture.json' with {type: 'json'};

import expandEnv from '../src/expandEnv.js';

describe('expand-env function', () => {

    it('Multiple placeholders, nested object, placeholders in array members, transformation to integer', () => {
        const expanded = expandEnv(fixture);

        expect(expanded.service_url).toEqual(process.env.SERVICE_URL);
        expect(expanded.cors[1]).toEqual(process.env.CORS_HOST);

        expect(expanded.security.api_key).toEqual(process.env.API_KEY);
        expect(expanded.security.encryption_secret).toEqual(process.env.ENCRYPTION_SECRET);
        expect(expanded.security.jwt_expiry).toEqual(parseInt(process.env.JWT_EXPIRY!, 10));
    });

    it('Transform string integer to integer with "|-int" modifier', () => {
        const expanded = expandEnv({ "jwt_expiry": "${JWT_EXPIRY}|-int" });

        expect(expanded.jwt_expiry).toEqual(parseInt(process.env.JWT_EXPIRY!, 10));
    });

    it('Keep integer as string', () => {
        const expanded = expandEnv({ "jwt_expiry": "${JWT_EXPIRY}" });

        expect(expanded.jwt_expiry).toEqual(process.env.JWT_EXPIRY);
    });

    it('Provide the custom replacement for process.env', () => {
        const custom = { JWT_EXPIRY: '2400' };
        const expanded = expandEnv({ "jwt_expiry": "${JWT_EXPIRY}" }, custom);
        expect(expanded.jwt_expiry).toEqual(custom.JWT_EXPIRY);
    });

    it('Keep the placeholder in place of the missing env variable', () => {
        const custom = { MISSING_VALUE: undefined };
        const actual = expandEnv({ "missing": "${MISSING_VALUE}" }, custom);
        expect(actual.missing).toEqual('${MISSING_VALUE}');
    });

    it('If "|-int" modifier was used for non-number env value, silently keep that value', () => {
        const expected = 'not-a-number';
        const custom = { NAN_VALUE: expected };
        const actual = expandEnv({ "nan_value": "${NAN_VALUE}|-int" }, custom);

        expect(actual).toEqual({ nan_value: expected });
    });

    it('Should transform boolean value with "|-bool" modifier', () => {
        const custom = { BOOLEAN_VALUE: 'true' };
        const actual = expandEnv({ "boolean": "${BOOLEAN_VALUE}|-bool" }, custom);

        expect(actual).toEqual({ boolean: true });
    });

});
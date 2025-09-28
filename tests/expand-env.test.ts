'use strict';

import { describe, expect, it, } from 'vitest';

import fixture from './.ancillary/fixtures/fixture.json' with {type: 'json'};

import expandEnv from '../src/expandEnv.js';
import ExpandEnvException from '../src/ExpandEnv.exception.js';

describe('expand-env function', () => {

    it('Should transform multiple placeholders, nested object, placeholders in array members, transformation to integer and boolean', () => {
        const expanded = expandEnv(fixture);

        expect(expanded.service_url).toEqual(process.env.SERVICE_URL);
        expect(expanded.cors[1]).toEqual(process.env.CORS_HOST);

        expect(expanded.security.api_key).toEqual(process.env.API_KEY);
        expect(expanded.security.encryption_secret).toEqual(process.env.ENCRYPTION_SECRET);
        expect(expanded.security.jwt_expiry).toEqual(parseInt(process.env.JWT_EXPIRY!, 10));
    });

    it('Should transform string integer to integer with "|-int" modifier', () => {
        const expanded = expandEnv({ "jwt_expiry": "${JWT_EXPIRY}|-int" });

        expect(expanded.jwt_expiry).toEqual(parseInt(process.env.JWT_EXPIRY!, 10));
    });

    it('Should keep integer as string with no "|-int" modifier', () => {
        const expanded = expandEnv({ "jwt_expiry": "${JWT_EXPIRY}" });

        expect(expanded.jwt_expiry).toEqual(process.env.JWT_EXPIRY);
    });

    it('Should provide the custom replacement for process.env', () => {
        const custom = { JWT_EXPIRY: '2400' };
        const expanded = expandEnv({ "jwt_expiry": "${JWT_EXPIRY}" }, custom);
        expect(expanded.jwt_expiry).toEqual(custom.JWT_EXPIRY);
    });

    it('Should keep the placeholder in place of the missing env variable', () => {
        const custom = { MISSING_VALUE: undefined };
        const actual = expandEnv({ "missing": "${MISSING_VALUE}" }, custom);
        expect(actual.missing).toEqual('${MISSING_VALUE}');
    });

    it('Should silently keep the given non-number value if "|-int" modifier was used for non-number env value', () => {
        const expected = 'not-a-number';
        const custom = { NAN_VALUE: expected };
        const actual = expandEnv({ "nan_value": "${NAN_VALUE}|-int" }, custom);

        expect(actual).toEqual({ nan_value: expected });
    });

    describe('Booleans', () => {

        it('Should successfully transform boolean value with "|-bool" modifier', () => {
            const custom = { BOOLEAN_VALUE: 'true' };
            const actual = expandEnv({ "boolean": "${BOOLEAN_VALUE}|-bool" }, custom);

            expect(actual).toEqual({ boolean: true });
        });

        it('Should throw for non-valid boolean value with "|-bool" modifier', () => {
            const custom = { BOOLEAN_VALUE: 'non-boolean' };

            const actual = () => {
                expandEnv({ "boolean": "${BOOLEAN_VALUE}|-bool" }, custom);
            };

            expect(actual).toThrow("Invalid boolean value");
            expect(actual).toThrow(ExpandEnvException);
        });

    });

});
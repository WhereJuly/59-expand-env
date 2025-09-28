'use strict';

import { describe, expect, it, } from 'vitest';

import fixture from './.ancillary/fixtures/fixture.json' with {type: 'json'};

import expandEnv from '../src/expandEnv.js';

describe('expand-env function', () => {

    it('Multiple placeholders, nested object, placeholders in array members, transformation to integer', () => {
        const expanded = expandEnv(fixture);

        // console.dir(expanded);

        expect(expanded.service_url).to.equal(process.env.SERVICE_URL);
        expect(expanded.cors[1]).to.equal(process.env.CORS_HOST);

        expect(expanded.security.api_key).to.equal(process.env.API_KEY);
        expect(expanded.security.encryption_secret).to.equal(process.env.ENCRYPTION_SECRET);
        expect(expanded.security.jwt_expiry).to.equal(parseInt(process.env.JWT_EXPIRY!, 10));
    });

    it('Transform string integer to integer with "|-int" modifier', () => {
        const expanded = expandEnv({ "jwt_expiry": "${JWT_EXPIRY}|-int" });

        // console.dir(expanded);

        expect(expanded.jwt_expiry).to.equal(parseInt(process.env.JWT_EXPIRY!, 10));
    });

    it('Keep integer as string', () => {
        const expanded = expandEnv({ "jwt_expiry": "${JWT_EXPIRY}" });

        // console.dir(expanded);

        expect(expanded.jwt_expiry).to.equal(process.env.JWT_EXPIRY);
    });

    it('Provide the custom replacement for process.env', () => {
        const custom = { JWT_EXPIRY: '2400' };
        const expanded = expandEnv({ "jwt_expiry": "${JWT_EXPIRY}" }, custom);
        expect(expanded.jwt_expiry).to.equal(custom.JWT_EXPIRY);
    });


});
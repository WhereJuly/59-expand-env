'use strict';

import tap from 'tap';
import { expect } from 'chai';

const describe = tap.mocha.describe;
const it = tap.mocha.it;

import fixture from './fixtures/fixture.json';
import { expandEnv } from '../src';

describe('expand-env function', () => {

    it('Basic test', () => {
        const expanded = expandEnv(fixture);

        // console.dir(expanded);

        expect(expanded.service_url).to.equal(process.env.SERVICE_URL);
        expect(expanded.cors[1]).to.equal(process.env.CORS_HOST);

        expect(expanded.security.api_key).to.equal(process.env.API_KEY);
        expect(expanded.security.encryption_secret).to.equal(process.env.ENCRYPTION_SECRET);
        expect(expanded.security.jwt_expiry).to.equal(process.env.JWT_EXPIRY);
    });
    
});
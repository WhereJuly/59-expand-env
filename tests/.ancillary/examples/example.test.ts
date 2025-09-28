'use strict';

import tap from 'tap';
import { expect } from 'chai';

const describe = tap.mocha.describe;
const it = tap.mocha.it;

function add(a: number, b: number): number {
    return a + b;
}

// Test cases
describe('add function', () => {
    it.skip('should add two numbers correctly', () => {
        expect(add(1, 2)).to.equal(3);
        expect(add(0, 0)).to.equal(0);
        expect(add(-1, 1)).to.equal(0);
    });
});
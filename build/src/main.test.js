'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./lib/utils");
/**
 * This is a dummy TypeScript test file using chai and mocha
 *
 * It's automatically excluded from npm and its build output is excluded from both git and npm.
 * It is advised to test all your modules with accompanying *.test.js-files
 */
// tslint:disable:no-unused-expression
const { expect } = require('chai');
// import { functionToTest } from "./moduleToTest";
describe('module to test => function to test', () => {
    // initializing logic
    const expected = 5;
    it(`should return ${expected}`, () => {
        const result = 5;
        // assign result a value from functionToTest
        expect(result).to.equal(expected);
        // or using the should() syntax
        result.should.equal(expected);
    });
    // ... more tests => it
});
// ... more test suites => describe
describe('getChatID', () => {
    const mockData = [
        { name: 'Alice', chatID: '123' },
        { name: 'Bob', chatID: '456' },
        { name: 'Charlie', chatID: '789' },
    ];
    it('sollte die richtige chatID zurückgeben, wenn der Benutzer existiert', () => {
        const result = (0, utils_1.getChatID)(mockData, 'Alice');
        expect(result).to.equal('123');
    });
    it('sollte undefined zurückgeben, wenn der Benutzer nicht existiert', () => {
        const result = (0, utils_1.getChatID)(mockData, 'David');
        expect(result).to.be.undefined;
    });
    it('sollte undefined zurückgeben, wenn die Liste leer ist', () => {
        const result = (0, utils_1.getChatID)([], 'Alice');
        expect(result).to.be.undefined;
    });
});
//# sourceMappingURL=main.test.js.map
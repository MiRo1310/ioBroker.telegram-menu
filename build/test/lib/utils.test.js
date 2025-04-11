"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const utils_1 = require("../../src/lib/utils");
describe('getChatID', () => {
    const mockData = [
        { name: 'Alice', chatID: '123' },
        { name: 'Bob', chatID: '456' },
        { name: 'Charlie', chatID: '789' },
    ];
    it('sollte die richtige chatID zurückgeben, wenn der Benutzer existiert', () => {
        const result = (0, utils_1.getChatID)(mockData, 'Alice');
        (0, chai_1.expect)(result).to.equal('123');
    });
    it('sollte undefined zurückgeben, wenn der Benutzer nicht existiert', () => {
        const result = (0, utils_1.getChatID)(mockData, 'David');
        (0, chai_1.expect)(result).to.be.undefined;
    });
    it('sollte undefined zurückgeben, wenn die Liste leer ist', () => {
        const result = (0, utils_1.getChatID)([], 'Alice');
        (0, chai_1.expect)(result).to.be.undefined;
    });
});
//# sourceMappingURL=utils.test.js.map
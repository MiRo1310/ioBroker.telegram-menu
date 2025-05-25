"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const json_1 = require("../../src/lib/json");
describe('toJson', () => {
    it('should stringify an object with indentation test', () => {
        const input = { a: 1, b: 'test' };
        const result = (0, json_1.toJson)(input);
        (0, chai_1.expect)(result).to.equal('{\n  "a": 1,\n  "b": "test"\n}');
    });
    it('should stringify a string', () => {
        const input = 'hello';
        const result = (0, json_1.toJson)(input);
        (0, chai_1.expect)(result).to.equal('"hello"');
    });
    it('should stringify a number', () => {
        const input = 42;
        const result = (0, json_1.toJson)(input);
        (0, chai_1.expect)(result).to.equal('42');
    });
    it('should stringify a boolean', () => {
        const input = true;
        const result = (0, json_1.toJson)(input);
        (0, chai_1.expect)(result).to.equal('true');
    });
});
//# sourceMappingURL=json.test.js.map
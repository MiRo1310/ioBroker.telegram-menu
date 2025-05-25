import { expect } from 'chai';
import { toJson } from '../../src/lib/json';

describe('toJson', () => {
    it('should stringify an object with indentation test', () => {
        const input = { a: 1, b: 'test' };
        const result = toJson(input);
        expect(result).to.equal('{\n  "a": 1,\n  "b": "test"\n}');
    });

    it('should stringify a string', () => {
        const input = 'hello';
        const result = toJson(input);
        expect(result).to.equal('"hello"');
    });

    it('should stringify a number', () => {
        const input = 42;
        const result = toJson(input);
        expect(result).to.equal('42');
    });

    it('should stringify a boolean', () => {
        const input = true;
        const result = toJson(input);
        expect(result).to.equal('true');
    });
});

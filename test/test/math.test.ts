import { expect } from 'chai';
import { evaluate } from '@b/lib/math';
import { utils } from '@iobroker/testing';
import type { Adapter } from '@b/types/types';

const { adapter } = utils.unit.createMocks({});
const mockAdapter = adapter as unknown as Adapter;

describe('evaluate', () => {
    it('should evaluate a valid mathematical expression', () => {
        const result = evaluate(['2', '+', '3'], mockAdapter);
        expect(result).to.deep.equal({ val: 5, error: false });
    });

    it('should return an error for invalid expressions', () => {
        const result = evaluate(['2', '+'], mockAdapter);
        expect(result).to.deep.equal({ val: '', error: true });
    });

    it('should handle empty input gracefully', () => {
        const result = evaluate([], mockAdapter);
        expect(result).to.deep.equal({ val: '', error: false });
    });

    it('should log an error when evaluation fails', () => {
        const result = evaluate(['invalid', 'expression'], mockAdapter);
        expect(result).to.deep.equal({ val: '', error: true });
    });

    it('should get evaluate value', () => {
        const result = evaluate('2+2', mockAdapter);
        expect(result).to.deep.equal({ val: 4, error: false });
    });

    it('should return empty string if invalid eval string', () => {
        const result = evaluate('2+', mockAdapter);
        expect(result).to.deep.equal({ val: '', error: true });
    });
});

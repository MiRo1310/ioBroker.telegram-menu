import {expect} from 'chai';
import { evaluate} from '../../src/lib/math';
import {utils} from "@iobroker/testing";

const { adapter } = utils.unit.createMocks({});

describe('evaluate', () => {
    it('should evaluate a valid mathematical expression', () => {
        const result = evaluate(['2', '+', '3'], adapter);
        expect(result).to.deep.equal({ val: 5, error: false });
    });

    it('should return an error for invalid expressions', () => {
        const result = evaluate(['2', '+'], adapter);
        expect(result).to.deep.equal({ val: '', error: true });
    });

    it('should handle empty input gracefully', () => {
        const result = evaluate([], adapter);
        expect(result).to.deep.equal({ val: "", error: false });
    });

    it('should log an error when evaluation fails', () => {
                const result= evaluate(['invalid', 'expression'], adapter);
        expect(result).to.deep.equal({ val: '', error: true });
    });

    it('should get evaluate value', () => {
                const result= evaluate("2+2" , adapter)
        expect(result).to.deep.equal({ val: 4, error: false });
    });

    it('should return empty string if invalid eval string', () => {
                const result= evaluate("2+" , adapter)
        expect(result).to.deep.equal({ val: "", error: true });
    });
});

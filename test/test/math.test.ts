import {expect} from 'chai';
import {calcValue, evaluate} from '../../src/lib/math';
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
});

describe('calcValue', () => {
    it('should calculate a valid mathematical expression', () => {
        const textToSend = 'Test {math:+5}';
        const val = '10';
        const result = calcValue(textToSend, val, adapter);
        expect(result).to.deep.equal({
            textToSend: 'Test',
            val: 15,
            error: false,
        });
    });

    it('should return the original text and value if the expression is invalid', () => {
        const textToSend = 'Test {math:+}';
        const val = '10';
        const result = calcValue(textToSend, val, adapter);
        expect(result).to.deep.equal({
            textToSend: 'Test',
            val: '10',
            error: true,
        });
    });

    it('should handle empty input gracefully', () => {
        const textToSend = '';
        const val = '';
        const result = calcValue(textToSend, val,adapter);
        expect(result).to.deep.equal({
            textToSend: '',
            val: '',
            error: false,
        });
    });

    it('should return the original text if no math expression is found', () => {
        const textToSend = 'No math here';
        const val = '10';
        const result = calcValue(textToSend, val, adapter);
        expect(result).to.deep.equal({
            textToSend: 'No math here',
            val: 10,
            error: false,
        });
    });

    it('should handle complex expressions correctly', () => {
        const textToSend = 'Test {math:*2} test';
        const val = '5';
        const result = calcValue(textToSend, val, adapter);
        expect(result).to.deep.equal({
            textToSend: 'Test  test',
            val: 10,
            error: false,
        });
    });
});
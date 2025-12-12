import { describe } from 'mocha';
import { parseJSON } from '@b/lib/string';
import { expect } from 'chai';

describe('Json', () => {
    it('should be inValid Json', () => {
        const result = parseJSON(null);
        expect(result.json).to.be.eq('');
        expect(result.isValidJson).to.be.eq(false);
    });

    it('should be inValid Json', () => {
        const result = parseJSON('8{jda');
        expect(result.json).to.be.eq('8{jda');
        expect(result.isValidJson).to.be.eq(false);
    });

    it('should be valid Json', () => {
        const result = parseJSON('123');
        expect(result.json).to.be.eq(123);
        expect(result.isValidJson).to.be.eq(true);
    });

    it('should be valid Json', () => {
        const result = parseJSON('{"test":123,"value":["test",true]}');
        expect(result.json).to.be.deep.eq({ test: 123, value: ['test', true] });
        expect(result.isValidJson).to.be.eq(true);
    });
});

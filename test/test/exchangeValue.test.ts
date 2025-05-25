import { expect } from 'chai';
import { isNoValueParameter } from '../../src/lib/exchangeValue';

describe('isNoValueParameter', () => {
    it('should return insertValue as false and remove {novalue} from text', () => {
        const input = 'Test {novalue} string';
        const result = isNoValueParameter(input);
        console.log(result);
        expect(result.insertValue).to.be.false;
        expect(result.textToSend).to.not.include('{novalue}');
    });

    it('should return insertValue as true if {novalue} is not present', () => {
        const input = 'Test string';
        const result = isNoValueParameter(input);

        expect(result.insertValue).to.be.true;
        expect(result.textToSend).to.equal(input);
    });
});

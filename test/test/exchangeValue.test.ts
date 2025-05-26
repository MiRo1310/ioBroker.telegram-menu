import { expect } from 'chai';

import { isNoValueParameter } from '../../src/lib/exchangeValue';

describe('isNoValueParameter', () => {
    it('soll insertValue true zurückgeben, wenn kein {novalue} enthalten ist', () => {
        const result = isNoValueParameter('Testtext');
        expect(result.insertValue).to.be.true;
        expect(result.textToSend).to.equal('Testtext');
    });

    it('soll insertValue false zurückgeben und {novalue} entfernen', () => {
        const result = isNoValueParameter('Text mit {novalue} drin');
        expect(result.insertValue).to.be.false;
        expect(result.textToSend).to.equal('Text mit drin');
    });
});

import { expect } from 'chai';
import sinon from 'sinon';

import { exchangeValue, isNoValueParameter } from '@backend/lib/exchangeValue';

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

describe('exchangeValue', () => {
    let adapterMock: any;

    beforeEach(() => {
        adapterMock = { log: { error: sinon.stub() } };
    });

    it('should replace && placeholder with value via change map', () => {
        const result = exchangeValue(adapterMock, '&& change{"true":"AN","false":"AUS"}', true);
        expect(result.error).to.be.false;
        expect(result.textToSend).to.include('AN');
    });

    it('should return error=true when change map JSON is malformed', () => {
        const result = exchangeValue(adapterMock, '&& change{INVALID}', 'val');
        expect(result.error).to.be.true;
        expect(adapterMock.log.error.calledOnce).to.be.true;
    });

    it('should replace placeholder with value when no change map', () => {
        const result = exchangeValue(adapterMock, 'Wert: &&', '42');
        expect(result.error).to.be.false;
        expect(result.textToSend).to.equal('Wert: 42');
    });

    it('should not apply change map when shouldChange is false (keeps change text, replaces &&)', () => {
        const result = exchangeValue(adapterMock, '&& change{"true":"AN"}', true, false);
        expect(result.error).to.be.false;
        // change map is not applied; && is still replaced with the raw value
        expect(result.textToSend).to.equal('true change{"true":"AN"}');
    });

    it('should use empty string for newValue when val is null in error case (line 42 ?? branch)', () => {
        const result = exchangeValue(adapterMock, '&& change{INVALID}', null);
        expect(result.error).to.be.true;
        expect(result.newValue).to.equal('');
    });

    it('should not insert value when {novalue} present without change map (line 44 insertValue=false branch)', () => {
        const result = exchangeValue(adapterMock, 'Text {novalue}', '42');
        expect(result.error).to.be.false;
        // {novalue} removed, && placeholder absent → value not appended
        expect(result.textToSend).to.equal('Text');
        expect(result.newValue).to.equal('42');
    });

    it('should use empty string for newValue when val is undefined (line 48 ?? branch)', () => {
        const result = exchangeValue(adapterMock, 'Wert: &&', undefined);
        expect(result.error).to.be.false;
        expect(result.newValue).to.equal('');
    });
});

import { expect } from 'chai';
import sinon from 'sinon';
import * as utilities from '../../../src/lib/utilities';
import { invalidId } from '@backend/config/config';

describe('utilities', () => {
    let adapterMock: any;

    beforeEach(() => {
        adapterMock = {
            getForeignStateAsync: sinon.stub(),
            getForeignObjectAsync: sinon.stub(),
            log: {
                debug: sinon.stub(),
                warn: sinon.stub(),
            },
        };
    });

    describe('setTimeValue', () => {
        it('should return invalidId if id is missing', async () => {
            const result = await utilities.getTimeValue(adapterMock, "{time.lc,(DD MM YYYY hh:mm:ss:sss),id:''}}");
            expect(result).to.include(invalidId);
        });

        it('should return invalidId if value is missing', async () => {
            adapterMock.getForeignStateAsync.resolves(undefined);
            const result = await utilities.getTimeValue(adapterMock, "{time.lc,(DD MM YYYY hh:mm:ss:sss),id:'12345'}}");
            expect(result).to.include(invalidId);
        });
    });

    describe('textModifier', () => {
        it('should return empty string if text is undefined', async () => {
            const result = await utilities.textModifier(adapterMock, undefined);
            expect(result).to.equal('');
        });

        it('should handle text without modification', async () => {
            const result = await utilities.textModifier(adapterMock, 'plain text');
            expect(result).to.equal('plain text');
        });
    });

    describe('transformValueToTypeOfId', () => {
        it('should return value if object is missing', async () => {
            adapterMock.getForeignObjectAsync.resolves(undefined);
            const result = await utilities.transformValueToTypeOfId(adapterMock, 'id', 'value');
            expect(result).to.equal('value');
        });

        it('should convert value to string if type is string', async () => {
            adapterMock.getForeignObjectAsync.resolves({ common: { type: 'string' } });
            const result = await utilities.transformValueToTypeOfId(adapterMock, 'id', 123);
            expect(result).to.equal('123');
        });

        it('should convert value to number if type is number', async () => {
            adapterMock.getForeignObjectAsync.resolves({ common: { type: 'number' } });
            const result = await utilities.transformValueToTypeOfId(adapterMock, 'id', '42');
            expect(result).to.equal(42);
        });

        it('should convert value to boolean if type is boolean', async () => {
            adapterMock.getForeignObjectAsync.resolves({ common: { type: 'boolean' } });
            const result = await utilities.transformValueToTypeOfId(adapterMock, 'id', true);
            expect(result).to.equal(true);
        });
    });
});

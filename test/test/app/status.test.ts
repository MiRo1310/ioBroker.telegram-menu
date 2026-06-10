import { expect } from 'chai';
import sinon from 'sinon';
import { checkStatus } from '@backend/app/status';
import type { Adapter } from '@backend/types/types';
import { createAppContextMock } from '../../fixtures/appContextMock';

describe('checkStatus', () => {
    let adapterMock: any;
    let storeMock: any;
    beforeEach(() => {
        adapterMock = {
            getForeignStateAsync: sinon.stub(),
            log: {
                debug: sinon.stub(),
                warn: sinon.stub(),
                error: sinon.stub(),
            },
        } as unknown as Adapter;
        storeMock = createAppContextMock(adapterMock);
    });

    it('should replace status substring if state is not found', async () => {
        adapterMock.getForeignStateAsync.resolves({ val: undefined });
        const result = await checkStatus(storeMock, 'Test {status:"id.not.found":true} suffix');
        // val is undefined → should remove the substring
        expect(result).to.not.include('{status:');
    });

    it('should replace status with correct value from change map (val matches)', async () => {
        adapterMock.getForeignStateAsync.resolves({ val: true });
        const result = await checkStatus(storeMock, 'Test {status:"some.id":true} change{"true":"AN","false":"AUS"}');
        expect(result).to.include('AN');
    });

    it('should replace status with correct value from change map (val does not match key)', async () => {
        adapterMock.getForeignStateAsync.resolves({ val: false });
        const result = await checkStatus(storeMock, 'Test {status:"some.id":true} change{"true":"AN","false":"AUS"}');
        expect(result).to.include('AUS');
    });

    it('should return text without status substring if state val is null', async () => {
        adapterMock.getForeignStateAsync.resolves(null);
        const result = await checkStatus(storeMock, 'Test {status:"some.id":true} suffix');
        expect(result).to.not.include('{status:');
    });

    it('should integrate time into text when text includes {time}', async () => {
        adapterMock.getForeignStateAsync.resolves({ val: Date.now() });
        const result = await checkStatus(storeMock, '{time} {status:"time.id":false}');
        expect(result).to.be.a('string');
        expect(result).to.not.include('{status:');
    });

    it('should return modifiedText when exchangeValue returns error=true (malformed change map)', async () => {
        adapterMock.getForeignStateAsync.resolves({ val: 'on' });
        // change{INVALID} makes exchangeValue return error=true → returns modifiedText (with &&)
        const result = await checkStatus(storeMock, '{status:"some.id":true} change{INVALID}');
        expect(result).to.be.a('string');
        expect(adapterMock.log.error.called).to.be.true;
    });
});

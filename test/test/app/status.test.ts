import { expect } from 'chai';
import sinon from 'sinon';
import { checkStatus } from '@backend/app/status';
import type { Adapter } from '@backend/types/types';

describe('checkStatus', () => {
    let adapterMock: any;

    beforeEach(() => {
        adapterMock = {
            getForeignStateAsync: sinon.stub(),
            log: {
                debug: sinon.stub(),
                warn: sinon.stub(),
                error: sinon.stub(),
            },
        } as unknown as Adapter;
    });

    it('should replace status substring if state is not found', async () => {
        adapterMock.getForeignStateAsync.resolves({ val: undefined });
        const result = await checkStatus(adapterMock, 'Test {status:"id.not.found":true} suffix');
        // val is undefined → should remove the substring
        expect(result).to.not.include('{status:');
    });

    it('should replace status with correct value from change map (val matches)', async () => {
        adapterMock.getForeignStateAsync.resolves({ val: true });
        const result = await checkStatus(adapterMock, 'Test {status:"some.id":true} change{"true":"AN","false":"AUS"}');
        expect(result).to.include('AN');
    });

    it('should replace status with correct value from change map (val does not match key)', async () => {
        adapterMock.getForeignStateAsync.resolves({ val: false });
        const result = await checkStatus(adapterMock, 'Test {status:"some.id":true} change{"true":"AN","false":"AUS"}');
        expect(result).to.include('AUS');
    });

    it('should return text without status substring if state val is null', async () => {
        adapterMock.getForeignStateAsync.resolves(null);
        const result = await checkStatus(adapterMock, 'Test {status:"some.id":true} suffix');
        expect(result).to.not.include('{status:');
    });
});

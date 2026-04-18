import { expect } from 'chai';
import sinon from 'sinon';
import { areAllCheckTelegramInstancesActive } from '../../../src/app/connection';

describe('connection', () => {
    let adapterMock: any;

    beforeEach(() => {
        adapterMock = {
            setState: sinon.stub().resolves(),
            getForeignStateAsync: sinon.stub(),
            log: { debug: sinon.stub(), error: sinon.stub(), info: sinon.stub() },
        };
    });

    it('should return true if all active instances are connected', async () => {
        adapterMock.getForeignStateAsync.resolves({ val: true });
        const params: any = {
            adapter: adapterMock,
            telegramInstanceList: [{ name: 'telegram.0', active: true }],
        };
        const result = await areAllCheckTelegramInstancesActive(params);
        expect(result).to.equal(true);
    });

    it('should return false if telegram state is not found', async () => {
        adapterMock.getForeignStateAsync.resolves(null);
        const params: any = {
            adapter: adapterMock,
            telegramInstanceList: [{ name: 'telegram.0', active: true }],
        };
        const result = await areAllCheckTelegramInstancesActive(params);
        expect(result).to.equal(false);
        expect(adapterMock.log.error.calledOnce).to.be.true;
    });

    it('should return false if telegram val is falsy', async () => {
        adapterMock.getForeignStateAsync.resolves({ val: false });
        const params: any = {
            adapter: adapterMock,
            telegramInstanceList: [{ name: 'telegram.0', active: true }],
        };
        const result = await areAllCheckTelegramInstancesActive(params);
        expect(result).to.equal(false);
    });

    it('should skip inactive instances', async () => {
        adapterMock.getForeignStateAsync.resolves({ val: true });
        const params: any = {
            adapter: adapterMock,
            telegramInstanceList: [
                { name: 'telegram.0', active: false },
                { name: 'telegram.1', active: true },
            ],
        };
        const result = await areAllCheckTelegramInstancesActive(params);
        expect(result).to.equal(true);
        // Only called once for the active instance
        expect(adapterMock.getForeignStateAsync.calledOnce).to.be.true;
    });

    it('should skip instances without name', async () => {
        const params: any = {
            adapter: adapterMock,
            telegramInstanceList: [{ active: true }],
        };
        const result = await areAllCheckTelegramInstancesActive(params);
        expect(result).to.equal(true);
    });

    it('should return true for empty instance list', async () => {
        const params: any = {
            adapter: adapterMock,
            telegramInstanceList: [],
        };
        const result = await areAllCheckTelegramInstancesActive(params);
        expect(result).to.equal(true);
    });
});


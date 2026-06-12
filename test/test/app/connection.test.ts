import { expect } from 'chai';
import sinon from 'sinon';
import { areAllCheckTelegramInstancesActive } from '../../../src/app/connection';
import { createAppContextMock } from '../../fixtures/appContextMock';

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
        const store = createAppContextMock(adapterMock, {
            telegramInstanceList: [{ name: 'telegram.0', active: true }],
        });
        const result = await areAllCheckTelegramInstancesActive(store);
        expect(result).to.equal(true);
    });

    it('should return false if telegram state is not found', async () => {
        adapterMock.getForeignStateAsync.resolves(null);
        const store = createAppContextMock(adapterMock, {
            telegramInstanceList: [{ name: 'telegram.0', active: true }],
        });
        const result = await areAllCheckTelegramInstancesActive(store);
        expect(result).to.equal(false);
        expect(adapterMock.log.error.calledOnce).to.be.true;
    });

    it('should return false if telegram val is falsy', async () => {
        adapterMock.getForeignStateAsync.resolves({ val: false });
        const store = createAppContextMock(adapterMock, {
            telegramInstanceList: [{ name: 'telegram.0', active: true }],
        });
        const result = await areAllCheckTelegramInstancesActive(store);
        expect(result).to.equal(false);
    });

    it('should fall back to false in setState when telegram val is null (line 20 ?? branch)', async () => {
        // Echter Test statt istanbul-ignore: der ??-Fallback ist regulär erreichbar (State existiert, val=null)
        adapterMock.getForeignStateAsync.resolves({ val: null });
        const store = createAppContextMock(adapterMock, {
            telegramInstanceList: [{ name: 'telegram.0', active: true }],
        });
        const result = await areAllCheckTelegramInstancesActive(store);
        expect(result).to.equal(false);
        expect(adapterMock.setState.calledWith('info.connection', false, true)).to.be.true;
        expect(adapterMock.log.info.calledOnce).to.be.true;
    });

    it('should skip inactive instances', async () => {
        adapterMock.getForeignStateAsync.resolves({ val: true });
        const store = createAppContextMock(adapterMock, {
            telegramInstanceList: [
                { name: 'telegram.0', active: false },
                { name: 'telegram.1', active: true },
            ],
        });
        const result = await areAllCheckTelegramInstancesActive(store);
        expect(result).to.equal(true);
        // Only called once for the active instance
        expect(adapterMock.getForeignStateAsync.calledOnce).to.be.true;
    });

    it('should skip instances without name', async () => {
        const store = createAppContextMock(adapterMock, {
            telegramInstanceList: [{ active: true } as any],
        });
        const result = await areAllCheckTelegramInstancesActive(store);
        expect(result).to.equal(true);
    });

    it('should return true for empty instance list', async () => {
        const store = createAppContextMock(adapterMock, {
            telegramInstanceList: [],
        });
        const result = await areAllCheckTelegramInstancesActive(store);
        expect(result).to.equal(true);
    });
});

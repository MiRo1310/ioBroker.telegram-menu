import { expect } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import type { Part } from '@backend/types/types';
import { createAppContextMock } from '../../fixtures/appContextMock';
import type { AppContext } from '@backend/app/appContext';

describe('httpRequest', () => {
    let adapterMock: any;
    let store: AppContext;
    let axiosStub: sinon.SinonStub;
    let writeFileSyncStub: sinon.SinonStub;
    let validateDirectoryStub: sinon.SinonStub;
    let sendToTelegramStub: sinon.SinonStub;
    let httpRequest: any;

    beforeEach(() => {
        adapterMock = {
            log: { debug: sinon.stub(), warn: sinon.stub(), error: sinon.stub() },
            supportsFeature: sinon.stub().returns(false),
        };
        store = createAppContextMock(adapterMock);

        axiosStub = sinon.stub().resolves({ data: Buffer.from('') });
        writeFileSyncStub = sinon.stub();

        // Stub named exports on cached modules (sinon modifies in-place)
        validateDirectoryStub = sinon.stub(require('@backend/lib/utils'), 'validateDirectory').returns(true);
        sendToTelegramStub = sinon.stub(require('@backend/app/telegram'), 'sendToTelegram').resolves();
        sinon.stub(require('@backend/app/logging'), 'errorLogger');

        // Use proxyquire only for default imports (axios, fs) that can't be sinon-stubbed
        const mod = proxyquire.noCallThru().load(require.resolve('@backend/app/httpRequest'), {
            axios: { default: axiosStub, __esModule: true },
            'node:fs': { default: { writeFileSync: writeFileSyncStub }, __esModule: true },
        });
        httpRequest = mod.httpRequest;
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should return false when part.httpRequest is undefined', async () => {
        const part: Part = {};
        const result = await httpRequest(store, 'telegram.0', part, 'Alice');
        expect(result).to.be.false;
    });

    it('should return false when part.httpRequest is empty', async () => {
        const part: Part = { httpRequest: [] };
        const result = await httpRequest(store, 'telegram.0', part, 'Alice');
        expect(result).to.be.false;
    });

    it('should return false when url is empty', async () => {
        const part: Part = { httpRequest: [{ url: '', user: '', password: '', filename: '', delay: '' }] };
        const result = await httpRequest(store, 'telegram.0', part, 'Alice');
        expect(result).to.be.false;
    });

    it('should call axios with the given url and return true', async () => {
        const part: Part = {
            httpRequest: [
                { url: 'http://example.com/image.jpg', user: '', password: '', filename: 'img.jpg', delay: '' },
            ],
        };
        const result = await httpRequest(store, 'telegram.0', part, 'Alice');
        expect(axiosStub.calledOnce).to.be.true;
        expect(result).to.be.true;
    });

    it('should send to telegram after successful http request', async () => {
        const part: Part = {
            httpRequest: [
                { url: 'http://example.com/image.jpg', user: '', password: '', filename: 'img.jpg', delay: '' },
            ],
        };
        await httpRequest(store, 'telegram.0', part, 'Alice');
        expect(sendToTelegramStub.calledOnce).to.be.true;
    });

    it('should return false when validateDirectory returns false', async () => {
        validateDirectoryStub.returns(false);
        const part: Part = {
            httpRequest: [
                { url: 'http://example.com/image.jpg', user: '', password: '', filename: 'img.jpg', delay: '' },
            ],
        };
        const result = await httpRequest(store, 'telegram.0', part, 'Alice');
        expect(result).to.be.false;
    });
});

import { expect } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import type { Part, TelegramParams } from '@backend/types/types';

describe('httpRequest', () => {
    let adapterMock: any;
    let telegramParams: TelegramParams;
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
        telegramParams = { adapter: adapterMock } as any;

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

    it('should return false when httpRequest is undefined', async () => {
        const part: Part = {};
        const result = await httpRequest(adapterMock, 'telegram.0', part, 'Alice', telegramParams, '/pics/');
        expect(result).to.be.false;
    });

    it('should return true for empty httpRequest array', async () => {
        const part: Part = { httpRequest: [] } as any;
        const result = await httpRequest(adapterMock, 'telegram.0', part, 'Alice', telegramParams, '/pics/');
        expect(result).to.be.true;
    });

    it('should make GET request without auth when user/password are empty', async () => {
        axiosStub.resolves({ data: Buffer.from('imgdata') });
        const part: Part = {
            httpRequest: [{ url: 'https://example.com/img.jpg', user: '', password: '', filename: 'out.jpg' }],
        } as any;
        const result = await httpRequest(adapterMock, 'telegram.0', part, 'Alice', telegramParams, '/pics/');
        expect(result).to.be.true;
        expect(writeFileSyncStub.calledOnce).to.be.true;
        expect(sendToTelegramStub.calledOnce).to.be.true;
        const callArgs = axiosStub.firstCall.args[0];
        expect(callArgs.auth).to.be.undefined;
    });

    it('should make GET request with auth when user and password are provided', async () => {
        axiosStub.resolves({ data: Buffer.from('imgdata') });
        const part: Part = {
            httpRequest: [
                { url: 'https://example.com/img.jpg', user: 'admin', password: 'secret', filename: 'out.jpg' },
            ],
        } as any;
        const result = await httpRequest(adapterMock, 'telegram.0', part, 'Alice', telegramParams, '/pics/');
        expect(result).to.be.true;
        const callArgs = axiosStub.firstCall.args[0];
        expect(callArgs.auth).to.deep.include({ username: 'admin', password: 'secret' });
    });

    it('should return false when validateDirectory returns false', async () => {
        validateDirectoryStub.returns(false);
        axiosStub.resolves({ data: Buffer.from('imgdata') });
        const part: Part = {
            httpRequest: [{ url: 'https://example.com/img.jpg', user: '', password: '', filename: 'out.jpg' }],
        } as any;
        const result = await httpRequest(adapterMock, 'telegram.0', part, 'Alice', telegramParams, '/pics/');
        expect(result).to.be.false;
        expect(writeFileSyncStub.called).to.be.false;
    });

    it('should send correct image path to telegram', async () => {
        axiosStub.resolves({ data: Buffer.from('imgdata') });
        const part: Part = {
            httpRequest: [{ url: 'https://example.com/img.jpg', user: '', password: '', filename: 'photo.jpg' }],
        } as any;
        await httpRequest(adapterMock, 'telegram.0', part, 'Alice', telegramParams, '/pics/');
        const sentPath = sendToTelegramStub.firstCall.args[0].textToSend;
        expect(sentPath).to.include('photo.jpg');
        expect(sentPath).to.include('pics');
    });

    it('should catch axios errors and log them', async () => {
        axiosStub.rejects(new Error('Network error'));
        const part: Part = {
            httpRequest: [{ url: 'https://example.com/img.jpg', user: '', password: '', filename: 'out.jpg' }],
        } as any;
        const result = await httpRequest(adapterMock, 'telegram.0', part, 'Alice', telegramParams, '/pics/');
        expect(result).to.be.true;
    });

    it('should process multiple httpRequest entries', async () => {
        axiosStub.resolves({ data: Buffer.from('imgdata') });
        const part: Part = {
            httpRequest: [
                { url: 'https://example.com/a.jpg', user: '', password: '', filename: 'a.jpg' },
                { url: 'https://example.com/b.jpg', user: '', password: '', filename: 'b.jpg' },
            ],
        } as any;
        const result = await httpRequest(adapterMock, 'telegram.0', part, 'Alice', telegramParams, '/pics/');
        expect(result).to.be.true;
        expect(writeFileSyncStub.calledTwice).to.be.true;
        expect(sendToTelegramStub.calledTwice).to.be.true;
    });
});

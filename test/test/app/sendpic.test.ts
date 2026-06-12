import { expect } from 'chai';
import sinon from 'sinon';
import { sendPic } from '@backend/app/sendpic';
import type { Part } from '@backend/types/types';
import { createAppContextMock } from '../../fixtures/appContextMock';
import type { AppContext } from '@backend/app/appContext';

describe('sendPic', () => {
    let adapterMock: any;
    let store: AppContext;
    let loadWithCurlStub: sinon.SinonStub;
    let validateDirectoryStub: sinon.SinonStub;
    let sendToTelegramStub: sinon.SinonStub;

    beforeEach(() => {
        adapterMock = {
            log: { debug: sinon.stub(), warn: sinon.stub(), error: sinon.stub() },
            setTimeout: sinon.stub(),
            clearTimeout: sinon.stub(),
        };
        store = createAppContextMock(adapterMock, {
            token: 'tok',
            directoryPicture: '/pics/',
        });

        loadWithCurlStub = sinon.stub(require('@backend/app/exec'), 'loadWithCurl');
        validateDirectoryStub = sinon.stub(require('@backend/lib/utils'), 'validateDirectory').returns(true);
        sendToTelegramStub = sinon.stub(require('@backend/app/telegram'), 'sendToTelegram').resolves();
    });

    afterEach(() => {
        loadWithCurlStub.restore();
        validateDirectoryStub.restore();
        sendToTelegramStub.restore();
    });

    it('should return timeouts unchanged when part.sendPic is undefined', () => {
        const part: Part = {};
        const result = sendPic(store, 'telegram.0', part, 'Alice', [], 'key');
        expect(result).to.deep.equal([]);
    });

    it('should return timeouts unchanged when part.sendPic is empty', () => {
        const part: Part = { sendPic: [] };
        const result = sendPic(store, 'telegram.0', part, 'Alice', [], 'key');
        expect(result).to.deep.equal([]);
    });

    it('should skip entries with empty id (not a startside)', () => {
        const part: Part = { sendPic: [{ id: '', delay: 0, fileName: 'pic.jpg' }] };
        const result = sendPic(store, 'telegram.0', part, 'Alice', [], 'key');
        expect(loadWithCurlStub.called).to.be.false;
        expect(result).to.deep.equal([]);
    });

    it('should skip entries when validateDirectory returns false', () => {
        validateDirectoryStub.returns(false);
        const part: Part = { sendPic: [{ id: 'http://cam/snap', delay: 0, fileName: 'pic.jpg' }] };
        const result = sendPic(store, 'telegram.0', part, 'Alice', [], 'key');
        expect(loadWithCurlStub.called).to.be.false;
        expect(result).to.deep.equal([]);
    });

    it('should call loadWithCurl with callback when delay <= 0', () => {
        const part: Part = { sendPic: [{ id: 'http://cam/snap', delay: 0, fileName: 'pic.jpg' }] };
        sendPic(store, 'telegram.0', part, 'Alice', [], 'key');
        expect(loadWithCurlStub.calledOnce).to.be.true;
    });

    it('should schedule via setTimeout when delay > 0', () => {
        const part: Part = { sendPic: [{ id: 'http://cam/snap', delay: 5, fileName: 'pic.jpg' }] };
        sendPic(store, 'telegram.0', part, 'Alice', [], 'key');
        expect(adapterMock.setTimeout.calledOnce).to.be.true;
    });

    it('should send the picture via the loadWithCurl callback when delay <= 0', async () => {
        const part: Part = { sendPic: [{ id: 'http://cam/snap', delay: 0, fileName: 'pic.jpg' }] };
        sendPic(store, 'telegram.0', part, 'Alice', [], 'key');

        // 4th argument of loadWithCurl is the send callback (line 36)
        const sendCallback = loadWithCurlStub.firstCall.args[3];
        expect(sendCallback).to.be.a('function');
        await sendCallback();

        expect(sendToTelegramStub.calledOnce).to.be.true;
        expect(sendToTelegramStub.firstCall.args[0].textToSend).to.equal('/pics/pic.jpg');
        expect(sendToTelegramStub.firstCall.args[0].userToSend).to.equal('Alice');
    });

    it('should push the timeout into the returned list when delay > 0 (line 68)', () => {
        adapterMock.setTimeout.returns(42);
        const part: Part = { sendPic: [{ id: 'http://cam/snap', delay: 5, fileName: 'pic.jpg' }] };
        const result = sendPic(store, 'telegram.0', part, 'Alice', [], 'key');

        expect(result).to.have.lengthOf(1);
        expect(result[0]).to.deep.equal({ key: 'key0', timeout: 42 });
    });

    it('should not push when adapter.setTimeout returns no handle', () => {
        adapterMock.setTimeout.returns(undefined);
        const part: Part = { sendPic: [{ id: 'http://cam/snap', delay: 5, fileName: 'pic.jpg' }] };
        const result = sendPic(store, 'telegram.0', part, 'Alice', [], 'key');
        expect(result).to.deep.equal([]);
    });

    it('should send picture and clear the timeout inside the setTimeout callback (lines 50-62)', async () => {
        adapterMock.setTimeout.returns(42);
        const part: Part = { sendPic: [{ id: 'http://cam/snap', delay: 5, fileName: 'pic.jpg' }] };
        sendPic(store, 'telegram.0', part, 'Alice', [], 'key');

        // Execute the scheduled callback manually
        const timeoutCallback = adapterMock.setTimeout.firstCall.args[0];
        await timeoutCallback();

        expect(sendToTelegramStub.calledOnce).to.be.true;
        expect(sendToTelegramStub.firstCall.args[0].textToSend).to.equal('/pics/pic.jpg');
        // The pushed timeout (key 'key0', handle 42) is found and cleared
        expect(adapterMock.clearTimeout.calledOnceWith(42)).to.be.true;
        expect(adapterMock.log.debug.calledWithMatch(sinon.match(/delay 5/))).to.be.true;
    });

    it('should use distinct timeout keys for multiple delayed pictures', () => {
        adapterMock.setTimeout.returns(7);
        const part: Part = {
            sendPic: [
                { id: 'http://cam/snap1', delay: 5, fileName: 'a.jpg' },
                { id: 'http://cam/snap2', delay: 5, fileName: 'b.jpg' },
            ],
        };
        const result = sendPic(store, 'telegram.0', part, 'Alice', [], 'key');
        expect(result).to.have.lengthOf(2);
        expect(result[0].key).to.not.equal(result[1].key);
    });
});

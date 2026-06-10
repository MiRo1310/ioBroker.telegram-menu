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
});

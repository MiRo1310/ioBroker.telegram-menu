import { expect } from 'chai';
import sinon from 'sinon';
import { sendPic } from '@backend/app/sendpic';
import type { Part, TelegramParams, Timeouts } from '@backend/types/types';

describe('sendPic', () => {
    let adapterMock: any;
    let telegramParams: TelegramParams;
    let loadWithCurlStub: sinon.SinonStub;
    let validateDirectoryStub: sinon.SinonStub;
    let sendToTelegramStub: sinon.SinonStub;

    beforeEach(() => {
        adapterMock = {
            log: { debug: sinon.stub(), warn: sinon.stub(), error: sinon.stub() },
            setTimeout: sinon.stub(),
            clearTimeout: sinon.stub(),
        };
        telegramParams = { adapter: adapterMock } as any;

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
        const result = sendPic('telegram.0', part, 'Alice', telegramParams, 'tok', '/pics/', [], 'key');
        expect(result).to.deep.equal([]);
    });

    it('should return timeouts unchanged when part.sendPic is empty', () => {
        const part: Part = { sendPic: [] };
        const result = sendPic('telegram.0', part, 'Alice', telegramParams, 'tok', '/pics/', [], 'key');
        expect(result).to.deep.equal([]);
    });

    it('should skip entries with empty id (not a startside)', () => {
        const part: Part = { sendPic: [{ id: '', delay: 0, fileName: 'pic.jpg' }] };
        const result = sendPic('telegram.0', part, 'Alice', telegramParams, 'tok', '/pics/', [], 'key');
        expect(loadWithCurlStub.called).to.be.false;
        expect(result).to.deep.equal([]);
    });

    it('should skip entries when validateDirectory returns false', () => {
        validateDirectoryStub.returns(false);
        const part: Part = { sendPic: [{ id: 'http://cam/snap', delay: 0, fileName: 'pic.jpg' }] };
        const result = sendPic('telegram.0', part, 'Alice', telegramParams, 'tok', '/pics/', [], 'key');
        expect(loadWithCurlStub.called).to.be.false;
        expect(result).to.deep.equal([]);
    });

    it('should call loadWithCurl with callback when delay <= 0', () => {
        const part: Part = { sendPic: [{ id: 'http://cam/snap', delay: 0, fileName: 'pic.jpg' }] };
        const result = sendPic('telegram.0', part, 'Alice', telegramParams, 'tok', '/pics/', [], 'key');
        expect(loadWithCurlStub.calledOnce).to.be.true;
        // callback is the 5th argument
        expect(typeof loadWithCurlStub.firstCall.args[4]).to.equal('function');
        expect(result).to.deep.equal([]);
    });

    it('should replace &amp; with & in the url', () => {
        const part: Part = { sendPic: [{ id: 'http://cam/snap?a=1&amp;b=2', delay: 0, fileName: 'pic.jpg' }] };
        sendPic('telegram.0', part, 'Alice', telegramParams, 'tok', '/pics/', [], 'key');
        // The url passed to loadWithCurl (3rd arg = path, 4th arg = url)
        const url = loadWithCurlStub.firstCall.args[3];
        expect(url).to.equal('http://cam/snap?a=1&b=2');
    });

    it('should call loadWithCurl without callback and push timeout when delay > 0', () => {
        const fakeTimeout = {} as any;
        adapterMock.setTimeout.returns(fakeTimeout);

        const part: Part = { sendPic: [{ id: 'http://cam/snap', delay: 500, fileName: 'pic.jpg' }] };
        const result = sendPic('telegram.0', part, 'Alice', telegramParams, 'tok', '/pics/', [], 'key');

        // loadWithCurl called without callback (4 args)
        expect(loadWithCurlStub.calledOnce).to.be.true;
        expect(loadWithCurlStub.firstCall.args.length).to.equal(4);

        // setTimeout was called
        expect(adapterMock.setTimeout.calledOnce).to.be.true;
        expect(adapterMock.setTimeout.firstCall.args[1]).to.equal(500);

        // timeout was pushed
        expect(result).to.have.lengthOf(1);
        expect(result[0].timeout).to.equal(fakeTimeout);
    });

    it('should not push timeout when adapter.setTimeout returns falsy', () => {
        adapterMock.setTimeout.returns(undefined);
        const part: Part = { sendPic: [{ id: 'http://cam/snap', delay: 100, fileName: 'pic.jpg' }] };
        const result = sendPic('telegram.0', part, 'Alice', telegramParams, 'tok', '/pics/', [], 'key');
        expect(result).to.deep.equal([]);
    });

    it('should construct path from directoryPicture + fileName', () => {
        const part: Part = { sendPic: [{ id: 'http://cam/snap', delay: 0, fileName: 'photo.jpg' }] };
        sendPic('telegram.0', part, 'Alice', telegramParams, 'tok', '/pictures/', [], 'key');
        const path = loadWithCurlStub.firstCall.args[2];
        expect(path).to.equal('/pictures/photo.jpg');
    });

    it('should return timeouts on error', () => {
        // Force an error by making forEach throw
        const part: Part = { sendPic: null as any };
        const existingTimeouts: Timeouts[] = [{ key: 'old', timeout: {} as any }];
        const result = sendPic('telegram.0', part, 'Alice', telegramParams, 'tok', '/pics/', existingTimeouts, 'key');
        expect(result).to.deep.equal(existingTimeouts);
    });
});


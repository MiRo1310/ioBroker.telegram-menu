import { expect } from 'chai';
import sinon from 'sinon';
import { createAppContextMock } from '../../fixtures/appContextMock';

const childProcessModule = require('node:child_process');

describe('exec', () => {
    let originalExec: any;
    let execFake: sinon.SinonStub;
    let adapterMock: any;

    beforeEach(() => {
        originalExec = childProcessModule.exec;
        execFake = sinon.stub();
        childProcessModule.exec = execFake;

        adapterMock = {
            log: { debug: sinon.stub(), warn: sinon.stub(), error: sinon.stub() },
            supportsFeature: sinon.stub().returns(false),
        };
    });

    afterEach(() => {
        childProcessModule.exec = originalExec;
    });

    function getLoadWithCurl(): typeof import('@backend/app/exec').loadWithCurl {
        return require('@backend/app/exec').loadWithCurl;
    }

    it('should execute curl command with correct arguments', () => {
        const store = createAppContextMock(adapterMock, { token: ' myToken ' });
        getLoadWithCurl()(store, '/pics/photo.jpg', 'http://example.com/img');
        expect(execFake.calledOnce).to.be.true;
        const cmd = execFake.firstCall.args[0];
        expect(cmd).to.equal('curl -H "Authorization: Bearer myToken" "http://example.com/img" > /pics/photo.jpg');
    });

    it('should log stdout when present', () => {
        const store = createAppContextMock(adapterMock, { token: 'tok' });
        getLoadWithCurl()(store, '/p', 'http://url');
        const cb = execFake.firstCall.args[1];
        cb(null, 'some output', '');
        expect(adapterMock.log.debug.calledWith('Stdout : "some output"')).to.be.true;
    });

    it('should log stderr when present', () => {
        const store = createAppContextMock(adapterMock, { token: 'tok' });
        getLoadWithCurl()(store, '/p', 'http://url');
        const cb = execFake.firstCall.args[1];
        cb(null, '', 'warning text');
        expect(adapterMock.log.debug.calledWith('Stderr : "warning text"')).to.be.true;
    });

    it('should log error and return without calling callback on exec error', () => {
        const store = createAppContextMock(adapterMock, { token: 'tok' });
        const callback = sinon.stub();
        getLoadWithCurl()(store, '/p', 'http://url', callback);
        const cb = execFake.firstCall.args[1];
        cb(new Error('fail'), '', '');
        expect(adapterMock.log.error.called).to.be.true;
        expect(callback.called).to.be.false;
    });

    it('should return without error when no callback is provided and no error', () => {
        const store = createAppContextMock(adapterMock, { token: 'tok' });
        getLoadWithCurl()(store, '/p', 'http://url');
        const cb = execFake.firstCall.args[1];
        cb(null, '', '');
        expect(adapterMock.log.debug.calledWith('Curl command executed successfully')).to.be.false;
    });

    it('should call callback and log success when no error and callback provided', () => {
        const store = createAppContextMock(adapterMock, { token: 'tok' });
        const callback = sinon.stub();
        getLoadWithCurl()(store, '/p', 'http://url', callback);
        const cb = execFake.firstCall.args[1];
        cb(null, '', '');
        expect(adapterMock.log.debug.calledWith('Curl command executed successfully')).to.be.true;
        expect(callback.calledOnce).to.be.true;
    });
});

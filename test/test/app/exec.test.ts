import { expect } from 'chai';
import sinon from 'sinon';

// We cannot stub node:child_process.exec directly, so we stub the re-exported
// loadWithCurl at the module level and test the inner callback logic by
// importing the module and invoking exec's callback manually via a fake.
// Instead, we use a different approach: replace exec on the required module.

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

    // Re-require after patching won't work with cached imports, so we need
    // to call loadWithCurl which internally calls the now-patched exec.
    // However, since the import is bound at load time for ESM-style, we
    // need to use require() for loadWithCurl too.
    function getLoadWithCurl(): typeof import('@backend/app/exec').loadWithCurl {
        return require('@backend/app/exec').loadWithCurl;
    }

    it('should execute curl command with correct arguments', () => {
        getLoadWithCurl()(adapterMock, ' myToken ', '/pics/photo.jpg', 'http://example.com/img');
        expect(execFake.calledOnce).to.be.true;
        const cmd = execFake.firstCall.args[0];
        expect(cmd).to.equal('curl -H "Authorization: Bearer myToken" "http://example.com/img" > /pics/photo.jpg');
    });

    it('should log stdout when present', () => {
        getLoadWithCurl()(adapterMock, 'tok', '/p', 'http://url');
        const cb = execFake.firstCall.args[1];
        cb(null, 'some output', '');
        expect(adapterMock.log.debug.calledWith('Stdout : "some output"')).to.be.true;
    });

    it('should log stderr when present', () => {
        getLoadWithCurl()(adapterMock, 'tok', '/p', 'http://url');
        const cb = execFake.firstCall.args[1];
        cb(null, '', 'warning text');
        expect(adapterMock.log.debug.calledWith('Stderr : "warning text"')).to.be.true;
    });

    it('should log error and return without calling callback on exec error', () => {
        const callback = sinon.stub();
        getLoadWithCurl()(adapterMock, 'tok', '/p', 'http://url', callback);
        const cb = execFake.firstCall.args[1];
        cb(new Error('fail'), '', '');
        expect(adapterMock.log.error.called).to.be.true;
        expect(callback.called).to.be.false;
    });

    it('should return without error when no callback is provided and no error', () => {
        getLoadWithCurl()(adapterMock, 'tok', '/p', 'http://url');
        const cb = execFake.firstCall.args[1];
        cb(null, '', '');
        expect(adapterMock.log.debug.calledWith('Curl command executed successfully')).to.be.false;
    });

    it('should call callback and log success when no error and callback provided', () => {
        const callback = sinon.stub();
        getLoadWithCurl()(adapterMock, 'tok', '/p', 'http://url', callback);
        const cb = execFake.firstCall.args[1];
        cb(null, '', '');
        expect(adapterMock.log.debug.calledWith('Curl command executed successfully')).to.be.true;
        expect(callback.calledOnce).to.be.true;
    });
});

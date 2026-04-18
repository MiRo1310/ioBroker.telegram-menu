import { expect } from 'chai';
import sinon from 'sinon';
import { errorLogger } from '@backend/app/logging';

describe('logging', () => {
    let adapterMock: any;

    beforeEach(() => {
        adapterMock = {
            log: {
                error: sinon.stub(),
            },
            supportsFeature: sinon.stub(),
            getPluginInstance: sinon.stub(),
        };
    });

    it('should log error title, message and stack', () => {
        const error = new Error('test error');
        errorLogger('Test title', error, adapterMock);

        expect(adapterMock.log.error.calledWith('Test title')).to.be.true;
        expect(adapterMock.log.error.calledWith(`Error message: ${error.message}`)).to.be.true;
        expect(adapterMock.log.error.calledWith(`Error stack: ${error.stack}`)).to.be.true;
    });

    it('should log server response and status if response exists', () => {
        const error: any = new Error('server error');
        error.response = { status: 500, statusText: 'Internal Server Error' };

        errorLogger('Server error', error, adapterMock);

        expect(adapterMock.log.error.calledWith('Server response: 500')).to.be.true;
        expect(adapterMock.log.error.calledWith('Server status: Internal Server Error')).to.be.true;
    });

    it('should not log server response if response is missing', () => {
        const error = new Error('no response');
        errorLogger('No response', error, adapterMock);

        const calls = adapterMock.log.error.args.map((a: any) => a[0]);
        expect(calls.some((c: string) => c.startsWith('Server response'))).to.be.false;
    });

    it('should call sentry captureException if sentry plugin is available', () => {
        const captureException = sinon.stub();
        const sentryMock = { getSentryObject: () => ({ captureException }) };

        adapterMock.supportsFeature.withArgs('PLUGINS').returns(true);
        adapterMock.getPluginInstance.withArgs('sentry').returns(sentryMock);

        const error = new Error('sentry error');
        errorLogger('Sentry test', error, adapterMock);

        expect(captureException.calledOnce).to.be.true;
        expect(captureException.calledWith(error)).to.be.true;
    });

    it('should not throw if sentry plugin is not available', () => {
        adapterMock.supportsFeature.withArgs('PLUGINS').returns(true);
        adapterMock.getPluginInstance.withArgs('sentry').returns(null);

        const error = new Error('no sentry');
        expect(() => errorLogger('No sentry', error, adapterMock)).to.not.throw();
    });

    it('should not call sentry if supportsFeature returns false', () => {
        adapterMock.supportsFeature.withArgs('PLUGINS').returns(false);

        const error = new Error('no plugin');
        errorLogger('No plugin', error, adapterMock);

        expect(adapterMock.getPluginInstance.called).to.be.false;
    });
});

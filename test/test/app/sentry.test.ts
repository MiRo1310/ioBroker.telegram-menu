import { expect } from 'chai';
import sinon from 'sinon';
import { sendToSentry } from '../../../src/app/sentry';

describe('sentry', () => {
    it('should call Sentry.captureMessage when plugins supported and sentry available', () => {
        const captureMessage = sinon.stub();
        const withScope = sinon.stub().callsFake((cb: any) => cb({ setLevel: sinon.stub(), setExtra: sinon.stub() }));
        const adapterMock: any = {
            supportsFeature: sinon.stub().returns(true),
            getPluginInstance: sinon.stub().returns({
                getSentryObject: () => ({ withScope, captureMessage }),
            }),
        };
        sendToSentry(new Error('test'), adapterMock);
        expect(withScope.calledOnce).to.be.true;
    });

    it('should do nothing if supportsFeature is falsy', () => {
        const adapterMock: any = {
            supportsFeature: sinon.stub().returns(false),
        };
        sendToSentry(new Error('test'), adapterMock);
        // no crash
    });

    it('should do nothing if sentry plugin is not available', () => {
        const adapterMock: any = {
            supportsFeature: sinon.stub().returns(true),
            getPluginInstance: sinon.stub().returns(null),
        };
        sendToSentry(new Error('test'), adapterMock);
    });

    it('should handle missing Sentry object', () => {
        const adapterMock: any = {
            supportsFeature: sinon.stub().returns(true),
            getPluginInstance: sinon.stub().returns({
                getSentryObject: () => null,
            }),
        };
        sendToSentry(new Error('test'), adapterMock);
    });
});


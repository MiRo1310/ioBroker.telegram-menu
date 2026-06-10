import { expect } from 'chai';
import sinon from 'sinon';
import { idBySelector } from '@backend/app/idBySelector';
import { createAppContextMock } from '../../fixtures/appContextMock';
import type { AppContext } from '@backend/app/appContext';

describe('idBySelector', () => {
    let adapterMock: any;
    let appContextMock: AppContext;
    let sendToTelegramStub: sinon.SinonStub;

    beforeEach(() => {
        adapterMock = {
            log: { debug: sinon.stub(), warn: sinon.stub(), error: sinon.stub() },
            language: 'en',
            getEnumsAsync: sinon.stub(),
            getForeignStateAsync: sinon.stub(),
            getForeignObjectAsync: sinon.stub(),
            supportsFeature: sinon.stub().returns(false),
        };
        appContextMock = createAppContextMock(adapterMock);

        sendToTelegramStub = sinon.stub(require('@backend/app/telegram'), 'sendToTelegram').resolves();
    });

    afterEach(() => {
        sinon.restore();
    });

    function call(selector: string, text = 'Value: ', newline: string = 'false') {
        return idBySelector({
            instance: 'telegram.0',
            appContext: appContextMock,
            selector,
            text,
            userToSend: 'Alice',
            newline: newline as any,
        });
    }

    it('should return early if enum function is not found', async () => {
        adapterMock.getEnumsAsync.resolves({ 'enum.functions': {} });
        await call('functions=light');
        // Give promise chain time to resolve
        await new Promise(r => setTimeout(r, 10));
        expect(sendToTelegramStub.called).to.be.false;
    });

    it('should return early if members is undefined', async () => {
        adapterMock.getEnumsAsync.resolves({
            'enum.functions': {
                'enum.functions.light': { common: { members: undefined } },
            },
        });
        await call('functions=light');
        await new Promise(r => setTimeout(r, 10));
        expect(sendToTelegramStub.called).to.be.false;
    });

    it('should send combined text for all members', async () => {
        adapterMock.getEnumsAsync.resolves({
            'enum.functions': {
                'enum.functions.light': {
                    common: { members: ['state.0.light1', 'state.0.light2'] },
                },
            },
        });
        adapterMock.getForeignStateAsync.resolves({ val: true });
        adapterMock.getForeignObjectAsync.resolves({ common: { name: 'Light1' } });

        await call('functions=light', 'Value: &&');
        await new Promise(r => setTimeout(r, 10));
        expect(sendToTelegramStub.calledOnce).to.be.true;
    });
});

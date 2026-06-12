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

    // ─── {common.name} path (getCommonName branches, indirect) ──────────────

    function setupSingleMember(id = 'state.0.light1'): void {
        adapterMock.getEnumsAsync.resolves({
            'enum.functions': {
                'enum.functions.light': {
                    common: { members: [id] },
                },
            },
        });
        adapterMock.getForeignStateAsync.resolves({ val: true });
    }

    it('should replace {common.name} with a plain string name', async () => {
        setupSingleMember();
        adapterMock.getForeignObjectAsync.resolves({ common: { name: 'Deckenlampe' } });

        await call('functions=light', '{common.name}: &&');
        expect(sendToTelegramStub.calledOnce).to.be.true;
        expect(sendToTelegramStub.firstCall.args[0].textToSend).to.include('Deckenlampe');
    });

    it('should pick the language key from a translated name object (de)', async () => {
        adapterMock.language = 'de';
        setupSingleMember();
        adapterMock.getForeignObjectAsync.resolves({ common: { name: { de: 'Licht', en: 'Light' } } });

        await call('functions=light', '{common.name}: &&');
        expect(sendToTelegramStub.firstCall.args[0].textToSend).to.include('Licht');
        expect(sendToTelegramStub.firstCall.args[0].textToSend).to.not.include('Light');
    });

    it('should fall back to "en" when adapter.language is undefined', async () => {
        adapterMock.language = undefined;
        setupSingleMember();
        adapterMock.getForeignObjectAsync.resolves({ common: { name: { de: 'Licht', en: 'Light' } } });

        await call('functions=light', '{common.name}: &&');
        expect(sendToTelegramStub.firstCall.args[0].textToSend).to.include('Light');
    });

    it('should use empty string when the name object has no entry for the language', async () => {
        adapterMock.language = 'de';
        setupSingleMember();
        adapterMock.getForeignObjectAsync.resolves({ common: { name: { en: 'Light' } } });

        await call('functions=light', '{common.name}X: &&');
        // name['de'] is undefined → '' → placeholder removed without text
        expect(sendToTelegramStub.firstCall.args[0].textToSend).to.include('X:');
        expect(sendToTelegramStub.firstCall.args[0].textToSend).to.not.include('Light');
    });

    it('should use empty string when common.name is undefined', async () => {
        setupSingleMember();
        adapterMock.getForeignObjectAsync.resolves({ common: {} });

        await call('functions=light', '{common.name}X: &&');
        expect(sendToTelegramStub.calledOnce).to.be.true;
        expect(sendToTelegramStub.firstCall.args[0].textToSend).to.include('X:');
    });

    it('should use empty string when the member state is missing (line 51 ?? branch)', async () => {
        setupSingleMember();
        adapterMock.getForeignStateAsync.resolves(undefined);
        adapterMock.getForeignObjectAsync.resolves({ common: { name: 'Lampe' } });

        await call('functions=light', '{common.name}: &&');
        expect(sendToTelegramStub.calledOnce).to.be.true;
        expect(sendToTelegramStub.firstCall.args[0].textToSend).to.include('Lampe');
    });

    // ─── {folder.name} path (removeLastPartOfId, indirect) ──────────────────

    it('should resolve {folder.name} via the parent object id', async () => {
        setupSingleMember('0_userdata.0.Fenster.Status');
        adapterMock.getForeignObjectAsync.withArgs('0_userdata.0.Fenster').resolves({
            common: { name: 'Fenster' },
        });

        await call('functions=light', '{folder.name}: &&');
        // removeLastPartOfId('0_userdata.0.Fenster.Status') → '0_userdata.0.Fenster'
        expect(adapterMock.getForeignObjectAsync.calledWith('0_userdata.0.Fenster')).to.be.true;
        expect(sendToTelegramStub.firstCall.args[0].textToSend).to.include('Fenster');
    });

    it('should resolve both {common.name} and {folder.name} in the same text', async () => {
        setupSingleMember('0_userdata.0.Fenster.Status');
        adapterMock.getForeignObjectAsync.withArgs('0_userdata.0.Fenster.Status').resolves({
            common: { name: 'Status' },
        });
        adapterMock.getForeignObjectAsync.withArgs('0_userdata.0.Fenster').resolves({
            common: { name: 'Fenster' },
        });

        await call('functions=light', '{folder.name} {common.name}: &&');
        const { textToSend } = sendToTelegramStub.firstCall.args[0];
        expect(textToSend).to.include('Fenster');
        expect(textToSend).to.include('Status');
    });
});

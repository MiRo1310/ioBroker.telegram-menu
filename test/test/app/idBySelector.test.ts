import { expect } from 'chai';
import sinon from 'sinon';
import { idBySelector } from '@backend/app/idBySelector';
import type { TelegramParams } from '@backend/types/types';

describe('idBySelector', () => {
    let adapterMock: any;
    let telegramParams: TelegramParams;
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
        telegramParams = { adapter: adapterMock } as any;

        sendToTelegramStub = sinon.stub(require('@backend/app/telegram'), 'sendToTelegram').resolves();
    });

    afterEach(() => {
        sinon.restore();
    });

    function call(selector: string, text = 'Value: ', newline: string = 'false') {
        return idBySelector({
            instance: 'telegram.0',
            adapter: adapterMock,
            selector,
            text,
            userToSend: 'Alice',
            newline: newline as any,
            telegramParams,
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
                'enum.functions.light': { common: { members: ['state.0.light1', 'state.0.light2'] } },
            },
        });
        adapterMock.getForeignStateAsync.withArgs('state.0.light1').resolves({ val: 'on' });
        adapterMock.getForeignStateAsync.withArgs('state.0.light2').resolves({ val: 'off' });

        await call('functions=light', 'Status: ');
        // Wait for Promise.all().then() chain
        await new Promise(r => setTimeout(r, 50));

        expect(sendToTelegramStub.calledOnce).to.be.true;
        const sentText = sendToTelegramStub.firstCall.args[0].textToSend;
        expect(sentText).to.include('on');
        expect(sentText).to.include('off');
    });

    it('should replace {common.name} with object common name', async () => {
        adapterMock.getEnumsAsync.resolves({
            'enum.functions': {
                'enum.functions.light': { common: { members: ['state.0.light1'] } },
            },
        });
        adapterMock.getForeignStateAsync.withArgs('state.0.light1').resolves({ val: true });
        adapterMock.getForeignObjectAsync.withArgs('state.0.light1').resolves({
            common: { name: { en: 'Living Room Light' } },
        });

        await call('functions=light', '{common.name}: ');
        await new Promise(r => setTimeout(r, 50));

        expect(sendToTelegramStub.calledOnce).to.be.true;
        const sentText = sendToTelegramStub.firstCall.args[0].textToSend;
        expect(sentText).to.include('Living Room Light');
    });

    it('should replace {folder.name} with parent object common name', async () => {
        adapterMock.getEnumsAsync.resolves({
            'enum.functions': {
                'enum.functions.light': { common: { members: ['state.0.room.light1'] } },
            },
        });
        adapterMock.getForeignStateAsync.withArgs('state.0.room.light1').resolves({ val: true });
        adapterMock.getForeignObjectAsync.withArgs('state.0.room').resolves({
            common: { name: 'Room A' },
        });

        await call('functions=light', '{folder.name}: ');
        await new Promise(r => setTimeout(r, 50));

        expect(sendToTelegramStub.calledOnce).to.be.true;
        const sentText = sendToTelegramStub.firstCall.args[0].textToSend;
        expect(sentText).to.include('Room A');
    });

    it('should handle string common.name', async () => {
        adapterMock.getEnumsAsync.resolves({
            'enum.functions': {
                'enum.functions.light': { common: { members: ['state.0.x'] } },
            },
        });
        adapterMock.getForeignStateAsync.resolves({ val: 'v' });
        adapterMock.getForeignObjectAsync.withArgs('state.0.x').resolves({
            common: { name: 'Simple Name' },
        });

        await call('functions=light', '{common.name} ');
        await new Promise(r => setTimeout(r, 50));

        expect(sendToTelegramStub.calledOnce).to.be.true;
        expect(sendToTelegramStub.firstCall.args[0].textToSend).to.include('Simple Name');
    });

    it('should handle empty common.name', async () => {
        adapterMock.getEnumsAsync.resolves({
            'enum.functions': {
                'enum.functions.light': { common: { members: ['state.0.x'] } },
            },
        });
        adapterMock.getForeignStateAsync.resolves({ val: 'v' });
        adapterMock.getForeignObjectAsync.withArgs('state.0.x').resolves({
            common: { name: undefined },
        });

        await call('functions=light', '{common.name} ');
        await new Promise(r => setTimeout(r, 50));

        expect(sendToTelegramStub.calledOnce).to.be.true;
    });

    it('should add newline when newline is true', async () => {
        adapterMock.getEnumsAsync.resolves({
            'enum.functions': {
                'enum.functions.light': { common: { members: ['state.0.x'] } },
            },
        });
        adapterMock.getForeignStateAsync.resolves({ val: 'val' });

        await call('functions=light', 'Text: ', 'true');
        await new Promise(r => setTimeout(r, 50));

        expect(sendToTelegramStub.calledOnce).to.be.true;
        const sentText = sendToTelegramStub.firstCall.args[0].textToSend;
        expect(sentText).to.include('\n');
    });

    it('should handle state with null val', async () => {
        adapterMock.getEnumsAsync.resolves({
            'enum.functions': {
                'enum.functions.light': { common: { members: ['state.0.x'] } },
            },
        });
        adapterMock.getForeignStateAsync.resolves({ val: null });

        await call('functions=light', 'Text: ');
        await new Promise(r => setTimeout(r, 50));

        expect(sendToTelegramStub.calledOnce).to.be.true;
    });

    it('should catch errors in the main try block', async () => {
        adapterMock.getEnumsAsync.rejects(new Error('enum error'));

        await call('functions=light');
        await new Promise(r => setTimeout(r, 50));

        expect(adapterMock.log.error.called).to.be.true;
    });
});


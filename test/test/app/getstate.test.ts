import { expect } from 'chai';
import sinon from 'sinon';
import { getState } from '@backend/app/getstate';
import type { Part, TelegramParams } from '@backend/types/types';

describe('getState', () => {
    let adapterMock: any;
    let telegramParams: TelegramParams;
    let sendToTelegramStub: sinon.SinonStub;
    let sendToTelegramSubmenuStub: sinon.SinonStub;
    let idBySelectorStub: sinon.SinonStub;
    let bindingFuncStub: sinon.SinonStub;
    let createKeyboardFromJsonStub: sinon.SinonStub;
    let createTextTableFromJsonStub: sinon.SinonStub;

    beforeEach(() => {
        adapterMock = {
            log: { debug: sinon.stub(), warn: sinon.stub(), error: sinon.stub() },
            getForeignStateAsync: sinon.stub(),
            supportsFeature: sinon.stub().returns(false),
        };
        telegramParams = { adapter: adapterMock } as any;

        sendToTelegramStub = sinon.stub(require('@backend/app/telegram'), 'sendToTelegram').resolves();
        sendToTelegramSubmenuStub = sinon.stub(require('@backend/app/telegram'), 'sendToTelegramSubmenu').resolves();
        idBySelectorStub = sinon.stub(require('@backend/app/idBySelector'), 'idBySelector').resolves();
        bindingFuncStub = sinon.stub(require('@backend/app/action'), 'bindingFunc').resolves();
        createKeyboardFromJsonStub = sinon.stub(require('@backend/app/jsonTable'), 'createKeyboardFromJson');
        createTextTableFromJsonStub = sinon.stub(require('@backend/app/jsonTable'), 'createTextTableFromJson');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should do nothing when getData is empty', async () => {
        const part: Part = { getData: [] };
        await getState('telegram.0', part, 'Alice', telegramParams);
        expect(sendToTelegramStub.called).to.be.false;
    });

    it('should call idBySelector when id includes functions=', async () => {
        const part: Part = {
            getData: [{ id: 'functions=light', text: 'Lights', newline: false }],
        } as any;
        await getState('telegram.0', part, 'Alice', telegramParams);
        expect(idBySelectorStub.calledOnce).to.be.true;
    });

    it('should call bindingFunc when text includes binding:{', async () => {
        const part: Part = {
            getData: [{ id: 'state.0.temp', text: 'binding:{temp=state.0.temp?temp>20}', newline: false }],
        } as any;
        await getState('telegram.0', part, 'Alice', telegramParams);
        expect(bindingFuncStub.calledOnce).to.be.true;
    });

    it('should log error and set N/A when state is undefined', async () => {
        adapterMock.getForeignStateAsync.resolves(undefined);
        const part: Part = {
            getData: [{ id: 'state.0.missing', text: 'Val:', newline: false }],
        } as any;
        await getState('telegram.0', part, 'Alice', telegramParams);
        expect(adapterMock.log.error.calledWith('The state is empty!')).to.be.true;
        // N/A is placed in array → sendToTelegram is called with it
        expect(sendToTelegramStub.calledOnce).to.be.true;
        expect(sendToTelegramStub.firstCall.args[0].textToSend).to.include('N/A');
    });

    it('should log error and set N/A when state is null', async () => {
        adapterMock.getForeignStateAsync.resolves(null);
        const part: Part = {
            getData: [{ id: 'state.0.missing', text: 'Val:', newline: false }],
        } as any;
        await getState('telegram.0', part, 'Alice', telegramParams);
        expect(adapterMock.log.error.calledWith('The state is empty!')).to.be.true;
    });

    it('should send state value with text to telegram', async () => {
        adapterMock.getForeignStateAsync.withArgs('state.0.temp').resolves({ val: 21.5 });
        const part: Part = {
            getData: [{ id: 'state.0.temp', text: 'Temperature:', newline: false }],
        } as any;
        await getState('telegram.0', part, 'Alice', telegramParams);
        expect(sendToTelegramStub.calledOnce).to.be.true;
        const sentText = sendToTelegramStub.firstCall.args[0].textToSend;
        expect(sentText).to.include('Temperature:');
        expect(sentText).to.include('21.5');
    });

    it('should handle multiple getData entries and preserve order', async () => {
        adapterMock.getForeignStateAsync.withArgs('state.0.a').resolves({ val: 'AAA' });
        adapterMock.getForeignStateAsync.withArgs('state.0.b').resolves({ val: 'BBB' });
        const part: Part = {
            getData: [
                { id: 'state.0.a', text: 'First:', newline: false },
                { id: 'state.0.b', text: 'Second:', newline: false },
            ],
        } as any;
        await getState('telegram.0', part, 'Alice', telegramParams);
        expect(sendToTelegramStub.calledOnce).to.be.true;
        const sentText = sendToTelegramStub.firstCall.args[0].textToSend;
        expect(sentText.indexOf('First:')).to.be.lessThan(sentText.indexOf('Second:'));
    });

    it('should add newline when newline is true', async () => {
        adapterMock.getForeignStateAsync.resolves({ val: 'val' });
        const part: Part = {
            getData: [{ id: 'state.0.x', text: 'Line:', newline: true }],
        } as any;
        await getState('telegram.0', part, 'Alice', telegramParams);
        expect(sendToTelegramStub.calledOnce).to.be.true;
        const sentText = sendToTelegramStub.firstCall.args[0].textToSend;
        expect(sentText).to.include('\n');
    });

    it('should handle change{} syntax in text', async () => {
        adapterMock.getForeignStateAsync.resolves({ val: true });
        const part: Part = {
            getData: [{ id: 'state.0.switch', text: "Light: change{'true':'On','false':'Off'}", newline: false }],
        } as any;
        await getState('telegram.0', part, 'Alice', telegramParams);
        expect(sendToTelegramStub.calledOnce).to.be.true;
        const sentText = sendToTelegramStub.firstCall.args[0].textToSend;
        expect(sentText).to.include('On');
    });

    it('should send text table when text includes TextTable', async () => {
        const jsonVal = JSON.stringify([{ name: 'Item1', value: '10' }]);
        adapterMock.getForeignStateAsync.resolves({ val: jsonVal });
        createTextTableFromJsonStub.returns('Name  | Value\nItem1 | 10');
        const part: Part = {
            getData: [{ id: 'state.0.json', text: 'TextTable', newline: false }],
        } as any;
        await getState('telegram.0', part, 'Alice', telegramParams);
        expect(createTextTableFromJsonStub.calledOnce).to.be.true;
        expect(sendToTelegramStub.calledOnce).to.be.true;
        expect(sendToTelegramStub.firstCall.args[0].parse_mode).to.be.false;
    });

    it('should log debug when TextTable returns null', async () => {
        adapterMock.getForeignStateAsync.resolves({ val: 'invalid' });
        createTextTableFromJsonStub.returns(null);
        const part: Part = {
            getData: [{ id: 'state.0.json', text: 'TextTable', newline: false }],
        } as any;
        await getState('telegram.0', part, 'Alice', telegramParams);
        expect(adapterMock.log.debug.calledWith('Cannot create a Text-Table')).to.be.true;
    });

    it('should handle alexaShoppingList with valid keyboard result', async () => {
        const jsonVal = JSON.stringify([{ name: 'Milk' }]);
        adapterMock.getForeignStateAsync.resolves({ val: jsonVal });
        createKeyboardFromJsonStub.returns({ text: 'ShoppingList', keyboard: [['Milk']] });
        const part: Part = {
            getData: [{ id: 'state.0.list', text: 'alexaShoppingList', newline: false }],
        } as any;
        await getState('telegram.0', part, 'Alice', telegramParams);
        expect(createKeyboardFromJsonStub.calledOnce).to.be.true;
        expect(sendToTelegramSubmenuStub.calledOnce).to.be.true;
    });

    it('should send empty message when alexaShoppingList state is empty string', async () => {
        adapterMock.getForeignStateAsync.resolves({ val: '' });
        createKeyboardFromJsonStub.returns(null);
        const part: Part = {
            getData: [{ id: 'state.0.list', text: 'alexaShoppingList', newline: false }],
        } as any;
        await getState('telegram.0', part, 'Alice', telegramParams);
        expect(sendToTelegramStub.calledOnce).to.be.true;
        expect(sendToTelegramStub.firstCall.args[0].textToSend).to.equal('The state is empty!');
    });

    it('should handle {round:X} syntax', async () => {
        adapterMock.getForeignStateAsync.resolves({ val: 3.14159 });
        const part: Part = {
            getData: [{ id: 'state.0.pi', text: 'Pi: {round:2}', newline: false }],
        } as any;
        await getState('telegram.0', part, 'Alice', telegramParams);
        expect(sendToTelegramStub.calledOnce).to.be.true;
        const sentText = sendToTelegramStub.firstCall.args[0].textToSend;
        expect(sentText).to.include('3.14');
    });

    it('should catch errors and call errorLogger', async () => {
        adapterMock.getForeignStateAsync.rejects(new Error('boom'));
        const part: Part = {
            getData: [{ id: 'state.0.x', text: 'Val:', newline: false }],
        } as any;
        await getState('telegram.0', part, 'Alice', telegramParams);
        expect(adapterMock.log.error.called).to.be.true;
    });

    it('should handle state with val null', async () => {
        adapterMock.getForeignStateAsync.resolves({ val: null });
        const part: Part = {
            getData: [{ id: 'state.0.x', text: 'Val:', newline: false }],
        } as any;
        await getState('telegram.0', part, 'Alice', telegramParams);
        expect(sendToTelegramStub.calledOnce).to.be.true;
    });

    it('should not send when getData is undefined', async () => {
        const part: Part = {};
        await getState('telegram.0', part, 'Alice', telegramParams);
        expect(sendToTelegramStub.called).to.be.false;
    });
});


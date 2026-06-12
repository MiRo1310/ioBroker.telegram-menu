import { expect } from 'chai';
import sinon from 'sinon';
import { getState } from '@backend/app/getstate';
import type { Part } from '@backend/types/types';
import { createAppContextMock } from '../../fixtures/appContextMock';
import type { AppContext } from '@backend/app/appContext';

describe('getState', () => {
    let adapterMock: any;
    let store: AppContext;
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
        store = createAppContextMock(adapterMock);

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
        await getState('telegram.0', part, 'Alice', store);
        expect(sendToTelegramStub.called).to.be.false;
    });

    it('should do nothing when getData is undefined (line 22 || branch)', async () => {
        const part: Part = {};
        await getState('telegram.0', part, 'Alice', store);
        expect(sendToTelegramStub.called).to.be.false;
    });

    it('should use empty string when state.val is null (line 50 ?? branch)', async () => {
        adapterMock.getForeignStateAsync.resolves({ val: null });
        const part: Part = {
            getData: [{ id: 'state.0.temp', text: 'Temp: &&', newline: false }],
        } as any;
        await getState('telegram.0', part, 'Alice', store);
        expect(sendToTelegramStub.calledOnce).to.be.true;
        expect(sendToTelegramStub.firstCall.args[0].textToSend).to.include('Temp:');
    });

    it('should log "No Change" when exchangeValue reports an error (line 102)', async () => {
        adapterMock.getForeignStateAsync.resolves({ val: 1 });
        const part: Part = {
            getData: [{ id: 'state.0.temp', text: 'Val && change{notvalid}', newline: false }],
        } as any;
        await getState('telegram.0', part, 'Alice', store);
        expect(adapterMock.log.debug.calledWith('No Change')).to.be.true;
    });

    it('should call idBySelector when id includes functions=', async () => {
        const part: Part = {
            getData: [{ id: 'functions=light', text: 'Lights', newline: false }],
        } as any;
        await getState('telegram.0', part, 'Alice', store);
        expect(idBySelectorStub.calledOnce).to.be.true;
    });

    it('should call bindingFunc when text includes binding:{', async () => {
        const part: Part = {
            getData: [{ id: 'state.0.temp', text: 'binding:{temp=state.0.temp?temp>20}', newline: false }],
        } as any;
        await getState('telegram.0', part, 'Alice', store);
        expect(bindingFuncStub.calledOnce).to.be.true;
    });

    it('should log error and set N/A when state is undefined', async () => {
        adapterMock.getForeignStateAsync.resolves(undefined);
        const part: Part = {
            getData: [{ id: 'state.0.temp', text: 'Temp: &&', newline: false }],
        } as any;
        await getState('telegram.0', part, 'Alice', store);
        expect(adapterMock.log.error.called).to.be.true;
    });

    it('should send state value when id is valid', async () => {
        adapterMock.getForeignStateAsync.resolves({ val: 21 });
        const part: Part = {
            getData: [{ id: 'state.0.temp', text: 'Temp: &&', newline: false }],
        } as any;
        await getState('telegram.0', part, 'Alice', store);
        expect(sendToTelegramStub.calledOnce).to.be.true;
    });

    it('should send the text table result when text includes TextTable (lines 63-75)', async () => {
        adapterMock.getForeignStateAsync.resolves({ val: '[{"a":1}]' });
        createTextTableFromJsonStub.returns('| a |\n| 1 |');
        const part: Part = {
            getData: [{ id: 'state.0.json', text: 'TextTable', newline: false }],
        } as any;
        await getState('telegram.0', part, 'Alice', store);

        expect(createTextTableFromJsonStub.calledOnce).to.be.true;
        // Only the table send — the aggregated send at the end must not fire
        expect(sendToTelegramStub.calledOnce).to.be.true;
        const args = sendToTelegramStub.firstCall.args[0];
        expect(args.textToSend).to.equal('| a |\n| 1 |');
        expect(args.parse_mode).to.equal(false);
        expect(args.shouldCleanUpString).to.equal(false);
    });

    it('should only log debug when createTextTableFromJson returns null', async () => {
        adapterMock.getForeignStateAsync.resolves({ val: 'notAJson' });
        createTextTableFromJsonStub.returns(null);
        const part: Part = {
            getData: [{ id: 'state.0.json', text: 'TextTable', newline: false }],
        } as any;
        await getState('telegram.0', part, 'Alice', store);

        expect(adapterMock.log.debug.calledWith('Cannot create a Text-Table')).to.be.true;
        // Falls through to the normal exchangeValue path → aggregated send
        expect(sendToTelegramStub.calledOnce).to.be.true;
        expect(sendToTelegramStub.firstCall.args[0].textToSend).to.not.include('| a |');
    });

    it('should send "The state is empty!" for alexaShoppingList with empty state value (lines 86-94)', async () => {
        adapterMock.getForeignStateAsync.resolves({ val: '' });
        createKeyboardFromJsonStub.returns(null);
        const part: Part = {
            getData: [{ id: 'state.0.json', text: 'alexaShoppingList', newline: false }],
        } as any;
        await getState('telegram.0', part, 'Alice', store);

        expect(sendToTelegramStub.calledOnce).to.be.true;
        expect(sendToTelegramStub.firstCall.args[0].textToSend).to.equal('The state is empty!');
        expect(sendToTelegramSubmenuStub.called).to.be.false;
        expect(adapterMock.log.debug.calledWith('The state is empty!')).to.be.true;
    });

    it('should call createKeyboardFromJson when text includes alexaShoppingList', async () => {
        adapterMock.getForeignStateAsync.resolves({ val: '[{"name":"item1"}]' });
        createKeyboardFromJsonStub.returns({ text: 'table', keyboard: { inline_keyboard: [] } });
        const part: Part = {
            getData: [
                {
                    id: 'state.0.json',
                    text: '{"type":"alexaShoppingList","tableData":[],"tableLabel":"List","listName":"shop"}',
                    newline: false,
                },
            ],
        } as any;
        await getState('telegram.0', part, 'Alice', store);
        expect(createKeyboardFromJsonStub.called).to.be.true;
    });
});

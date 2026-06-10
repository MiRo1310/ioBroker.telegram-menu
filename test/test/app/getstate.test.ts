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

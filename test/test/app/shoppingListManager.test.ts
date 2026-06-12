import { expect } from 'chai';
import sinon from 'sinon';
import { createAppContextMock } from '../../fixtures/appContextMock';
import type { AppContext } from '@backend/app/appContext';
import { shoppingListManager } from '@backend/app/shoppingListManager';

const buildVal = (
    user = 'Michael',
    idList = 'list1',
    instance = '0',
    itemId = 'item1',
    listName = 'groceries',
    requestId = 42,
): string => `[${user}]sList:${idList}:${instance}:${itemId}:${listName}:${requestId}`;

describe('shoppingList', () => {
    let adapterMock: any;
    let store: AppContext;

    beforeEach(() => {
        adapterMock = {
            log: { debug: sinon.stub(), warn: sinon.stub(), error: sinon.stub() },
            getForeignObjectAsync: sinon.stub().resolves(null),
            getForeignStateAsync: sinon.stub().resolves(null),
            setState: sinon.stub().resolves(),
            sendTo: sinon.stub(),
        };
        store = createAppContextMock(adapterMock, {
            telegramInstanceList: [{ name: 'telegram.0', active: true }],
            userListWithChatID: [{ name: 'Michael', chatID: '999' }],
            resize_keyboard: true,
            one_time_keyboard: true,
        });

        sinon.stub(require('@backend/app/subscribeStates'), '_subscribeForeignStates').resolves();
        sinon.stub(require('@backend/app/setstate'), 'setstateIobroker').resolves();
        sinon.stub(require('@backend/app/telegram'), 'sendToTelegram').resolves();
        sinon.stub(require('@backend/app/telegram'), 'sendToTelegramSubmenu');
        sinon.stub(require('@backend/app/jsonTable'), 'createKeyboardFromJson').returns(null);
        sinon.stub(require('@backend/app/messageIds'), 'deleteMessageIds').resolves();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('shoppingListSubscribeStateAndDeleteItem', () => {
        it('should delete item, return requestId, and subscribe on first successful call', async () => {
            adapterMock.getForeignObjectAsync.resolves({ _id: 'alexa2.0.Lists.groceries.items.item1' });

            const result = await shoppingListManager.subscribeStateAndDeleteItem(store, buildVal());

            const setstateIobrokerMod = require('@backend/app/setstate');
            expect(setstateIobrokerMod.setstateIobroker.calledOnce).to.be.true;
            expect(result).to.equal(42);
            // isSubscribed starts false on first call — subscription should happen
            const subscribeStates = require('@backend/app/subscribeStates');
            expect(subscribeStates._subscribeForeignStates.calledOnce).to.be.true;
        });

        it('should send "Cannot delete the Item" when object is missing and instance is known (line 51)', async () => {
            // Echter Test statt istanbul-ignore: getLast liefert die Telegram-Instanz des Requests
            adapterMock.getForeignObjectAsync.resolves(null);
            const { lastRequestJsonButtonHistory } = require('../../../src/app/jsonTable');
            sinon.stub(lastRequestJsonButtonHistory, 'getLast').returns({ instance: 'telegram.0', user: 'Michael' });

            const result = await shoppingListManager.subscribeStateAndDeleteItem(store, buildVal());

            expect(result).to.be.undefined;
            const telegramMod = require('../../../src/app/telegram');
            expect(telegramMod.sendToTelegram.calledOnce).to.be.true;
            const args = telegramMod.sendToTelegram.firstCall.args[0];
            expect(args.textToSend).to.equal('Cannot delete the Item');
            expect(args.instance).to.equal('telegram.0');
        });

        it('should return undefined and not subscribe when object is not found', async () => {
            adapterMock.getForeignObjectAsync.resolves(null);

            const result = await shoppingListManager.subscribeStateAndDeleteItem(store, buildVal());
            expect(result).to.be.undefined;
        });

        it('should return undefined when val is null', async () => {
            const result = await shoppingListManager.subscribeStateAndDeleteItem(store, null);
            expect(result).to.be.undefined;
        });

        it('should return undefined when val does not start with user in brackets', async () => {
            const result = await shoppingListManager.subscribeStateAndDeleteItem(store, 'badformat');
            expect(result).to.be.undefined;
        });
    });

    describe('deleteMessageAndSendNewShoppingList', () => {
        it('should call deleteMessageIds and sendToTelegramSubmenu when json result is valid', async () => {
            adapterMock.getForeignStateAsync.resolves({ val: '[{"text":"item1"}]' });
            const createKeyboardMod = require('@backend/app/jsonTable');
            createKeyboardMod.createKeyboardFromJson.returns({
                text: 'list',
                keyboard: { inline_keyboard: [] },
            });

            await shoppingListManager.deleteMessageAndSendNewShoppingList('telegram.0', store, 'Michael');

            const deleteIds = require('@backend/app/messageIds');
            expect(deleteIds.deleteMessageIds.calledOnce).to.be.true;
        });

        it('should do nothing when getForeignStateAsync returns null', async () => {
            adapterMock.getForeignStateAsync.resolves(null);

            await shoppingListManager.deleteMessageAndSendNewShoppingList('telegram.0', store, 'Michael');

            const telegramMod = require('@backend/app/telegram');
            expect(telegramMod.sendToTelegramSubmenu.called).to.be.false;
        });
    });
});

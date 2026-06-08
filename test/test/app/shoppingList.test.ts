import { expect } from 'chai';
import sinon from 'sinon';
import {
    shoppingListSubscribeStateAndDeleteItem,
    deleteMessageAndSendNewShoppingList,
} from '@backend/app/shoppingList';
import type { TelegramParams } from '@backend/types/types';

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
    let telegramParams: TelegramParams;

    beforeEach(() => {
        adapterMock = {
            log: { debug: sinon.stub(), warn: sinon.stub(), error: sinon.stub() },
            getForeignObjectAsync: sinon.stub().resolves(null),
            getForeignStateAsync: sinon.stub().resolves(null),
            setState: sinon.stub().resolves(),
            sendTo: sinon.stub(),
        };
        telegramParams = {
            adapter: adapterMock,
            telegramInstanceList: [{ name: 'telegram.0', active: true }],
            userListWithChatID: [{ name: 'Michael', chatID: '999' }],
            resize_keyboard: true,
            one_time_keyboard: true,
        } as any;

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

            const result = await shoppingListSubscribeStateAndDeleteItem(buildVal(), telegramParams);

            const setstateIobrokerMod = require('@backend/app/setstate');
            expect(setstateIobrokerMod.setstateIobroker.calledOnce).to.be.true;
            expect(result).to.equal(42);
            // isSubscribed starts false on first call — subscription should happen
            const subscribeStates = require('@backend/app/subscribeStates');
            expect(subscribeStates._subscribeForeignStates.called).to.be.true;
        });

        it('should NOT subscribe again on second call (isSubscribed flag prevents duplicate)', async () => {
            adapterMock.getForeignObjectAsync.resolves({ _id: 'alexa2.0.Lists.groceries.items.item1' });

            // second call — isSubscribed is already true from first test in this suite
            await shoppingListSubscribeStateAndDeleteItem(buildVal(), telegramParams);

            const subscribeStates = require('@backend/app/subscribeStates');
            // stub is fresh (beforeEach re-stubs), so called=false means subscribe was skipped
            expect(subscribeStates._subscribeForeignStates.called).to.be.false;
        });

        it('should send error message to telegram when getForeignObjectAsync returns null and instance is found', async () => {
            adapterMock.getForeignObjectAsync.resolves(null);
            const jsonTable = require('@backend/app/jsonTable');
            sinon.stub(jsonTable.lastRequestJsonButtonHistory, 'getLast').returns({ instance: 'telegram.0' });

            await shoppingListSubscribeStateAndDeleteItem(buildVal(), telegramParams);

            const telegramMod = require('@backend/app/telegram');
            expect(telegramMod.sendToTelegram.calledOnce).to.be.true;
        });

        it('should NOT send message when getLast returns no instance', async () => {
            adapterMock.getForeignObjectAsync.resolves(null);
            const jsonTable = require('@backend/app/jsonTable');
            sinon.stub(jsonTable.lastRequestJsonButtonHistory, 'getLast').returns(null);

            await shoppingListSubscribeStateAndDeleteItem(buildVal(), telegramParams);

            const telegramMod = require('@backend/app/telegram');
            expect(telegramMod.sendToTelegram.called).to.be.false;
        });

        it('should return undefined when val is null', async () => {
            const result = await shoppingListSubscribeStateAndDeleteItem(null, telegramParams);
            expect(result).to.be.undefined;
        });

        it('should handle errors gracefully without throwing', async () => {
            adapterMock.getForeignObjectAsync.rejects(new Error('network error'));
            await expect(shoppingListSubscribeStateAndDeleteItem(buildVal(), telegramParams)).to.not.be.rejected;
        });
    });

    describe('deleteMessageAndSendNewShoppingList', () => {
        beforeEach(async () => {
            adapterMock.getForeignObjectAsync.resolves({ _id: 'some.object' });
            await shoppingListSubscribeStateAndDeleteItem(buildVal(), telegramParams);
            adapterMock.getForeignObjectAsync.reset();
        });

        it('should delete message IDs and send new shopping list when state has value', async () => {
            adapterMock.getForeignStateAsync.resolves({ val: '[{"name":"Milk"}]' });
            const jsonTable = require('@backend/app/jsonTable');
            jsonTable.createKeyboardFromJson.returns({ text: 'List', keyboard: { inline_keyboard: [] } });

            await deleteMessageAndSendNewShoppingList('telegram.0', telegramParams, 'Michael');

            const messageIdsMod = require('@backend/app/messageIds');
            expect(messageIdsMod.deleteMessageIds.called).to.be.true;
            const telegramMod = require('@backend/app/telegram');
            expect(telegramMod.sendToTelegramSubmenu.calledOnce).to.be.true;
        });

        it('should skip submenu send when state val is falsy', async () => {
            adapterMock.getForeignStateAsync.resolves({ val: null });

            await deleteMessageAndSendNewShoppingList('telegram.0', telegramParams, 'Michael');

            const telegramMod = require('@backend/app/telegram');
            expect(telegramMod.sendToTelegramSubmenu.called).to.be.false;
        });

        it('should skip submenu send when createKeyboardFromJson returns null', async () => {
            adapterMock.getForeignStateAsync.resolves({ val: '[{"name":"Milk"}]' });
            // createKeyboardFromJson already stubbed to return null

            await deleteMessageAndSendNewShoppingList('telegram.0', telegramParams, 'Michael');

            const telegramMod = require('@backend/app/telegram');
            expect(telegramMod.sendToTelegramSubmenu.called).to.be.false;
        });

        it('should handle errors gracefully without throwing', async () => {
            adapterMock.getForeignStateAsync.rejects(new Error('fail'));
            await expect(
                deleteMessageAndSendNewShoppingList('telegram.0', telegramParams, 'Michael'),
            ).to.not.be.rejected;
        });
    });
});
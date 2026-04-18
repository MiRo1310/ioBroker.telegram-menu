import { expect } from 'chai';
import sinon from 'sinon';
import { adapterStartMenuSend } from '@backend/app/adapterStartMenuSend';

describe('adapterStartMenuSend', () => {
    let sendToTelegramStub: any;
    let adapterMock: any;

    beforeEach(() => {
        sendToTelegramStub = sinon.stub(require('@backend/app/telegram'), 'sendToTelegram').resolves();

        adapterMock = {
            log: { debug: sinon.stub(), warn: sinon.stub(), error: sinon.stub() },
        };
    });

    afterEach(() => {
        sendToTelegramStub.restore();
    });

    it('should call sendToTelegram for active users on startside', async () => {
        const listOfMenus = ['menu1'];
        const startSides: any = { menu1: 'page1' };
        const userActiveCheckbox: any = { menu1: true };
        const menusWithUsers: any = {
            menu1: [{ name: 'Alice', instance: 'telegram.0', chatId: '123' }],
        };
        const menuData: any = {
            menu1: {
                page1: { nav: [['btn1', 'btn2']], text: 'Hello Alice', parse_mode: false },
            },
        };

        const telegramParams: any = {
            adapter: adapterMock,
            telegramInstanceList: [{ name: 'telegram.0', active: true }],
            userListWithChatID: [{ name: 'Alice', chatID: '123', instance: 'telegram.0' }],
            resize_keyboard: false,
            one_time_keyboard: false,
        };

        await adapterStartMenuSend(
            listOfMenus,
            startSides,
            userActiveCheckbox,
            menusWithUsers,
            menuData,
            telegramParams,
        );

        expect(sendToTelegramStub.calledOnce).to.be.true;
        const callArg = sendToTelegramStub.firstCall.args[0];
        expect(callArg.instance).to.equal('telegram.0');
        expect(callArg.userToSend).to.equal('Alice');
        expect(callArg.textToSend).to.equal('Hello Alice');
        expect(callArg.keyboard).to.deep.equal([['btn1', 'btn2']]);
    });

    it('should not call sendToTelegram when user is not active', async () => {
        const listOfMenus = ['menu1'];
        const startSides: any = { menu1: 'page1' };
        const userActiveCheckbox: any = { menu1: true };
        const menusWithUsers: any = {
            menu1: [{ name: 'Bob', instance: 'telegram.0', chatId: '999' }],
        };
        const menuData: any = {
            menu1: {
                page1: { nav: [['btn1']], text: 'Hello Bob', parse_mode: false },
            },
        };

        const telegramParams: any = {
            adapter: adapterMock,
            telegramInstanceList: [{ name: 'telegram.0', active: true }],
            userListWithChatID: [{ name: 'Alice', chatID: '123', instance: 'telegram.0' }], // different user list so Bob is inactive
            resize_keyboard: false,
            one_time_keyboard: false,
        };

        await adapterStartMenuSend(
            listOfMenus,
            startSides,
            userActiveCheckbox,
            menusWithUsers,
            menuData,
            telegramParams,
        );

        expect(sendToTelegramStub.notCalled).to.be.true;
    });

    it('should not call sendToTelegram when menu is inactive or not a startside', async () => {
        const listOfMenus = ['menu1'];
        const startSides: any = { menu1: '-' }; // not a startside
        const userActiveCheckbox: any = { menu1: true };
        const menusWithUsers: any = {
            menu1: [{ name: 'Alice', instance: 'telegram.0', chatId: '123' }],
        };
        const menuData: any = {
            menu1: {
                page1: { nav: [['btn1']], text: 'Hello Alice', parse_mode: false },
            },
        };

        const telegramParams: any = {
            adapter: adapterMock,
            telegramInstanceList: [{ name: 'telegram.0', active: true }],
            userListWithChatID: [{ name: 'Alice', chatID: '123', instance: 'telegram.0' }],
            resize_keyboard: false,
            one_time_keyboard: false,
        };

        await adapterStartMenuSend(
            listOfMenus,
            startSides,
            userActiveCheckbox,
            menusWithUsers,
            menuData,
            telegramParams,
        );

        expect(sendToTelegramStub.notCalled).to.be.true;
    });
});

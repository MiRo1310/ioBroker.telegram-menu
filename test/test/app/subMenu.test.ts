import { expect } from 'chai';
import sinon from 'sinon';
import { callSubMenu, subMenu } from '@backend/app/subMenu';
import type { TelegramParams } from '@backend/types/types';

describe('subMenu', () => {
    let adapterMock: any;
    let telegramParams: TelegramParams;
    let sendToTelegramStub: sinon.SinonStub;
    let sendToTelegramSubmenuStub: sinon.SinonStub;
    let handleSetStateStub: sinon.SinonStub;
    let switchBackStub: sinon.SinonStub;
    let deleteMessageIdsStub: sinon.SinonStub;

    beforeEach(() => {
        adapterMock = {
            log: { debug: sinon.stub(), warn: sinon.stub(), error: sinon.stub() },
            getForeignStateAsync: sinon.stub(),
            supportsFeature: sinon.stub().returns(false),
        };
        telegramParams = { adapter: adapterMock } as any;

        sendToTelegramStub = sinon.stub(require('@backend/app/telegram'), 'sendToTelegram').resolves();
        sendToTelegramSubmenuStub = sinon.stub(require('@backend/app/telegram'), 'sendToTelegramSubmenu').resolves();
        handleSetStateStub = sinon.stub(require('@backend/app/setstate'), 'handleSetState').resolves();
        switchBackStub = sinon.stub(require('@backend/app/backMenu'), 'switchBack').resolves(undefined);
        deleteMessageIdsStub = sinon.stub(require('@backend/app/messageIds'), 'deleteMessageIds').resolves();
    });

    afterEach(() => {
        sinon.restore();
    });

    const basePart = { text: 'Menu Text', parse_mode: false } as any;
    const baseArgs = (menuString: string) => ({
        instance: 'telegram.0',
        menuString,
        userToSend: 'Alice',
        telegramParams,
        part: basePart,
        allMenusWithData: {},
        menus: ['menu1'],
        adapter: adapterMock,
    });

    // ─── subMenu ────────────────────────────────────────────────────────────

    describe('subMenu', () => {
        it('should return undefined when cbData is empty', async () => {
            const result = await subMenu(baseArgs(''));
            expect(result).to.be.undefined;
        });

        it('should create switch menu for switch cbData', async () => {
            const result = await subMenu(baseArgs('menu:switch-On.true-Off.false:device1'));
            expect(result).to.not.be.undefined;
            expect(result?.keyboard).to.not.be.undefined;
            expect(result?.keyboard?.inline_keyboard).to.have.lengthOf(1);
            expect(result?.keyboard?.inline_keyboard[0]).to.have.lengthOf(2);
            expect(result?.keyboard?.inline_keyboard[0][0].text).to.equal('On');
            expect(result?.keyboard?.inline_keyboard[0][1].text).to.equal('Off');
        });

        it('should return undefined for switch with missing items', async () => {
            const result = await subMenu(baseArgs('menu:switch-On.true:device1'));
            expect(result).to.be.undefined;
        });

        it('should call handleSetState for first menu value', async () => {
            // createSwitchMenu populates splittedData
            await subMenu(baseArgs('menu:switch-On.true-Off.false:device1'));
            await subMenu(baseArgs('menu:first:device1'));
            expect(handleSetStateStub.calledOnce).to.be.true;
        });

        it('should call handleSetState for second menu value', async () => {
            await subMenu(baseArgs('menu:switch-On.true-Off.false:device1'));
            await subMenu(baseArgs('menu:second:device1'));
            expect(handleSetStateStub.calledOnce).to.be.true;
        });

        it('should create percent submenu', async () => {
            const result = await subMenu(baseArgs('menu:percent10:device1'));
            expect(result).to.not.be.undefined;
            expect(result?.keyboard?.inline_keyboard).to.be.an('array');
            // 100, 90, 80, ..., 0 = 11 entries, 8 per row → 2 rows
            expect(result?.keyboard?.inline_keyboard.length).to.be.greaterThan(0);
        });

        it('should call handleSetState for submenu percent set', async () => {
            // First create a percent menu to set `step`
            await subMenu(baseArgs('menu:percent10:device1'));
            // Now set a percent value
            await subMenu(baseArgs('submenu:percent10,50:device1'));
            expect(handleSetStateStub.calledOnce).to.be.true;
            expect(handleSetStateStub.firstCall.args[4]).to.equal(50);
        });

        it('should create number submenu', async () => {
            const result = await subMenu(baseArgs('menu:number1-10-1-°C:device1'));
            expect(result).to.not.be.undefined;
            expect(result?.keyboard?.inline_keyboard).to.be.an('array');
            expect(result?.keyboard?.inline_keyboard.length).to.be.greaterThan(0);
        });

        it('should create number submenu with negative values', async () => {
            const result = await subMenu(baseArgs('menu:number(-)5-5-1-°C:device1'));
            expect(result).to.not.be.undefined;
            expect(result?.keyboard?.inline_keyboard).to.be.an('array');
        });

        it('should call handleSetState for submenu number set', async () => {
            await subMenu(baseArgs('submenu:number1-10-1-°C:device1:5'));
            expect(handleSetStateStub.calledOnce).to.be.true;
        });

        it('should call switchBack for menu:back', async () => {
            switchBackStub.resolves({ keyboard: [['btn1']], textToSend: 'Back', parse_mode: false });
            await subMenu(baseArgs('menu:back'));
            expect(switchBackStub.calledOnce).to.be.true;
            expect(sendToTelegramStub.calledOnce).to.be.true;
        });

        it('should not send when switchBack returns undefined', async () => {
            switchBackStub.resolves(undefined);
            await subMenu(baseArgs('menu:back'));
            expect(switchBackStub.calledOnce).to.be.true;
            expect(sendToTelegramStub.called).to.be.false;
        });

        it('should handle deleteAll menu and return navToGoBack', async () => {
            const result = await subMenu(baseArgs('menu:deleteAll:Overview'));
            expect(deleteMessageIdsStub.calledOnce).to.be.true;
            expect(result?.navToGoBack).to.equal('Overview');
        });

        it('should catch errors', async () => {
            handleSetStateStub.rejects(new Error('boom'));
            await subMenu(baseArgs('menu:first:device1'));
            expect(adapterMock.log.error.called).to.be.true;
        });
    });

    // ─── callSubMenu ────────────────────────────────────────────────────────

    describe('callSubMenu', () => {
        it('should call sendToTelegramSubmenu when subMenu returns text and keyboard', async () => {
            const result = await callSubMenu({
                instance: 'telegram.0',
                jsonStringNav: 'menu:switch-On.true-Off.false:device1',
                userToSend: 'Alice',
                telegramParams,
                part: basePart,
                allMenusWithData: {},
                menus: ['menu1'],
                adapter: adapterMock,
            });
            expect(sendToTelegramSubmenuStub.calledOnce).to.be.true;
            expect(result?.newNav).to.be.undefined;
        });

        it('should return newNav from deleteAll menu', async () => {
            const result = await callSubMenu({
                instance: 'telegram.0',
                jsonStringNav: 'menu:deleteAll:Overview',
                userToSend: 'Alice',
                telegramParams,
                part: basePart,
                allMenusWithData: {},
                menus: ['menu1'],
                adapter: adapterMock,
            });
            expect(result?.newNav).to.equal('Overview');
        });

        it('should catch errors and return undefined', async () => {
            adapterMock.log.debug.throws(new Error('crash'));
            const result = await callSubMenu({
                instance: 'telegram.0',
                jsonStringNav: 'menu:switch-On.true-Off.false:device1',
                userToSend: 'Alice',
                telegramParams,
                part: basePart,
                allMenusWithData: {},
                menus: ['menu1'],
                adapter: adapterMock,
            });
            expect(result).to.be.undefined;
        });
    });
});


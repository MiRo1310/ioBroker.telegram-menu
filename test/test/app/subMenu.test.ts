import { expect } from 'chai';
import sinon from 'sinon';
import { callSubMenu, subMenu, submenuHandler } from '@backend/app/subMenu';
import { createAppContextMock } from '../../fixtures/appContextMock';
import type { AppContext } from '@backend/app/appContext';

describe('subMenu', () => {
    let adapterMock: any;
    let appContext: AppContext;
    let sendToTelegramStub: sinon.SinonStub;
    let sendToTelegramSubmenuStub: sinon.SinonStub;
    let handleSetStateStub: sinon.SinonStub;
    let switchBackStub: sinon.SinonStub;
    let deleteMessageIdsStub: sinon.SinonStub;

    beforeEach(() => {
        submenuHandler.reset();
        adapterMock = {
            log: { debug: sinon.stub(), warn: sinon.stub(), error: sinon.stub() },
            getForeignStateAsync: sinon.stub(),
            supportsFeature: sinon.stub().returns(false),
        };
        appContext = createAppContextMock(adapterMock);

        sendToTelegramStub = sinon.stub(require('@backend/app/telegram'), 'sendToTelegram').resolves();
        sendToTelegramSubmenuStub = sinon.stub(require('@backend/app/telegram'), 'sendToTelegramSubmenu').resolves();
        handleSetStateStub = sinon.stub(require('@backend/app/setstate'), 'handleSetState').resolves();
        switchBackStub = sinon.stub(appContext.backMenuRegistry, 'switchBack').resolves(undefined);
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
        appContext,
        part: basePart,
        allMenusWithData: {},
        menus: ['menu1'],
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

        it('should propagate errors', async () => {
            await subMenu(baseArgs('menu:switch-On.true-Off.false:device1'));
            handleSetStateStub.rejects(new Error('boom'));
            await expect(subMenu(baseArgs('menu:first:device1'))).to.be.rejectedWith('boom');
        });

        it('should add 0% button when step does not divide evenly into 100', async () => {
            // step=30: loop hits i=10, i-step=-20<0 → extra 0% button added
            const result = await subMenu(baseArgs('menu:percent30:device1'));
            expect(result).to.not.be.undefined;
            const allButtons = result?.keyboard?.inline_keyboard?.flat() ?? [];
            const zeroButton = allButtons.find(b => b.text === '0%');
            expect(zeroButton).to.not.be.undefined;
        });

        it('should create number submenu with descending order (first > second)', async () => {
            // firstValueInText=10 > secondValueInText=1 → else branch (lines 129-130)
            const result = await subMenu(baseArgs('menu:number10-1-1-°C:device1'));
            expect(result).to.not.be.undefined;
            expect(result?.keyboard?.inline_keyboard).to.be.an('array');
            expect(result?.keyboard?.inline_keyboard!.length).to.be.greaterThan(0);
        });

        it('should use 6 entries per row when step < 1', async () => {
            // step=0.5 < 1 → maxEntriesPerRow=6 instead of 8 (line 139)
            const result = await subMenu(baseArgs('menu:number1-10-0.5-°C:device1'));
            expect(result).to.not.be.undefined;
            expect(result?.keyboard?.inline_keyboard).to.be.an('array');
            // 19 entries with maxEntriesPerRow=6: 3 full rows + 1 partial = 4 rows
            expect(result?.keyboard?.inline_keyboard!.length).to.equal(4);
        });

        it('should call createDynamicSwitchMenu for dynSwitch cbData (line 300)', async () => {
            const result = await subMenu(baseArgs('menu:dynSwitch:device1'));
            expect(result).to.not.be.undefined;
            expect(result?.keyboard).to.not.be.undefined;
        });

        it('should call handleSetState for dynS value (line 304)', async () => {
            // cbData='dynS.x' contains 'dynS' but not 'dynSwitch' → isSetDynamicSwitchVal
            await subMenu(baseArgs('menu:dynS.x:device1:42'));
            expect(handleSetStateStub.calledOnce).to.be.true;
        });

        it('should return early in setMenuValue when splittedData item is missing (line 82)', async () => {
            // Set splittedData to only 2 entries (index 0 and 1, no index 2)
            await subMenu(baseArgs('menu:switch-On.true:device1'));
            handleSetStateStub.resetHistory();
            // menu:second uses menuNumber:2, splittedData[2] is undefined → early return
            await subMenu(baseArgs('menu:second:device1'));
            expect(handleSetStateStub.called).to.be.false;
        });

        it('should create ascending number menu (first < second, e.g. 1-20-2)', async () => {
            // firstValueInText=1 < secondValueInText=20 → start/end swapped (lines 131-133),
            // index logic re-reverses → buttons appear in ascending order
            const result = await subMenu(baseArgs('menu:number1-20-2-°C:device1'));
            expect(result).to.not.be.undefined;
            const buttons = result?.keyboard?.inline_keyboard?.flat() ?? [];
            expect(buttons.length).to.be.greaterThan(1);
            expect(buttons[0].text).to.equal('1°C');
            const values = buttons.map(b => parseFloat(b.text));
            const sorted = [...values].sort((a, b) => a - b);
            expect(values).to.deep.equal(sorted);
        });

        it('should parse a negative second value via (-) (line 128)', async () => {
            // splittedData[1] contains 'negativ' → replaced with '-' → -5
            const result = await subMenu(baseArgs('menu:number5-(-)5-1-°C:device1'));
            expect(result).to.not.be.undefined;
            const buttons = result?.keyboard?.inline_keyboard?.flat() ?? [];
            // descending from 5 to -5 with step 1 → 11 buttons
            expect(buttons).to.have.lengthOf(11);
            expect(buttons[0].text).to.equal('5°C');
            expect(buttons[buttons.length - 1].text).to.equal('-5°C');
        });

        it('should send empty text when switchBack result has no textToSend (line 203)', async () => {
            switchBackStub.resolves({ keyboard: { inline_keyboard: [] }, parse_mode: false });
            await subMenu(baseArgs('menu:back'));
            expect(sendToTelegramStub.calledOnce).to.be.true;
            expect(sendToTelegramStub.firstCall.args[0].textToSend).to.equal('');
        });

        it('should return early in setMenuValue when val part is undefined (line 87)', async () => {
            // 'On' has no dot → split('.')[1] is undefined → val===undefined → early return
            await subMenu(baseArgs('menu:switch-On-Off.false:device1'));
            handleSetStateStub.resetHistory();
            await subMenu(baseArgs('menu:first:device1'));
            expect(handleSetStateStub.called).to.be.false;
        });
    });

    // ─── callSubMenu ────────────────────────────────────────────────────────

    describe('callSubMenu', () => {
        it('should call sendToTelegramSubmenu when subMenu returns text and keyboard', async () => {
            const result = await callSubMenu({
                instance: 'telegram.0',
                jsonStringNav: 'menu:switch-On.true-Off.false:device1',
                userToSend: 'Alice',
                appContext,
                part: basePart,
                allMenusWithData: {},
                menus: ['menu1'],
            });
            expect(sendToTelegramSubmenuStub.calledOnce).to.be.true;
            expect(result?.newNav).to.be.undefined;
        });

        it('should return newNav from deleteAll menu', async () => {
            const result = await callSubMenu({
                instance: 'telegram.0',
                jsonStringNav: 'menu:deleteAll:Overview',
                userToSend: 'Alice',
                appContext,
                part: basePart,
                allMenusWithData: {},
                menus: ['menu1'],
            });
            expect(result?.newNav).to.equal('Overview');
        });

        it('should propagate errors', async () => {
            adapterMock.log.debug.throws(new Error('crash'));
            await expect(
                callSubMenu({
                    instance: 'telegram.0',
                    jsonStringNav: 'menu:switch-On.true-Off.false:device1',
                    userToSend: 'Alice',
                    appContext,
                    part: basePart,
                    allMenusWithData: {},
                    menus: ['menu1'],
                }),
            ).to.be.rejectedWith('crash');
        });
    });
});

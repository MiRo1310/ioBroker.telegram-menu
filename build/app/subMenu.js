"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyboardBuilder = exports.submenuHandler = exports.SubmenuHandler = void 0;
exports.callSubMenu = callSubMenu;
exports.subMenu = subMenu;
const setstate_1 = require("../app/setstate");
const string_1 = require("../lib/string");
const telegram_1 = require("../app/telegram");
const utilities_1 = require("../lib/utilities");
const validateMenus_1 = require("../app/validateMenus");
const messageIds_1 = require("../app/messageIds");
const splitValues_1 = require("../lib/splitValues");
const dynamicSwitchMenu_1 = require("../app/dynamicSwitchMenu");
const utils_1 = require("../lib/utils");
class SubmenuHandler {
    _step = 0;
    _splittedData = [];
    get step() {
        return this._step;
    }
    set step(val) {
        this._step = val;
    }
    get splittedData() {
        return this._splittedData;
    }
    set splittedData(val) {
        this._splittedData = val;
    }
    reset() {
        this._step = 0;
        this._splittedData = [];
    }
}
exports.SubmenuHandler = SubmenuHandler;
exports.submenuHandler = new SubmenuHandler();
class KeyboardBuilder {
    buttons = [];
    addButton(text, callbackData) {
        this.buttons.push({ text, callback_data: callbackData });
        return this;
    }
    build(maxPerRow) {
        const rows = [];
        for (let i = 0; i < this.buttons.length; i += maxPerRow) {
            rows.push(this.buttons.slice(i, i + maxPerRow));
        }
        return { inline_keyboard: rows };
    }
}
exports.KeyboardBuilder = KeyboardBuilder;
const createSubmenuPercent = (obj) => {
    const { cbData, menuToHandle } = obj;
    exports.submenuHandler.step = parseFloat(cbData.replace('percent', ''));
    const builder = new KeyboardBuilder();
    for (let i = 100; i >= 0; i -= exports.submenuHandler.step) {
        builder.addButton(`${i}%`, `submenu:percent${exports.submenuHandler.step},${i}:${menuToHandle}`);
        if (i != 0 && i - exports.submenuHandler.step < 0) {
            builder.addButton(`0%`, `submenu:percent${exports.submenuHandler.step},${0}:${menuToHandle}`);
        }
    }
    return { text: obj.text, keyboard: builder.build(8), device: menuToHandle };
};
const setMenuValue = async ({ appContext, instance, userToSend, part, menuNumber }) => {
    if (!exports.submenuHandler.splittedData[menuNumber]) {
        return;
    }
    let val = exports.submenuHandler.splittedData[menuNumber].split('.')?.[1];
    if (val === undefined) {
        return;
    }
    if (val === 'false') {
        val = false;
    }
    else if (val === 'true') {
        val = true;
    }
    await (0, setstate_1.handleSetState)(appContext, instance, part, userToSend, val);
};
const createSubmenuNumber = ({ cbData, menuToHandle, text, appContext, }) => {
    if (cbData.includes('(-)')) {
        cbData = cbData.replace('(-)', 'negativ');
    }
    const splittedData = cbData.replace('number', '').split('-');
    let unit = '';
    if (splittedData[3] != '') {
        unit = splittedData[3];
    }
    let start, end;
    const firstValueInText = parseFloat(splittedData[0].includes('negativ') ? splittedData[0].replace('negativ', '-') : splittedData[0]);
    const secondValueInText = parseFloat(splittedData[1].includes('negativ') ? splittedData[1].replace('negativ', '-') : splittedData[1]);
    if (firstValueInText < secondValueInText) {
        start = secondValueInText;
        end = firstValueInText;
    }
    else {
        start = firstValueInText;
        end = secondValueInText;
    }
    let index = -1;
    // istanbul ignore next — negativer Step ist strukturell unerreichbar/unbrauchbar: cbData.replace('(-)', 'negativ')
    // ersetzt nur das erste Vorkommen (greift also nur für den ersten Wert), und ein negativer Step würde die
    // Schleife unten (i -= step bei start >= end) endlos laufen lassen.
    const step = parseFloat(
    /* istanbul ignore next */
    splittedData[2].includes('negativ') ? splittedData[2].replace('negativ', '-') : splittedData[2]);
    const maxEntriesPerRow = step < 1 ? 6 : 8;
    const builder = new KeyboardBuilder();
    for (let i = start; i >= end; i -= step) {
        // Zahlen umdrehen
        if (parseFloat(splittedData[0]) < parseFloat(splittedData[1])) {
            if (i === start) {
                index = end - step;
            }
            index = index + step;
        }
        else {
            index = i;
        }
        builder.addButton(`${index}${unit}`, `submenu:${cbData}:${menuToHandle}:${index}`);
    }
    const keyboard = builder.build(maxEntriesPerRow);
    appContext.adapter.log.debug(`Keyboard : ${(0, string_1.jsonString)(keyboard)}`);
    return { text, keyboard, menuToHandle };
};
const createSwitchMenu = ({ menuToHandle, cbData, text, }) => {
    exports.submenuHandler.splittedData = cbData.split('-');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, item1, item2] = exports.submenuHandler.splittedData;
    if (!item1 || !item2) {
        return;
    }
    const keyboard = {
        inline_keyboard: [
            [
                {
                    text: item1.split('.')[0],
                    callback_data: `menu:first:${menuToHandle}`,
                },
                {
                    text: item2.split('.')[0],
                    callback_data: `menu:second:${menuToHandle}`,
                },
            ],
        ],
    };
    return { text: text, keyboard, device: menuToHandle };
};
const back = async ({ instance, appContext, userToSend, allMenusWithData, menus }) => {
    const result = await appContext.backMenuRegistry.switchBack(appContext.adapter, userToSend, allMenusWithData, menus);
    if (result) {
        const { keyboard, parse_mode, textToSend = '' } = result;
        await (0, telegram_1.sendToTelegram)({ instance, userToSend, textToSend, keyboard, parse_mode: parse_mode, appContext });
    }
};
async function callSubMenu({ instance, jsonStringNav, userToSend, appContext, part, allMenusWithData, menus, }) {
    const obj = await subMenu({
        instance,
        menuString: jsonStringNav,
        userToSend,
        appContext,
        part,
        allMenusWithData,
        menus,
    });
    appContext.adapter.log.debug(`Submenu : ${(0, string_1.jsonString)(obj)}`);
    if (obj?.text && obj?.keyboard) {
        (0, telegram_1.sendToTelegramSubmenu)(instance, userToSend, obj.text, obj.keyboard, appContext, part.parse_mode);
    }
    return { newNav: obj?.navToGoBack };
}
async function subMenu({ menuString, userToSend, appContext, part, allMenusWithData, menus, instance, }) {
    appContext.adapter.log.debug(`Menu : ${menuString}`);
    const text = await (0, utilities_1.textModifier)(appContext, part.text);
    if ((0, validateMenus_1.isDeleteMenu)(menuString)) {
        await (0, messageIds_1.deleteMessageIds)(instance, userToSend, appContext, 'all');
        const menu = menuString.split(':')?.[2]?.split('"')?.[0]; //[["menu:deleteAll:Übersicht"],[""]]
        if (menu && (0, string_1.isNonEmptyString)(menu)) {
            return { navToGoBack: menu };
        }
    }
    const { cbData, menuToHandle, val } = (0, splitValues_1.getMenuValues)(menuString);
    if (!cbData) {
        appContext.adapter.log.debug('No callback data found');
        return;
    }
    if ((0, validateMenus_1.isCreateSwitch)(cbData) && menuToHandle) {
        return createSwitchMenu({ appContext, cbData, text, menuToHandle: menuToHandle });
    }
    if ((0, validateMenus_1.isFirstMenuValue)(cbData)) {
        await setMenuValue({
            instance,
            part,
            userToSend,
            appContext,
            menuNumber: 1,
        });
    }
    if ((0, validateMenus_1.isSecondMenuValue)(cbData)) {
        await setMenuValue({ instance, part, userToSend, appContext, menuNumber: 2 });
    }
    if ((0, validateMenus_1.isCreateDynamicSwitch)(cbData) && menuToHandle) {
        return (0, dynamicSwitchMenu_1.createDynamicSwitchMenu)(appContext, menuString, menuToHandle, text);
    }
    if ((0, validateMenus_1.isSetDynamicSwitchVal)(cbData) && (0, utils_1.isDefined)(val)) {
        await (0, setstate_1.handleSetState)(appContext, instance, part, userToSend, val); //SetDynamicValue
    }
    if ((0, validateMenus_1.isCreateSubmenuPercent)(menuString, cbData) && menuToHandle) {
        return createSubmenuPercent({ appContext, cbData, text, menuToHandle: menuToHandle });
    }
    if ((0, validateMenus_1.isSetSubmenuPercent)(menuString, exports.submenuHandler.step)) {
        const value = parseInt(menuString.split(':')[1].split(',')[1]);
        await (0, setstate_1.handleSetState)(appContext, instance, part, userToSend, value);
    }
    if ((0, validateMenus_1.isCreateSubmenuNumber)(menuString, cbData) && menuToHandle) {
        return createSubmenuNumber({ appContext, cbData, text, menuToHandle: menuToHandle });
    }
    if ((0, validateMenus_1.isSetSubmenuNumber)(menuString)) {
        const { value } = (0, splitValues_1.getSubmenuNumberValues)(menuString);
        if ((0, utils_1.isDefined)(value)) {
            await (0, setstate_1.handleSetState)(appContext, instance, part, userToSend, value);
        }
    }
    if ((0, validateMenus_1.isMenuBack)(menuString)) {
        await back({
            instance,
            userToSend,
            allMenusWithData,
            menus,
            appContext,
        });
    }
}
//# sourceMappingURL=subMenu.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callSubMenu = callSubMenu;
exports.subMenu = subMenu;
const backMenu_1 = require("./backMenu");
const setstate_1 = require("./setstate");
const telegram_1 = require("./telegram");
const utilities_1 = require("../lib/utilities");
const messageIds_1 = require("./messageIds");
const dynamicSwitchMenu_1 = require("./dynamicSwitchMenu");
const string_1 = require("../lib/string");
const main_1 = require("../main");
const logging_1 = require("./logging");
const splitValues_1 = require("../lib/splitValues");
const validateMenus_1 = require("./validateMenus");
let step = 0;
let splittedData = [];
const createSubmenuPercent = (obj) => {
    const { cbData, menuToHandle } = obj;
    step = parseFloat(cbData.replace('percent', ''));
    let rowEntries = 0;
    let menu = [];
    const keyboard = {
        inline_keyboard: [],
    };
    for (let i = 100; i >= 0; i -= step) {
        menu.push({
            text: `${i}%`,
            callback_data: `submenu:percent${step},${i}:${menuToHandle}`,
        });
        if (i != 0 && i - step < 0) {
            menu.push({
                text: `0%`,
                callback_data: `submenu:percent${step},${0}:${menuToHandle}`,
            });
        }
        rowEntries++;
        if (rowEntries == 8) {
            keyboard.inline_keyboard.push(menu);
            menu = [];
            rowEntries = 0;
        }
    }
    if (rowEntries != 0) {
        keyboard.inline_keyboard.push(menu);
    }
    return { text: obj.text, keyboard: keyboard, device: menuToHandle };
};
const setFirstMenuValue = async ({ telegramParams, userToSend, part }) => {
    let val;
    main_1.adapter.log.debug(`SplitData: ${(0, string_1.jsonString)(splittedData)}`);
    if (splittedData[1].split('.')[1] == 'false') {
        val = false;
    }
    else if (splittedData[1].split('.')[1] == 'true') {
        val = true;
    }
    else {
        val = splittedData[1].split('.')[1];
    }
    await (0, setstate_1.handleSetState)(part, userToSend, val, true, telegramParams);
};
const setSecondMenuValue = async ({ telegramParams, part, userToSend }) => {
    let val;
    if (splittedData[2].split('.')[1] == 'false') {
        val = false;
    }
    else if (splittedData[2].split('.')[1] == 'true') {
        val = true;
    }
    else {
        val = splittedData[2].split('.')[1];
    }
    await (0, setstate_1.handleSetState)(part, userToSend, val, true, telegramParams);
};
const createSubmenuNumber = ({ cbData, menuToHandle, text, }) => {
    if (cbData.includes('(-)')) {
        cbData = cbData.replace('(-)', 'negativ');
    }
    const splittedData = cbData.replace('number', '').split('-');
    let rowEntries = 0;
    let menu = [];
    const keyboard = {
        inline_keyboard: [],
    };
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
    let maxEntriesPerRow = 8;
    const step = parseFloat(splittedData[2].includes('negativ') ? splittedData[2].replace('negativ', '-') : splittedData[2]);
    if (step < 1) {
        maxEntriesPerRow = 6;
    }
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
        menu.push({
            text: `${index}${unit}`,
            callback_data: `submenu:${cbData}:${menuToHandle}:${index}`,
        });
        rowEntries++;
        if (rowEntries == maxEntriesPerRow) {
            keyboard.inline_keyboard.push(menu);
            menu = [];
            rowEntries = 0;
        }
    }
    if (rowEntries != 0) {
        keyboard.inline_keyboard.push(menu);
    }
    main_1.adapter.log.debug(`Keyboard: ${(0, string_1.jsonString)(keyboard)}`);
    return { text, keyboard, menuToHandle };
};
const createSwitchMenu = ({ menuToHandle, cbData, text, }) => {
    splittedData = cbData.split('-');
    const keyboard = {
        inline_keyboard: [
            [
                {
                    text: splittedData[1].split('.')[0],
                    callback_data: `menu:first:${menuToHandle}`,
                },
                {
                    text: splittedData[2].split('.')[0],
                    callback_data: `menu:second:${menuToHandle}`,
                },
            ],
        ],
    };
    return { text: text, keyboard, device: menuToHandle };
};
const back = async ({ telegramParams, userToSend, allMenusWithData, menus }) => {
    const result = await (0, backMenu_1.switchBack)(userToSend, allMenusWithData, menus);
    if (result) {
        const { keyboard, parse_mode, textToSend = '' } = result;
        await (0, telegram_1.sendToTelegram)({ userToSend, textToSend, keyboard, parse_mode: parse_mode, telegramParams });
    }
};
async function callSubMenu({ jsonStringNav, userToSend, telegramParams, part, allMenusWithData, menus, }) {
    try {
        const obj = await subMenu({
            menuString: jsonStringNav,
            userToSend,
            telegramParams,
            part,
            allMenusWithData,
            menus,
        });
        main_1.adapter.log.debug(`Submenu: ${(0, string_1.jsonString)(obj)}`);
        if (obj?.text && obj?.keyboard) {
            (0, telegram_1.sendToTelegramSubmenu)(userToSend, obj.text, obj.keyboard, telegramParams, part.parse_mode);
        }
        return { newNav: obj?.navToGoBack };
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error callSubMenu:', e, main_1.adapter);
    }
}
async function subMenu({ menuString, userToSend, telegramParams, part, allMenusWithData, menus, }) {
    try {
        main_1.adapter.log.debug(`Menu : ${menuString}`);
        const text = await (0, utilities_1.checkStatusInfo)(part.text);
        const { cbData, menuToHandle, val } = (0, splitValues_1.getMenuValues)(menuString);
        if ((0, validateMenus_1.isDeleteMenu)(cbData) && menuToHandle) {
            await (0, messageIds_1.deleteMessageIds)(userToSend, telegramParams, 'all');
            if ((0, string_1.isNonEmptyString)(menuToHandle)) {
                return { navToGoBack: menuToHandle };
            }
        }
        if ((0, validateMenus_1.isCreateSwitch)(cbData) && menuToHandle) {
            return createSwitchMenu({ cbData, text, menuToHandle: menuToHandle });
        }
        if ((0, validateMenus_1.isFirstMenuValue)(cbData)) {
            await setFirstMenuValue({
                part,
                userToSend,
                telegramParams,
            });
        }
        if ((0, validateMenus_1.isSecondMenuValue)(cbData)) {
            await setSecondMenuValue({ part, userToSend, telegramParams });
        }
        if ((0, validateMenus_1.isCreateDynamicSwitch)(cbData) && menuToHandle) {
            return (0, dynamicSwitchMenu_1.createDynamicSwitchMenu)(menuString, menuToHandle, text);
        }
        if ((0, validateMenus_1.isSetDynamicSwitchVal)(cbData) && val) {
            await (0, setstate_1.handleSetState)(part, userToSend, val, true, telegramParams); //SetDynamicValue
        }
        if ((0, validateMenus_1.isCreateSubmenuPercent)(menuString, cbData) && menuToHandle) {
            return createSubmenuPercent({ cbData, text, menuToHandle: menuToHandle });
        }
        if ((0, validateMenus_1.isSetSubmenuPercent)(menuString, step)) {
            const value = parseInt(menuString.split(':')[1].split(',')[1]);
            await (0, setstate_1.handleSetState)(part, userToSend, value, true, telegramParams);
        }
        if ((0, validateMenus_1.isCreateSubmenuNumber)(menuString, cbData) && menuToHandle) {
            return createSubmenuNumber({ cbData, text, menuToHandle: menuToHandle });
        }
        if ((0, validateMenus_1.isSetSubmenuNumber)(menuString, cbData)) {
            const { value } = (0, splitValues_1.getSubmenuNumberValues)(menuString);
            await (0, setstate_1.handleSetState)(part, userToSend, value, true, telegramParams);
        }
        if ((0, validateMenus_1.isMenuBack)(menuString)) {
            await back({
                userToSend,
                allMenusWithData,
                menus,
                telegramParams,
            });
        }
    }
    catch (error) {
        (0, logging_1.errorLogger)('Error subMenu:', error, main_1.adapter);
    }
}
//# sourceMappingURL=subMenu.js.map
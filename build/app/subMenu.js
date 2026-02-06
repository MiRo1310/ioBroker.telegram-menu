"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callSubMenu = callSubMenu;
exports.subMenu = subMenu;
const setstate_1 = require("../app/setstate");
const string_1 = require("../lib/string");
const backMenu_1 = require("../app/backMenu");
const telegram_1 = require("../app/telegram");
const logging_1 = require("../app/logging");
const utilities_1 = require("../lib/utilities");
const validateMenus_1 = require("../app/validateMenus");
const messageIds_1 = require("../app/messageIds");
const splitValues_1 = require("../lib/splitValues");
const dynamicSwitchMenu_1 = require("../app/dynamicSwitchMenu");
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
const setMenuValue = async ({ instance, telegramParams, userToSend, part, menuNumber, }) => {
    if (!splittedData[menuNumber]) {
        return;
    }
    let val = splittedData[menuNumber].split('.')?.[1];
    if (val === undefined) {
        return;
    }
    if (val === 'false') {
        val = false;
    }
    else if (val === 'true') {
        val = true;
    }
    await (0, setstate_1.handleSetState)(telegramParams.adapter, instance, part, userToSend, val, telegramParams);
};
const createSubmenuNumber = ({ cbData, menuToHandle, text, adapter, }) => {
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
    adapter.log.debug(`Keyboard : ${(0, string_1.jsonString)(keyboard)}`);
    return { text, keyboard, menuToHandle };
};
const createSwitchMenu = ({ menuToHandle, cbData, text, }) => {
    splittedData = cbData.split('-');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, item1, item2] = splittedData;
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
const back = async ({ instance, telegramParams, userToSend, allMenusWithData, menus }) => {
    const result = await (0, backMenu_1.switchBack)(telegramParams.adapter, userToSend, allMenusWithData, menus);
    if (result) {
        const { keyboard, parse_mode, textToSend = '' } = result;
        await (0, telegram_1.sendToTelegram)({ instance, userToSend, textToSend, keyboard, parse_mode: parse_mode, telegramParams });
    }
};
async function callSubMenu({ instance, jsonStringNav, userToSend, telegramParams, part, allMenusWithData, menus, adapter, }) {
    try {
        const obj = await subMenu({
            instance,
            menuString: jsonStringNav,
            userToSend,
            telegramParams,
            part,
            allMenusWithData,
            menus,
            adapter,
        });
        adapter.log.debug(`Submenu : ${(0, string_1.jsonString)(obj)}`);
        if (obj?.text && obj?.keyboard) {
            (0, telegram_1.sendToTelegramSubmenu)(instance, userToSend, obj.text, obj.keyboard, telegramParams, part.parse_mode);
        }
        return { newNav: obj?.navToGoBack };
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error callSubMenu:', e, adapter);
    }
}
async function subMenu({ menuString, userToSend, telegramParams, part, allMenusWithData, menus, instance, adapter, }) {
    try {
        adapter.log.debug(`Menu : ${menuString}`);
        const text = await (0, utilities_1.textModifier)(adapter, part.text);
        if ((0, validateMenus_1.isDeleteMenu)(menuString)) {
            await (0, messageIds_1.deleteMessageIds)(instance, userToSend, telegramParams, 'all');
            const menu = menuString.split(':')?.[2]?.split('"')?.[0]; //[["menu:deleteAll:Übersicht"],[""]]
            if (menu && (0, string_1.isNonEmptyString)(menu)) {
                return { navToGoBack: menu };
            }
        }
        const { cbData, menuToHandle, val } = (0, splitValues_1.getMenuValues)(menuString);
        if ((0, validateMenus_1.isCreateSwitch)(cbData) && menuToHandle) {
            return createSwitchMenu({ adapter, cbData, text, menuToHandle: menuToHandle });
        }
        if ((0, validateMenus_1.isFirstMenuValue)(cbData)) {
            await setMenuValue({
                instance,
                part,
                userToSend,
                telegramParams,
                menuNumber: 1,
            });
        }
        if ((0, validateMenus_1.isSecondMenuValue)(cbData)) {
            await setMenuValue({ instance, part, userToSend, telegramParams, menuNumber: 2 });
        }
        if ((0, validateMenus_1.isCreateDynamicSwitch)(cbData) && menuToHandle) {
            return (0, dynamicSwitchMenu_1.createDynamicSwitchMenu)(adapter, menuString, menuToHandle, text);
        }
        if ((0, validateMenus_1.isSetDynamicSwitchVal)(cbData) && val) {
            await (0, setstate_1.handleSetState)(adapter, instance, part, userToSend, val, telegramParams); //SetDynamicValue
        }
        if ((0, validateMenus_1.isCreateSubmenuPercent)(menuString, cbData) && menuToHandle) {
            return createSubmenuPercent({ adapter, cbData, text, menuToHandle: menuToHandle });
        }
        if ((0, validateMenus_1.isSetSubmenuPercent)(menuString, step)) {
            const value = parseInt(menuString.split(':')[1].split(',')[1]);
            await (0, setstate_1.handleSetState)(adapter, instance, part, userToSend, value, telegramParams);
        }
        if ((0, validateMenus_1.isCreateSubmenuNumber)(menuString, cbData) && menuToHandle) {
            return createSubmenuNumber({ adapter, cbData, text, menuToHandle: menuToHandle });
        }
        if ((0, validateMenus_1.isSetSubmenuNumber)(menuString)) {
            const { value } = (0, splitValues_1.getSubmenuNumberValues)(menuString);
            await (0, setstate_1.handleSetState)(adapter, instance, part, userToSend, value, telegramParams);
        }
        if ((0, validateMenus_1.isMenuBack)(menuString)) {
            await back({
                instance,
                userToSend,
                allMenusWithData,
                menus,
                telegramParams,
            });
        }
    }
    catch (error) {
        (0, logging_1.errorLogger)('Error subMenu:', error, adapter);
    }
}
//# sourceMappingURL=subMenu.js.map
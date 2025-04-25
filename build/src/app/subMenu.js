"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subMenu = subMenu;
exports.callSubMenu = callSubMenu;
const backMenu_1 = require("./backMenu");
const setstate_1 = require("./setstate");
const telegram_1 = require("./telegram");
const utilities_1 = require("../lib/utilities");
const subscribeStates_1 = require("./subscribeStates");
const messageIds_1 = require("./messageIds");
const dynamicSwitch_1 = require("./dynamicSwitch");
const string_1 = require("../lib/string");
const main_1 = require("../main");
const logging_1 = require("./logging");
let step = 0;
let returnIDToListenTo = [];
let splittedData = [];
const getMenuValues = (obj) => {
    const splitText = obj[0].split(':');
    return { callbackData: splitText[1], device: splitText[2], val: splitText[3] };
};
const deleteMessages = async (obj) => {
    const navToGoBack = obj.device2Switch;
    if (obj.callbackData.includes('deleteAll')) {
        await (0, messageIds_1.deleteMessageIds)(obj.userToSend, obj.userListWithChatID, obj.instanceTelegram, 'all');
    }
    if (navToGoBack && navToGoBack != '') {
        return { navToGoBack: navToGoBack };
    }
    return;
};
const setDynamicValue = async (obj) => {
    main_1.adapter.log.debug(`State: ${obj.val}`);
    const result = await (0, setstate_1.setState)(obj.part, obj.userToSend, obj.val, true, obj.instanceTelegram, obj.resize_keyboard, obj.one_time_keyboard, obj.userListWithChatID);
    if (Array.isArray(result)) {
        returnIDToListenTo = result;
    }
    return {
        returnIds: returnIDToListenTo,
    };
};
const createSubmenuPercent = (obj) => {
    const { callbackData, device2Switch } = obj;
    step = parseFloat(callbackData.replace('percent', ''));
    let rowEntries = 0;
    let menu = [];
    const keyboard = {
        inline_keyboard: [],
    };
    for (let i = 100; i >= 0; i -= step) {
        menu.push({
            text: `${i}%`,
            callback_data: `submenu:percent${step},${i}:${device2Switch}`,
        });
        if (i != 0 && i - step < 0) {
            menu.push({
                text: `0%`,
                callback_data: `submenu:percent${step},${0}:${device2Switch}`,
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
    return { text: obj.text, keyboard: keyboard, device: device2Switch };
};
const setFirstMenuValue = async (obj) => {
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
    const result = await (0, setstate_1.setState)(obj.part, obj.userToSend, val, true, obj.instanceTelegram, obj.resize_keyboard, obj.one_time_keyboard, obj.userListWithChatID);
    if (Array.isArray(result)) {
        returnIDToListenTo = result;
    }
    return { returnIds: returnIDToListenTo };
};
const setSecondMenuValue = async (obj) => {
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
    const result = await (0, setstate_1.setState)(obj.part, obj.userToSend, val, true, obj.instanceTelegram, obj.one_time_keyboard, obj.resize_keyboard, obj.userListWithChatID);
    if (Array.isArray(result)) {
        returnIDToListenTo = result;
    }
    return { returnIds: returnIDToListenTo };
};
const createSubmenuNumber = (obj) => {
    let callbackData = obj.callbackData;
    const device2Switch = obj.device2Switch;
    if (callbackData.includes('(-)')) {
        callbackData = callbackData.replace('(-)', 'negativ');
    }
    const splittedData = callbackData.replace('number', '').split('-');
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
            callback_data: `submenu:${callbackData}:${device2Switch}:${index}`,
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
    return { text: obj.text, keyboard, device: device2Switch };
};
const createSwitchMenu = ({ device2Switch, callbackData, text, }) => {
    splittedData = callbackData.split('-');
    const keyboard = {
        inline_keyboard: [
            [
                {
                    text: splittedData[1].split('.')[0],
                    callback_data: `menu:first:${device2Switch}`,
                },
                {
                    text: splittedData[2].split('.')[0],
                    callback_data: `menu:second:${device2Switch}`,
                },
            ],
        ],
    };
    return { text: text, keyboard, device: device2Switch };
};
const setValueForSubmenuPercent = async (obj) => {
    const value = parseInt(obj.calledValue.split(':')[1].split(',')[1]);
    const result = await (0, setstate_1.setState)(obj.part, obj.userToSend, value, true, obj.instanceTelegram, obj.resize_keyboard, obj.one_time_keyboard, obj.userListWithChatID);
    if (Array.isArray(result)) {
        returnIDToListenTo = result;
    }
    return { returnIds: returnIDToListenTo };
};
const setValueForSubmenuNumber = async (obj) => {
    main_1.adapter.log.debug(`CallbackData: ${obj.callbackData}`);
    const value = parseFloat(obj.calledValue.split(':')[3]);
    const device2Switch = obj.calledValue.split(':')[2];
    const result = await (0, setstate_1.setState)(obj.part, obj.userToSend, value, true, obj.instanceTelegram, obj.resize_keyboard, obj.one_time_keyboard, obj.userListWithChatID);
    if (Array.isArray(result)) {
        returnIDToListenTo = result;
    }
    return { returnIds: returnIDToListenTo, device2Switch };
};
const back = async (obj) => {
    const result = await (0, backMenu_1.switchBack)(obj.userToSend, obj.allMenusWithData, obj.menus);
    if (result) {
        await (0, telegram_1.sendToTelegram)({
            userToSend: obj.userToSend,
            textToSend: result.texttosend,
            keyboard: result.menuToSend,
            instanceTelegram: obj.instanceTelegram,
            resize_keyboard: obj.resize_keyboard,
            one_time_keyboard: obj.one_time_keyboard,
            userListWithChatID: obj.userListWithChatID,
            parse_mode: result.parse_mode,
        });
    }
};
async function callSubMenu(jsonStringNav, newObjectNavStructure, userToSend, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, part, allMenusWithData, menus, setStateIdsToListenTo, navObj) {
    try {
        const obj = await subMenu({
            jsonStringNav: jsonStringNav,
            userToSend: userToSend,
            instanceTelegram: instanceTelegram,
            resize_keyboard: resize_keyboard,
            one_time_keyboard: one_time_keyboard,
            userListWithChatID: userListWithChatID,
            part,
            allMenusWithData: allMenusWithData,
            menus,
            navObj,
        });
        main_1.adapter.log.debug(`Submenu: ${(0, string_1.jsonString)(obj)}`);
        if (obj?.returnIds) {
            setStateIdsToListenTo = obj.returnIds;
            await (0, subscribeStates_1._subscribeAndUnSubscribeForeignStatesAsync)({ array: obj.returnIds });
        }
        if (obj?.text && obj?.keyboard) {
            (0, telegram_1.sendToTelegramSubmenu)(userToSend, obj.text, obj.keyboard, instanceTelegram, userListWithChatID, part.parse_mode);
        }
        return { setStateIdsToListenTo: setStateIdsToListenTo, newNav: obj?.navToGoBack };
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error callSubMenu:', e, main_1.adapter);
    }
}
async function subMenu({ jsonStringNav, userToSend, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, part, allMenusWithData, menus, navObj, }) {
    try {
        main_1.adapter.log.debug(`Menu : ${navObj?.[0][0]}`);
        let text = '';
        if (part?.text && part.text != '') {
            text = await (0, utilities_1.checkStatusInfo)(part.text);
        }
        const { json, isValidJson } = (0, string_1.parseJSON)(jsonStringNav);
        if (!isValidJson) {
            return;
        }
        const { callbackData, device: device2Switch, val } = getMenuValues(json[0]);
        if (callbackData.includes('delete')) {
            return await deleteMessages({
                userToSend,
                userListWithChatID,
                instanceTelegram,
                device2Switch,
                callbackData,
            });
        }
        else if (callbackData.includes('switch')) {
            return createSwitchMenu({ callbackData, text, device2Switch });
        }
        else if (callbackData.includes('first')) {
            return await setFirstMenuValue({
                part,
                userToSend,
                instanceTelegram,
                resize_keyboard,
                one_time_keyboard,
                userListWithChatID,
            });
        }
        else if (callbackData.includes('second')) {
            return await setSecondMenuValue({
                part,
                userToSend,
                instanceTelegram,
                resize_keyboard,
                one_time_keyboard,
                userListWithChatID,
            });
        }
        else if (callbackData.includes('dynSwitch')) {
            return (0, dynamicSwitch_1.dynamicSwitch)(jsonStringNav, device2Switch, text);
        }
        else if (callbackData.includes('dynS')) {
            return await setDynamicValue({
                val,
                userToSend,
                instanceTelegram,
                resize_keyboard,
                one_time_keyboard,
                userListWithChatID,
                part,
            });
        }
        else if (!jsonStringNav.includes('submenu') && callbackData.includes('percent')) {
            return createSubmenuPercent({ callbackData, text, device2Switch });
        }
        else if (jsonStringNav.includes(`submenu:percent${step}`)) {
            return await setValueForSubmenuPercent({
                callbackData,
                calledValue: jsonStringNav,
                userToSend,
                instanceTelegram,
                resize_keyboard,
                one_time_keyboard,
                userListWithChatID,
                part,
                allMenusWithData,
                menus,
            });
        }
        else if (!jsonStringNav.includes('submenu') && callbackData.includes('number')) {
            return createSubmenuNumber({ callbackData, text, device2Switch });
        }
        else if (jsonStringNav.includes(`submenu:${callbackData}`)) {
            const result = await setValueForSubmenuNumber({
                callbackData,
                calledValue: jsonStringNav,
                userToSend,
                instanceTelegram,
                resize_keyboard,
                one_time_keyboard,
                userListWithChatID,
                part,
            });
            // device2Switch = result.device2Switch;
            return result.returnIds ? { returnIds: result.returnIds } : undefined;
        }
        else if (callbackData === 'back') {
            await back({
                userToSend,
                allMenusWithData,
                menus,
                instanceTelegram,
                resize_keyboard,
                one_time_keyboard,
                userListWithChatID,
            });
        }
        return;
    }
    catch (error) {
        error([
            { text: 'Error subMenu:', val: error.message },
            { text: 'Stack', val: error.stack },
        ]);
    }
}
//# sourceMappingURL=subMenu.js.map
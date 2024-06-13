"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callSubMenu = exports.subMenu = void 0;
const backMenu_1 = require("./backMenu");
const setstate_1 = require("./setstate");
const telegram_1 = require("./telegram");
const utilities_1 = require("./utilities");
const subscribeStates_1 = require("./subscribeStates");
const messageIds_1 = require("./messageIds");
const dynamicSwitch_1 = require("./dynamicSwitch");
const logging_1 = require("./logging");
const console_1 = require("console");
let step = 0;
let returnIDToListenTo = [];
let splittedData = [];
const splitText = (obj) => {
    let splittedText = [];
    if (obj.calledValue.includes('"')) {
        splittedText = obj.calledValue.split(`"`)[1].split(":");
    }
    else {
        splittedText = obj.calledValue.split(":");
    }
    return { callbackData: splittedText[1], device: splittedText[2], val: splittedText[3] };
};
const deleteMessages = async (obj) => {
    const navToGoBack = obj.device2Switch;
    if (obj.callbackData.includes("deleteAll")) {
        await (0, messageIds_1.deleteMessageIds)(obj.userToSend, obj.userListWithChatID, obj.instanceTelegram, "all");
    }
    if (navToGoBack && navToGoBack != "") {
        return { navToGoBack: navToGoBack };
    }
    return;
};
const setDynamicValue = async (obj) => {
    (0, logging_1.debug)([{ text: "SplittedData:", val: obj.val }]);
    const result = await (0, setstate_1.setState)(obj.part, obj.userToSend, obj.val, true, obj.instanceTelegram, obj.resize_keyboard, obj.one_time_keyboard, obj.userListWithChatID);
    if (Array.isArray(result)) {
        returnIDToListenTo = result;
    }
    return {
        returnIds: returnIDToListenTo,
    };
};
const createSubmenuPercent = (obj) => {
    const callbackData = obj.callbackData;
    const device2Switch = obj.device2Switch;
    step = parseFloat(callbackData.replace("percent", ""));
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
    return { text: obj.text, keyboard: JSON.stringify(keyboard), device: device2Switch };
};
const setFirstMenuValue = async (obj) => {
    let val;
    (0, logging_1.debug)([{ text: "SplittedData:", val: splittedData }]);
    if (splittedData[1].split(".")[1] == "false") {
        val = false;
    }
    else if (splittedData[1].split(".")[1] == "true") {
        val = true;
    }
    else {
        val = splittedData[1].split(".")[1];
    }
    const result = await (0, setstate_1.setState)(obj.part, obj.userToSend, val, true, obj.instanceTelegram, obj.resize_keyboard, obj.one_time_keyboard, obj.userListWithChatID);
    if (Array.isArray(result)) {
        returnIDToListenTo = result;
    }
    return { returnIds: returnIDToListenTo };
};
const setSecondMenuValue = async (obj) => {
    let val;
    if (splittedData[2].split(".")[1] == "false") {
        val = false;
    }
    else if (splittedData[2].split(".")[1] == "true") {
        val = true;
    }
    else {
        val = splittedData[2].split(".")[1];
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
    if (callbackData.includes("(-)")) {
        callbackData = callbackData.replace("(-)", "negativ");
    }
    const splittedData = callbackData.replace("number", "").split("-");
    let rowEntries = 0;
    let menu = [];
    const keyboard = {
        inline_keyboard: [],
    };
    let unit = "";
    if (splittedData[3] != "") {
        unit = splittedData[3];
    }
    let start = 0, end = 0;
    const firstValueInText = parseFloat(splittedData[0].includes("negativ") ? splittedData[0].replace("negativ", "-") : splittedData[0]);
    const secondValueInText = parseFloat(splittedData[1].includes("negativ") ? splittedData[1].replace("negativ", "-") : splittedData[1]);
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
    const step = parseFloat(splittedData[2].includes("negativ") ? splittedData[2].replace("negativ", "-") : splittedData[2]);
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
    (0, logging_1.debug)([{ text: "keyboard:", val: keyboard.inline_keyboard }]);
    return { text: obj.text, keyboard: JSON.stringify(keyboard), device: device2Switch };
};
const createSwitchMenu = (obj) => {
    splittedData = obj.callbackData.split("-");
    const keyboard = {
        inline_keyboard: [
            [
                {
                    text: splittedData[1].split(".")[0],
                    callback_data: `menu:first:${obj.device2Switch}`,
                },
                {
                    text: splittedData[2].split(".")[0],
                    callback_data: `menu:second:${obj.device2Switch}`,
                },
            ],
        ],
    };
    return { text: obj.text, keyboard: JSON.stringify(keyboard), device: obj.device2Switch };
};
const setValueForSubmenuPercent = async (obj) => {
    const value = parseInt(obj.calledValue.split(":")[1].split(",")[1]);
    const result = await (0, setstate_1.setState)(obj.part, obj.userToSend, value, true, obj.instanceTelegram, obj.resize_keyboard, obj.one_time_keyboard, obj.userListWithChatID);
    if (Array.isArray(result)) {
        returnIDToListenTo = result;
    }
    return { returnIds: returnIDToListenTo };
};
const setValueForSubmenuNumber = async (obj) => {
    (0, logging_1.debug)([{ text: "CallbackData:", val: obj.callbackData }]);
    const value = parseFloat(obj.calledValue.split(":")[3]);
    const device2Switch = obj.calledValue.split(":")[2];
    const result = await (0, setstate_1.setState)(obj.part, obj.userToSend, value, true, obj.instanceTelegram, obj.resize_keyboard, obj.one_time_keyboard, obj.userListWithChatID);
    if (Array.isArray(result)) {
        returnIDToListenTo = result;
    }
    return { returnIds: returnIDToListenTo, device2Switch };
};
const back = async (obj) => {
    const result = await (0, backMenu_1.switchBack)(obj.userToSend, obj.allMenusWithData, obj.menus);
    if (result) {
        (0, telegram_1.sendToTelegram)(obj.userToSend, result["texttosend"], result["menuToSend"], obj.instanceTelegram, obj.resize_keyboard, obj.one_time_keyboard, obj.userListWithChatID, result["parseMode"]);
    }
};
async function callSubMenu(calledValue, newObjectNavStructure, userToSend, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, part, allMenusWithData, menus, setStateIdsToListenTo) {
    try {
        (0, logging_1.debug)([{ text: "Type of:", val: typeof calledValue }]);
        const obj = await subMenu(calledValue, newObjectNavStructure, userToSend, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, part, allMenusWithData, menus);
        (0, logging_1.debug)([{ text: "Submenu data:", val: obj }]);
        if (obj?.returnIds) {
            setStateIdsToListenTo = obj.returnIds;
            (0, subscribeStates_1._subscribeAndUnSubscribeForeignStatesAsync)({ array: obj.returnIds });
        }
        if (obj && typeof obj.text == "string" && obj.text && typeof obj.keyboard == "string") {
            (0, telegram_1.sendToTelegramSubmenu)(userToSend, obj.text, obj.keyboard, instanceTelegram, userListWithChatID, part.parse_mode || "false");
        }
        return { setStateIdsToListenTo: setStateIdsToListenTo, newNav: obj?.navToGoBack };
    }
    catch (e) {
        (0, console_1.error)({
            array: [
                { text: "Error callSubMenu:", val: e.message },
                { text: "Stack:", val: e.stack },
            ],
        });
    }
}
exports.callSubMenu = callSubMenu;
async function subMenu(calledValue, menuData, userToSend, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, part, allMenusWithData, menus) {
    try {
        (0, logging_1.debug)([{ text: "CalledValue:", val: calledValue }]);
        let text = "";
        if (part && part.text && part.text != "") {
            text = await (0, utilities_1.checkStatusInfo)(part.text);
        }
        const { callbackData, device, val } = splitText({ calledValue });
        let device2Switch = device;
        if (callbackData.includes("delete")) {
            return await deleteMessages({ userToSend, userListWithChatID, instanceTelegram, device2Switch, callbackData });
        }
        else if (callbackData.includes("switch")) {
            return createSwitchMenu({ callbackData, text, device2Switch });
        }
        else if (callbackData.includes("first")) {
            return await setFirstMenuValue({
                part,
                userToSend,
                instanceTelegram,
                resize_keyboard,
                one_time_keyboard,
                userListWithChatID,
            });
        }
        else if (callbackData.includes("second")) {
            return await setSecondMenuValue({
                part,
                userToSend,
                instanceTelegram,
                resize_keyboard,
                one_time_keyboard,
                userListWithChatID,
            });
        }
        else if (callbackData.includes("dynSwitch")) {
            return (0, dynamicSwitch_1.dynamicSwitch)(calledValue, device2Switch, text);
        }
        else if (callbackData.includes("dynS")) {
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
        else if (!calledValue.includes("submenu") && callbackData.includes("percent")) {
            return createSubmenuPercent({ callbackData, text, device2Switch });
        }
        else if (calledValue.includes(`submenu:percent${step}`)) {
            return await setValueForSubmenuPercent({
                callbackData,
                calledValue,
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
        else if (!calledValue.includes("submenu") && callbackData.includes("number")) {
            return createSubmenuNumber({ callbackData, text, device2Switch });
        }
        else if (calledValue.includes(`submenu:${callbackData}`)) {
            const result = await setValueForSubmenuNumber({
                callbackData,
                calledValue,
                userToSend,
                instanceTelegram,
                resize_keyboard,
                one_time_keyboard,
                userListWithChatID,
                part,
            });
            device2Switch = result.device2Switch;
            return result.returnIds ? { returnIds: result.returnIds } : undefined;
        }
        else if (callbackData === "back") {
            await back({ userToSend, allMenusWithData, menus, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID });
        }
        return;
    }
    catch (error) {
        error([
            { text: "Error subMenu:", val: error.message },
            { text: "Stack", val: error.stack },
        ]);
    }
}
exports.subMenu = subMenu;
//# sourceMappingURL=subMenu.js.map
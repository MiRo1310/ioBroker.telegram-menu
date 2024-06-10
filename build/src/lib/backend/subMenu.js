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
        let splittedText = [];
        let callbackData = "";
        let device2Switch = "";
        if (calledValue.includes('"')) {
            splittedText = calledValue.split(`"`)[1].split(":");
        }
        else {
            splittedText = calledValue.split(":");
        }
        device2Switch = splittedText[2];
        callbackData = splittedText[1];
        (0, logging_1.debug)([
            { text: "CallbackData:", val: callbackData },
            { text: "Device2Switch:", val: device2Switch },
            { text: "SplittedText:", val: splittedText },
        ]);
        if (callbackData.includes("delete")) {
            const navToGoBack = splittedText[2];
            if (callbackData.includes("deleteAll")) {
                await (0, messageIds_1.deleteMessageIds)(userToSend, userListWithChatID, instanceTelegram, "all");
            }
            if (navToGoBack && navToGoBack != "") {
                return { navToGoBack: navToGoBack };
            }
            else {
                (0, logging_1.debug)([{ text: "Please insert a Menu in your Delete Submenu" }]);
            }
            return;
        }
        else if (callbackData.includes("switch")) {
            splittedData = callbackData.split("-");
            const keyboard = {
                inline_keyboard: [
                    [
                        {
                            text: splittedData[1].split(".")[0],
                            callback_data: `menu:first:${device2Switch}`,
                        },
                        {
                            text: splittedData[2].split(".")[0],
                            callback_data: `menu:second:${device2Switch}`,
                        },
                    ],
                ],
            };
            return { text, keyboard: JSON.stringify(keyboard), device: device2Switch };
        }
        else if (callbackData.includes("first")) {
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
            const result = await (0, setstate_1.setState)(menuData[device2Switch], userToSend, val, true, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID);
            if (Array.isArray(result))
                returnIDToListenTo = result;
            return { returnIds: returnIDToListenTo };
        }
        else if (callbackData.includes("second")) {
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
            const result = await (0, setstate_1.setState)(menuData[device2Switch], userToSend, val, true, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID);
            if (Array.isArray(result))
                returnIDToListenTo = result;
            return { returnIds: returnIDToListenTo };
        }
        else if (callbackData.includes("dynSwitch")) {
            return (0, dynamicSwitch_1.dynamicSwitch)(calledValue, device2Switch, text);
        }
        else if (callbackData.includes("dynS")) {
            (0, logging_1.debug)([{ text: "SplittedData:", val: splittedData }]);
            const val = splittedText[3];
            const result = await (0, setstate_1.setState)(menuData[device2Switch], userToSend, val, true, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID);
            if (Array.isArray(result))
                returnIDToListenTo = result;
            return {
                returnIds: returnIDToListenTo,
            };
        }
        else if (!calledValue.includes("submenu") && callbackData.includes("percent")) {
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
                if (i != 0 && i - step < 0)
                    menu.push({
                        text: `0%`,
                        callback_data: `submenu:percent${step},${0}:${device2Switch}`,
                    });
                rowEntries++;
                if (rowEntries == 8) {
                    keyboard.inline_keyboard.push(menu);
                    menu = [];
                    rowEntries = 0;
                }
            }
            if (rowEntries != 0)
                keyboard.inline_keyboard.push(menu);
            return { text, keyboard: JSON.stringify(keyboard), device: device2Switch };
        }
        else if (calledValue.includes(`submenu:percent${step}`)) {
            const value = parseInt(calledValue.split(":")[1].split(",")[1]);
            const result = await (0, setstate_1.setState)(menuData[device2Switch], userToSend, value, true, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID);
            if (Array.isArray(result))
                returnIDToListenTo = result;
            return { returnIds: returnIDToListenTo };
        }
        else if (!calledValue.includes("submenu") && callbackData.includes("number")) {
            if (callbackData.includes("(-)"))
                callbackData = callbackData.replace("(-)", "negativ");
            const splittedData = callbackData.replace("number", "").split("-");
            let rowEntries = 0;
            let menu = [];
            const keyboard = {
                inline_keyboard: [],
            };
            let unit = "";
            if (splittedData[3] != "")
                unit = splittedData[3];
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
            if (step < 1)
                maxEntriesPerRow = 6;
            for (let i = start; i >= end; i -= step) {
                // Zahlen umdrehen
                if (parseFloat(splittedData[0]) < parseFloat(splittedData[1])) {
                    if (i === start)
                        index = end - step;
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
            if (rowEntries != 0)
                keyboard.inline_keyboard.push(menu);
            (0, logging_1.debug)([{ text: "keyboard:", val: keyboard.inline_keyboard }]);
            return { text, keyboard: JSON.stringify(keyboard), device: device2Switch };
        }
        else if (calledValue.includes(`submenu:${callbackData}`)) {
            (0, logging_1.debug)([{ text: "CallbackData:", val: callbackData }]);
            const value = parseFloat(calledValue.split(":")[3]);
            device2Switch = calledValue.split(":")[2];
            const result = await (0, setstate_1.setState)(menuData[device2Switch], userToSend, value, true, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID);
            if (Array.isArray(result))
                returnIDToListenTo = result;
            return { returnIds: returnIDToListenTo };
        }
        else if (callbackData === "back") {
            const result = await (0, backMenu_1.switchBack)(userToSend, allMenusWithData, menus);
            if (result)
                (0, telegram_1.sendToTelegram)(userToSend, result["texttosend"], result["menuToSend"], instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, result["parseMode"]);
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
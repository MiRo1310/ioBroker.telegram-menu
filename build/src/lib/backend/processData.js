"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEveryMenuForData = exports.getTimeouts = exports.getStateIdsToListenTo = void 0;
const main_1 = __importDefault(require("../../main"));
const telegram_1 = require("./telegram");
const sendNav_1 = require("./sendNav");
const subMenu_1 = require("./subMenu");
const backMenu_1 = require("./backMenu");
const setstate_1 = require("./setstate");
const getstate_1 = require("./getstate");
const sendpic_1 = require("./sendpic");
const telegram_2 = require("./telegram");
const dynamicValue_1 = require("./dynamicValue");
const action_1 = require("./action");
const subscribeStates_1 = require("./subscribeStates");
const echarts_1 = require("./echarts");
const httpRequest_1 = require("./httpRequest");
const logging_1 = require("./logging");
let setStateIdsToListenTo = [];
let timeouts = [];
async function checkEveryMenuForData(obj) {
    const { menuData, calledValue, userToSend, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, menus, isUserActiveCheckbox, token, directoryPicture, timeoutKey, } = obj;
    const _this = main_1.default.getInstance();
    for (const menu of menus) {
        const groupData = menuData.data[menu];
        (0, logging_1.debug)([
            { text: "Nav:", val: menuData.data[menu] },
            { text: "Menu:", val: menu },
            { text: "Group:", val: menuData.data[menu] },
        ]);
        if (await processData({
            _this,
            menuData,
            calledValue: calledValue,
            userToSend,
            groupWithUser: menu,
            instanceTelegram,
            resize_keyboard: resize_keyboard,
            one_time_keyboard: one_time_keyboard,
            userListWithChatID,
            allMenusWithData: menuData.data,
            menus,
            isUserActiveCheckbox,
            token,
            directoryPicture,
            timeoutKey,
            groupData,
        })) {
            (0, logging_1.debug)([{ text: "CalledText found" }]);
            return true;
        }
    }
    return false;
}
exports.checkEveryMenuForData = checkEveryMenuForData;
async function processData(obj) {
    const { _this, menuData, calledValue, userToSend, groupWithUser, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, allMenusWithData, menus, isUserActiveCheckbox, token, directoryPicture, timeoutKey, groupData, } = obj;
    try {
        let part = {};
        let call = "";
        if ((0, dynamicValue_1.getDynamicValue)(userToSend)) {
            const res = (0, dynamicValue_1.getDynamicValue)(userToSend);
            let valueToSet;
            if (res && res.valueType) {
                valueToSet = (0, action_1.adjustValueType)(calledValue, res.valueType);
            }
            else {
                valueToSet = calledValue;
            }
            if (valueToSet) {
                await _this.setForeignStateAsync(res?.id, valueToSet, res?.ack);
            }
            else {
                (0, telegram_1.sendToTelegram)(userToSend, `You insert a wrong Type of value, please insert type: ${res?.valueType}`, undefined, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, "");
            }
            (0, dynamicValue_1.removeUserFromDynamicValue)(userToSend);
            const result = await (0, backMenu_1.switchBack)(userToSend, allMenusWithData, menus, true);
            if (result)
                (0, telegram_1.sendToTelegram)(userToSend, result["texttosend"] || "", result["menuToSend"], instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, result["parseMode"]);
            else {
                (0, sendNav_1.sendNav)(part, userToSend, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard);
            }
            return true;
        }
        if (typeof calledValue === "string" && calledValue.includes("menu:")) {
            call = calledValue.split(":")[2];
        }
        else {
            call = calledValue;
        }
        if (typeof call === "string" &&
            groupData &&
            groupData[call] &&
            !calledValue.includes("menu:") &&
            userToSend &&
            groupWithUser &&
            isUserActiveCheckbox[groupWithUser]) {
            part = groupData[call];
            // Navigation
            if (part.nav) {
                (0, logging_1.debug)([{ text: "Menu to Send:", val: part.nav }]);
                (0, backMenu_1.backMenuFunc)(call, part.nav, userToSend);
                if (JSON.stringify(part.nav).includes("menu:")) {
                    (0, logging_1.debug)([{ text: "Submenu" }]);
                    const result = await (0, subMenu_1.callSubMenu)(JSON.stringify(part.nav), groupData, userToSend, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, part, allMenusWithData, menus, setStateIdsToListenTo);
                    if (result && result.setStateIdsToListenTo)
                        setStateIdsToListenTo = result.setStateIdsToListenTo;
                    if (result && result.newNav) {
                        checkEveryMenuForData({
                            menuData,
                            calledValue: result.newNav,
                            userToSend,
                            instanceTelegram,
                            resize_keyboard,
                            one_time_keyboard,
                            userListWithChatID,
                            menus,
                            isUserActiveCheckbox,
                            token,
                            directoryPicture,
                            timeoutKey,
                        });
                    }
                }
                else {
                    (0, sendNav_1.sendNav)(part, userToSend, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard);
                }
                return true;
            }
            // Schalten
            if (part.switch) {
                const result = await (0, setstate_1.setState)(part, userToSend, 0, false, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID);
                if (result) {
                    setStateIdsToListenTo = result;
                }
                if (Array.isArray(setStateIdsToListenTo)) {
                    (0, subscribeStates_1._subscribeAndUnSubscribeForeignStatesAsync)({ array: setStateIdsToListenTo });
                }
                return true;
            }
            if (part.getData) {
                (0, getstate_1.getState)(part, userToSend, instanceTelegram, one_time_keyboard, resize_keyboard, userListWithChatID);
                return true;
            }
            if (part.sendPic) {
                const result = (0, sendpic_1.sendPic)(part, userToSend, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, token, directoryPicture, timeouts, timeoutKey);
                if (result) {
                    timeouts = result;
                }
                else {
                    (0, logging_1.debug)([{ text: "Timeouts not found" }]);
                }
                return true;
            }
            if (part.location) {
                (0, logging_1.debug)([{ text: "Send Location" }]);
                (0, telegram_2.sendLocationToTelegram)(userToSend, part.location, instanceTelegram, userListWithChatID);
                return true;
            }
            if (part.echarts) {
                (0, logging_1.debug)([{ text: "Echarts" }]);
                await (0, echarts_1.getChart)(part.echarts, directoryPicture, userToSend, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard);
                return true;
            }
            if (part.httpRequest) {
                (0, logging_1.debug)([{ text: "HttpRequest" }]);
                const result = await (0, httpRequest_1.httpRequest)(part, userToSend, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, directoryPicture);
                if (result) {
                    return true;
                }
            }
        }
        if ((calledValue.startsWith("menu") || calledValue.startsWith("submenu")) && menuData.data[groupWithUser][call]) {
            (0, logging_1.debug)([{ text: "Call Submenu" }]);
            const result = await (0, subMenu_1.callSubMenu)(calledValue, menuData, userToSend, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, part, allMenusWithData, menus, setStateIdsToListenTo);
            if (result && result.setStateIdsToListenTo) {
                setStateIdsToListenTo = result.setStateIdsToListenTo;
            }
            return true;
        }
        return false;
    }
    catch (e) {
        (0, logging_1.error)([
            { text: "Error processData:", val: e.message },
            { text: "Stack:", val: e.stack },
        ]);
    }
}
function getStateIdsToListenTo() {
    return setStateIdsToListenTo;
}
exports.getStateIdsToListenTo = getStateIdsToListenTo;
function getTimeouts() {
    return timeouts;
}
exports.getTimeouts = getTimeouts;
//# sourceMappingURL=processData.js.map
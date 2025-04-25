"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStateIdsToListenTo = getStateIdsToListenTo;
exports.getTimeouts = getTimeouts;
exports.checkEveryMenuForData = checkEveryMenuForData;
const main_1 = require("../main");
const telegram_1 = require("./telegram");
const sendNav_1 = require("./sendNav");
const subMenu_1 = require("./subMenu");
const backMenu_1 = require("./backMenu");
const setstate_1 = require("./setstate");
const getstate_1 = require("./getstate");
const sendpic_1 = require("./sendpic");
const dynamicValue_1 = require("./dynamicValue");
const action_1 = require("./action");
const subscribeStates_1 = require("./subscribeStates");
const echarts_1 = require("./echarts");
const httpRequest_1 = require("./httpRequest");
const logging_1 = require("./logging");
const string_1 = require("../lib/string");
let setStateIdsToListenTo = [];
let timeouts = [];
async function checkEveryMenuForData(obj) {
    const { menuData, calledValue, userToSend, telegramInstance, resize_keyboard, one_time_keyboard, userListWithChatID, menus, isUserActiveCheckbox, token, directoryPicture, timeoutKey, } = obj;
    for (const menu of menus) {
        const groupData = menuData[menu];
        main_1.adapter.log.debug(`Menu: ${menu}`);
        main_1.adapter.log.debug(`Nav: ${(0, string_1.jsonString)(menuData[menu])}`);
        if (await processData({
            menuData,
            calledValue,
            userToSend,
            groupWithUser: menu,
            telegramInstance,
            resize_keyboard,
            one_time_keyboard,
            userListWithChatID,
            allMenusWithData: menuData,
            menus,
            isUserActiveCheckbox,
            token,
            directoryPicture,
            timeoutKey,
            groupData,
        })) {
            main_1.adapter.log.debug('CalledText found');
            return true;
        }
    }
    return false;
}
async function processData(obj) {
    const { menuData, calledValue, userToSend, groupWithUser, telegramInstance, resize_keyboard, one_time_keyboard, userListWithChatID, allMenusWithData, menus, isUserActiveCheckbox, token, directoryPicture, timeoutKey, groupData, } = obj;
    try {
        let part = {};
        if ((0, dynamicValue_1.getDynamicValue)(userToSend)) {
            const res = (0, dynamicValue_1.getDynamicValue)(userToSend);
            const valueToSet = res?.valueType ? (0, action_1.adjustValueType)(calledValue, res.valueType) : calledValue;
            valueToSet && res?.id
                ? await main_1.adapter.setForeignStateAsync(res?.id, valueToSet, res?.ack)
                : await (0, telegram_1.sendToTelegram)({
                    userToSend,
                    textToSend: `You insert a wrong Type of value, please insert type: ${res?.valueType}`,
                    telegramInstance: telegramInstance,
                    resize_keyboard,
                    one_time_keyboard,
                    userListWithChatID,
                });
            (0, dynamicValue_1.removeUserFromDynamicValue)(userToSend);
            const result = await (0, backMenu_1.switchBack)(userToSend, allMenusWithData, menus, true);
            if (result) {
                const { textToSend, menuToSend, parse_mode } = result;
                await (0, telegram_1.sendToTelegram)({
                    userToSend,
                    textToSend: textToSend ?? '',
                    keyboard: menuToSend,
                    telegramInstance,
                    resize_keyboard,
                    one_time_keyboard,
                    userListWithChatID,
                    parse_mode,
                });
                return true;
            }
            await (0, sendNav_1.sendNav)(part, userToSend, telegramInstance, userListWithChatID, resize_keyboard, one_time_keyboard);
            return true;
        }
        const call = calledValue.includes('menu:') ? calledValue.split(':')[2] : calledValue;
        part = groupData[call];
        if (!calledValue.toString().includes('menu:') && isUserActiveCheckbox[groupWithUser]) {
            if (part.nav) {
                main_1.adapter.log.debug(`Menu to Send: ${(0, string_1.jsonString)(part.nav)}`);
                (0, backMenu_1.backMenuFunc)({ startSide: call, navigation: part.nav, userToSend: userToSend });
                if ((0, string_1.jsonString)(part.nav).includes('menu:')) {
                    main_1.adapter.log.debug(`Submenu: ${(0, string_1.jsonString)(part.nav)}`);
                    const result = await (0, subMenu_1.callSubMenu)((0, string_1.jsonString)(part.nav), groupData, userToSend, telegramInstance, resize_keyboard, one_time_keyboard, userListWithChatID, part, allMenusWithData, menus, setStateIdsToListenTo, part.nav);
                    if (result?.setStateIdsToListenTo) {
                        setStateIdsToListenTo = result.setStateIdsToListenTo;
                    }
                    if (result?.newNav) {
                        await checkEveryMenuForData({
                            menuData,
                            calledValue: result.newNav,
                            userToSend,
                            telegramInstance: telegramInstance,
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
                    return true;
                }
                await (0, sendNav_1.sendNav)(part, userToSend, telegramInstance, userListWithChatID, resize_keyboard, one_time_keyboard);
                return true;
            }
            if (part.switch) {
                const result = await (0, setstate_1.setState)(part, userToSend, 0, false, telegramInstance, resize_keyboard, one_time_keyboard, userListWithChatID);
                if (result) {
                    setStateIdsToListenTo = result;
                }
                if (Array.isArray(setStateIdsToListenTo)) {
                    await (0, subscribeStates_1._subscribeAndUnSubscribeForeignStatesAsync)({ array: setStateIdsToListenTo });
                }
                return true;
            }
            if (part.getData) {
                (0, getstate_1.getState)(part, userToSend, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID);
                return true;
            }
            if (part.sendPic) {
                const result = (0, sendpic_1.sendPic)(part, userToSend, telegramInstance, resize_keyboard, one_time_keyboard, userListWithChatID, token, directoryPicture, timeouts, timeoutKey);
                if (result) {
                    timeouts = result;
                    return true;
                }
                main_1.adapter.log.debug(`Timeouts not found`);
                return true;
            }
            if (part.location) {
                main_1.adapter.log.debug('Send location');
                await (0, telegram_1.sendLocationToTelegram)(userToSend, part.location, telegramInstance, userListWithChatID);
                return true;
            }
            if (part.echarts) {
                main_1.adapter.log.debug('Send echars');
                (0, echarts_1.getChart)(part.echarts, directoryPicture, userToSend, telegramInstance, userListWithChatID, resize_keyboard, one_time_keyboard);
                return true;
            }
            if (part.httpRequest) {
                main_1.adapter.log.debug('Send http request');
                const result = await (0, httpRequest_1.httpRequest)(part, userToSend, telegramInstance, resize_keyboard, one_time_keyboard, userListWithChatID, directoryPicture);
                return !!result;
            }
        }
        if ((calledValue.startsWith('menu') || calledValue.startsWith('submenu')) && menuData[groupWithUser][call]) {
            main_1.adapter.log.debug('Call Submenu');
            const result = await (0, subMenu_1.callSubMenu)(calledValue, menuData, userToSend, telegramInstance, resize_keyboard, one_time_keyboard, userListWithChatID, part, allMenusWithData, menus, setStateIdsToListenTo, part.nav);
            if (result && result.setStateIdsToListenTo) {
                setStateIdsToListenTo = result.setStateIdsToListenTo;
            }
            return true;
        }
        return false;
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error processData:', e, main_1.adapter);
    }
}
function getStateIdsToListenTo() {
    return setStateIdsToListenTo;
}
function getTimeouts() {
    return timeouts;
}
//# sourceMappingURL=processData.js.map
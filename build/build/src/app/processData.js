"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    const { menuData, calledValue, userToSend, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, menus, isUserActiveCheckbox, token, directoryPicture, timeoutKey, } = obj;
    for (const menu of menus) {
        const groupData = menuData.data[menu];
        main_1._this.log.debug(`Menu: ${menu}`);
        main_1._this.log.debug(`Nav: ${(0, string_1.jsonString)(menuData.data[menu])}`);
        if (await processData({
            menuData,
            calledValue,
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
            main_1._this.log.debug('CalledText found');
            return true;
        }
    }
    return false;
}
async function processData(obj) {
    const { menuData, calledValue, userToSend, groupWithUser, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, allMenusWithData, menus, isUserActiveCheckbox, token, directoryPicture, timeoutKey, groupData, } = obj;
    try {
        let part = {};
        let call = '';
        if ((0, dynamicValue_1.getDynamicValue)(userToSend)) {
            const res = (0, dynamicValue_1.getDynamicValue)(userToSend);
            let valueToSet;
            if (res && res.valueType) {
                valueToSet = (0, action_1.adjustValueType)(calledValue, res.valueType);
            }
            else {
                valueToSet = calledValue;
            }
            if (valueToSet && res?.id) {
                await main_1._this.setForeignStateAsync(res?.id, valueToSet, res?.ack);
            }
            else {
                await (0, telegram_1.sendToTelegram)({
                    user: userToSend,
                    textToSend: `You insert a wrong Type of value, please insert type: ${res?.valueType}`,
                    keyboard: undefined,
                    instance: instanceTelegram,
                    resize_keyboard: resize_keyboard,
                    one_time_keyboard: one_time_keyboard,
                    userListWithChatID: userListWithChatID,
                    parse_mode: 'false',
                });
            }
            (0, dynamicValue_1.removeUserFromDynamicValue)(userToSend);
            const result = await (0, backMenu_1.switchBack)(userToSend, allMenusWithData, menus, true);
            if (result) {
                await (0, telegram_1.sendToTelegram)({
                    user: userToSend,
                    textToSend: result.texttosend || '',
                    keyboard: result.menuToSend,
                    instance: instanceTelegram,
                    resize_keyboard: resize_keyboard,
                    one_time_keyboard: one_time_keyboard,
                    userListWithChatID: userListWithChatID,
                    parse_mode: result.parseMode,
                });
            }
            else {
                await (0, sendNav_1.sendNav)(part, userToSend, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard);
            }
            return true;
        }
        if (calledValue.includes('menu:')) {
            call = calledValue.split(':')[2];
        }
        else {
            call = calledValue;
        }
        part = groupData[call];
        if (typeof call === 'string' &&
            groupData &&
            part &&
            !calledValue.toString().includes('menu:') &&
            userToSend &&
            groupWithUser &&
            isUserActiveCheckbox[groupWithUser]) {
            if (part.nav) {
                main_1._this.log.debug(`Menu to Send: ${part.nav}`);
                (0, backMenu_1.backMenuFunc)(call, part.nav, userToSend);
                if (JSON.stringify(part.nav).includes('menu:')) {
                    main_1._this.log.debug(`Submenu: ${part.nav}`);
                    const result = await (0, subMenu_1.callSubMenu)(JSON.stringify(part.nav), groupData, userToSend, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, part, allMenusWithData, menus, setStateIdsToListenTo, part.nav);
                    if (result && result.setStateIdsToListenTo) {
                        setStateIdsToListenTo = result.setStateIdsToListenTo;
                    }
                    if (result && result.newNav) {
                        await checkEveryMenuForData({
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
                    await (0, sendNav_1.sendNav)(part, userToSend, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard);
                }
                return true;
            }
            if (part.switch) {
                const result = await (0, setstate_1.setState)(part, userToSend, 0, false, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID);
                if (result) {
                    setStateIdsToListenTo = result;
                }
                if (Array.isArray(setStateIdsToListenTo)) {
                    await (0, subscribeStates_1._subscribeAndUnSubscribeForeignStatesAsync)({ array: setStateIdsToListenTo });
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
                    main_1._this.log.debug(`Timeouts not found`);
                }
                return true;
            }
            if (part.location) {
                main_1._this.log.debug('Send location');
                await (0, telegram_1.sendLocationToTelegram)(userToSend, part.location, instanceTelegram, userListWithChatID);
                return true;
            }
            if (part.echarts) {
                main_1._this.log.debug('Send echars');
                (0, echarts_1.getChart)(part.echarts, directoryPicture, userToSend, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard);
                return true;
            }
            if (part.httpRequest) {
                main_1._this.log.debug('Send http request');
                const result = await (0, httpRequest_1.httpRequest)(part, userToSend, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, directoryPicture);
                if (result) {
                    return true;
                }
            }
        }
        if ((calledValue.startsWith('menu') || calledValue.startsWith('submenu')) &&
            menuData.data[groupWithUser][call]) {
            main_1._this.log.debug('Call Submenu');
            const result = await (0, subMenu_1.callSubMenu)(calledValue, menuData, userToSend, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, part, allMenusWithData, menus, setStateIdsToListenTo, part.nav);
            if (result && result.setStateIdsToListenTo) {
                setStateIdsToListenTo = result.setStateIdsToListenTo;
            }
            return true;
        }
        return false;
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error processData:', e);
    }
}
function getStateIdsToListenTo() {
    return setStateIdsToListenTo;
}
function getTimeouts() {
    return timeouts;
}

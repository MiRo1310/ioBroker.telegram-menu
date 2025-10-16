"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEveryMenuForData = checkEveryMenuForData;
exports.getTimeouts = getTimeouts;
const string_1 = require("../lib/string");
const dynamicValue_1 = require("../app/dynamicValue");
const action_1 = require("../app/action");
const setstate_1 = require("../app/setstate");
const telegram_1 = require("../app/telegram");
const backMenu_1 = require("../app/backMenu");
const sendNav_1 = require("../app/sendNav");
const subMenu_1 = require("../app/subMenu");
const getstate_1 = require("../app/getstate");
const sendpic_1 = require("../app/sendpic");
const echarts_1 = require("../app/echarts");
const httpRequest_1 = require("../app/httpRequest");
const validateMenus_1 = require("../app/validateMenus");
const logging_1 = require("../app/logging");
let timeouts = [];
async function checkEveryMenuForData({ instance, menuData, navToGoTo, userToSend, telegramParams, menus, isUserActiveCheckbox, token, directoryPicture, timeoutKey, }) {
    const adapter = telegramParams.adapter;
    for (const menu of menus) {
        const groupData = menuData[menu];
        adapter.log.debug(`Menu : ${menu}`);
        adapter.log.debug(`Nav : ${(0, string_1.jsonString)(menuData[menu])}`);
        if (await processData({
            adapter,
            instance,
            menuData,
            calledValue: navToGoTo,
            userToSend,
            groupWithUser: menu,
            telegramParams,
            allMenusWithData: menuData,
            menus,
            isUserActiveCheckbox,
            token,
            directoryPicture,
            timeoutKey,
            groupData,
        })) {
            adapter.log.debug('Menu found');
            return true;
        }
    }
    return false;
}
async function processData({ instance, menuData, calledValue, userToSend, groupWithUser, telegramParams, allMenusWithData, menus, isUserActiveCheckbox, token, directoryPicture, timeoutKey, groupData, adapter, }) {
    try {
        let part = {};
        const dynamicValue = (0, dynamicValue_1.getDynamicValue)(userToSend);
        if (dynamicValue) {
            const valueToSet = dynamicValue?.valueType
                ? (0, action_1.adjustValueType)(adapter, calledValue, dynamicValue.valueType)
                : calledValue;
            valueToSet && dynamicValue?.id
                ? await (0, setstate_1.setstateIobroker)({ adapter, id: dynamicValue.id, value: valueToSet, ack: dynamicValue?.ack })
                : await (0, telegram_1.sendToTelegram)({
                    instance,
                    userToSend,
                    textToSend: `You insert a wrong Type of value, please insert type : ${dynamicValue?.valueType}`,
                    telegramParams,
                });
            (0, dynamicValue_1.removeUserFromDynamicValue)(userToSend);
            const result = await (0, backMenu_1.switchBack)(adapter, userToSend, allMenusWithData, menus, true);
            if (result && !dynamicValue.navToGoTo) {
                const { textToSend, keyboard, parse_mode } = result;
                await (0, telegram_1.sendToTelegram)({ instance, userToSend, textToSend, keyboard, telegramParams, parse_mode });
                return true;
            }
            await (0, sendNav_1.sendNav)(adapter, instance, part, userToSend, telegramParams);
            return true;
        }
        const call = calledValue.includes('menu:') ? calledValue.split(':')[2] : calledValue;
        part = groupData[call];
        if (!calledValue.toString().includes('menu:') && isUserActiveCheckbox[groupWithUser]) {
            const nav = part?.nav;
            if (nav) {
                adapter.log.debug(`Menu to Send: ${(0, string_1.jsonString)(nav)}`);
                (0, backMenu_1.backMenuFunc)({ activePage: call, navigation: nav, userToSend });
                if ((0, string_1.jsonString)(nav).includes('menu:')) {
                    adapter.log.debug(`Submenu: ${(0, string_1.jsonString)(nav)}`);
                    const result = await (0, subMenu_1.callSubMenu)({
                        adapter,
                        instance,
                        jsonStringNav: (0, string_1.jsonString)(nav),
                        userToSend,
                        telegramParams,
                        part,
                        allMenusWithData,
                        menus,
                    });
                    if (result?.newNav) {
                        await checkEveryMenuForData({
                            instance,
                            menuData,
                            navToGoTo: result.newNav,
                            userToSend,
                            telegramParams,
                            menus,
                            isUserActiveCheckbox,
                            token,
                            directoryPicture,
                            timeoutKey,
                        });
                    }
                    return true;
                }
                await (0, sendNav_1.sendNav)(adapter, instance, part, userToSend, telegramParams);
                return true;
            }
            if (part?.switch) {
                await (0, setstate_1.handleSetState)(instance, part, userToSend, null, telegramParams);
                return true;
            }
            if (part?.getData) {
                await (0, getstate_1.getState)(instance, part, userToSend, telegramParams);
                return true;
            }
            if (part?.sendPic) {
                timeouts = (0, sendpic_1.sendPic)(instance, part, userToSend, telegramParams, token, directoryPicture, timeouts, timeoutKey);
                return true;
            }
            if (part?.location) {
                adapter.log.debug('Send location');
                await (0, telegram_1.sendLocationToTelegram)(instance, userToSend, part.location, telegramParams);
                return true;
            }
            if (part?.echarts) {
                adapter.log.debug('Send echarts');
                (0, echarts_1.getChart)(instance, part.echarts, directoryPicture, userToSend, telegramParams);
                return true;
            }
            if (part?.httpRequest) {
                adapter.log.debug('Send http request');
                const result = await (0, httpRequest_1.httpRequest)(adapter, instance, part, userToSend, telegramParams, directoryPicture);
                return !!result;
            }
        }
        if ((0, validateMenus_1.isSubmenuOrMenu)(calledValue) && menuData[groupWithUser][call]) {
            adapter.log.debug('Call Submenu');
            await (0, subMenu_1.callSubMenu)({
                adapter,
                instance,
                jsonStringNav: calledValue,
                userToSend: userToSend,
                telegramParams: telegramParams,
                part: part,
                allMenusWithData: allMenusWithData,
                menus: menus,
            });
            return true;
        }
        return false;
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error processData:', e, adapter);
    }
}
function getTimeouts() {
    return timeouts;
}
//# sourceMappingURL=processData.js.map
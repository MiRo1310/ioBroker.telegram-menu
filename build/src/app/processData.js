"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEveryMenuForData = checkEveryMenuForData;
exports.getTimeouts = getTimeouts;
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
const echarts_1 = require("./echarts");
const httpRequest_1 = require("./httpRequest");
const logging_1 = require("./logging");
const string_1 = require("../lib/string");
const validateMenus_1 = require("./validateMenus");
let timeouts = [];
async function checkEveryMenuForData({ menuData, calledValue, userToSend, telegramParams, menus, isUserActiveCheckbox, token, directoryPicture, timeoutKey, }) {
    for (const menu of menus) {
        const groupData = menuData[menu];
        main_1.adapter.log.debug(`Menu : ${menu}`);
        main_1.adapter.log.debug(`Nav : ${(0, string_1.jsonString)(menuData[menu])}`);
        if (await processData({
            menuData,
            calledValue,
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
            main_1.adapter.log.debug('Menu found');
            return true;
        }
    }
    return false;
}
async function processData({ menuData, calledValue, userToSend, groupWithUser, telegramParams, allMenusWithData, menus, isUserActiveCheckbox, token, directoryPicture, timeoutKey, groupData, }) {
    try {
        let part = {};
        const res = (0, dynamicValue_1.getDynamicValue)(userToSend);
        if (res) {
            const valueToSet = res?.valueType ? (0, action_1.adjustValueType)(calledValue, res.valueType) : calledValue;
            valueToSet && res?.id
                ? await (0, setstate_1.setstateIobroker)({ id: res.id, value: valueToSet, ack: res?.ack })
                : await (0, telegram_1.sendToTelegram)({
                    userToSend,
                    textToSend: `You insert a wrong Type of value, please insert type : ${res?.valueType}`,
                    telegramParams,
                });
            (0, dynamicValue_1.removeUserFromDynamicValue)(userToSend);
            const result = await (0, backMenu_1.switchBack)(userToSend, allMenusWithData, menus, true);
            if (result) {
                const { textToSend, keyboard, parse_mode } = result;
                await (0, telegram_1.sendToTelegram)({ userToSend, textToSend, keyboard, telegramParams, parse_mode });
                return true;
            }
            await (0, sendNav_1.sendNav)(part, userToSend, telegramParams);
            return true;
        }
        const call = calledValue.includes('menu:') ? calledValue.split(':')[2] : calledValue;
        part = groupData[call];
        if (!calledValue.toString().includes('menu:') && isUserActiveCheckbox[groupWithUser]) {
            const nav = part?.nav;
            if (nav) {
                main_1.adapter.log.debug(`Menu to Send: ${(0, string_1.jsonString)(nav)}`);
                (0, backMenu_1.backMenuFunc)({ activePage: call, navigation: nav, userToSend });
                if ((0, string_1.jsonString)(nav).includes('menu:')) {
                    main_1.adapter.log.debug(`Submenu: ${(0, string_1.jsonString)(nav)}`);
                    const result = await (0, subMenu_1.callSubMenu)({
                        jsonStringNav: (0, string_1.jsonString)(nav),
                        userToSend,
                        telegramParams,
                        part,
                        allMenusWithData,
                        menus,
                    });
                    if (result?.newNav) {
                        await checkEveryMenuForData({
                            menuData,
                            calledValue: result.newNav,
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
                await (0, sendNav_1.sendNav)(part, userToSend, telegramParams);
                return true;
            }
            if (part?.switch) {
                await (0, setstate_1.handleSetState)(part, userToSend, 0, telegramParams);
                return true;
            }
            if (part?.getData) {
                await (0, getstate_1.getState)(part, userToSend, telegramParams);
                return true;
            }
            if (part?.sendPic) {
                timeouts = (0, sendpic_1.sendPic)(part, userToSend, telegramParams, token, directoryPicture, timeouts, timeoutKey);
                return true;
            }
            if (part?.location) {
                main_1.adapter.log.debug('Send location');
                await (0, telegram_1.sendLocationToTelegram)(userToSend, part.location, telegramParams);
                return true;
            }
            if (part?.echarts) {
                main_1.adapter.log.debug('Send echarts');
                (0, echarts_1.getChart)(part.echarts, directoryPicture, userToSend, telegramParams);
                return true;
            }
            if (part?.httpRequest) {
                main_1.adapter.log.debug('Send http request');
                const result = await (0, httpRequest_1.httpRequest)(part, userToSend, telegramParams, directoryPicture);
                return !!result;
            }
        }
        if ((0, validateMenus_1.isSubmenuOrMenu)(calledValue) && menuData[groupWithUser][call]) {
            main_1.adapter.log.debug('Call Submenu');
            await (0, subMenu_1.callSubMenu)({
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
        (0, logging_1.errorLogger)('Error processData:', e, main_1.adapter);
    }
}
function getTimeouts() {
    return timeouts;
}
//# sourceMappingURL=processData.js.map
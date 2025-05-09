"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserToSendFromUserListWithChatID = exports.checkEvent = exports.adjustValueType = exports.bindingFunc = exports.idBySelector = void 0;
exports.generateActions = generateActions;
const telegram_1 = require("./telegram");
const subMenu_1 = require("./subMenu");
const sendNav_1 = require("./sendNav");
const backMenu_1 = require("./backMenu");
const logging_1 = require("./logging");
const main_1 = require("../main");
const string_1 = require("../lib/string");
const utils_1 = require("../lib/utils");
const math_1 = require("../lib/math");
const config_1 = require("../config/config");
const bindingFunc = async (text, userToSend, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, parse_mode) => {
    let textToSend;
    try {
        const { substringExcludeSearch } = (0, string_1.decomposeText)(text, config_1.config.binding.start, config_1.config.binding.end);
        const arrayOfItems = substringExcludeSearch.split(config_1.config.binding.splitChar);
        const bindingObject = {
            values: {},
        };
        for (let item of arrayOfItems) {
            if (!item.includes('?')) {
                const array = item.split(':');
                const key = array[0];
                const id = array[1];
                const result = await main_1.adapter.getForeignStateAsync(id);
                if (result) {
                    bindingObject.values[key] = result.val?.toString() ?? '';
                }
            }
            else {
                Object.keys(bindingObject.values).forEach(function (key) {
                    item = item.replace(key, bindingObject.values[key]);
                });
                const { val } = (0, math_1.evaluate)(item, main_1.adapter);
                textToSend = String(val);
            }
        }
        await (0, telegram_1.sendToTelegram)({
            userToSend,
            textToSend,
            telegramInstance,
            resize_keyboard,
            one_time_keyboard,
            userListWithChatID,
            parse_mode,
        });
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error Binding function: ', e, main_1.adapter);
    }
};
exports.bindingFunc = bindingFunc;
const idBySelector = async ({ selector, text, userToSend, newline, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, }) => {
    let text2Send = '';
    try {
        const functions = selector.replace(config_1.config.functionSelektor, '');
        let enums = [];
        const result = await main_1.adapter.getEnumsAsync();
        if (!result?.['enum.functions'][`enum.functions.${functions}`]) {
            return;
        }
        enums = result['enum.functions'][`enum.functions.${functions}`].common.members;
        if (!enums) {
            return;
        }
        const promises = enums.map(async (id) => {
            const value = await main_1.adapter.getForeignStateAsync(id);
            if ((0, utils_1.isDefined)(value?.val)) {
                let newText = text;
                let res;
                if (text.includes('{common.name}')) {
                    res = await main_1.adapter.getForeignObjectAsync(id);
                    main_1.adapter.log.debug(`Name ${(0, string_1.jsonString)(res?.common.name)}`);
                    if (res && typeof res.common.name === 'string') {
                        newText = newText.replace('{common.name}', res.common.name);
                    }
                }
                if (text.includes('&amp;&amp;')) {
                    text2Send += newText.replace('&amp;&amp;', String(value.val));
                }
                else if (text.includes('&&')) {
                    text2Send += newText.replace('&&', String(value.val));
                }
                else {
                    text2Send += newText;
                    text2Send += ` ${value.val}`;
                }
            }
            text2Send += (0, string_1.getNewline)(newline);
            main_1.adapter.log.debug(`text2send ${JSON.stringify(text2Send)}`);
        });
        Promise.all(promises)
            .then(async () => {
            await (0, telegram_1.sendToTelegram)({
                userToSend,
                textToSend: text2Send,
                telegramInstance: telegramInstance,
                resize_keyboard,
                one_time_keyboard,
                userListWithChatID,
            });
        })
            .catch(e => {
            (0, logging_1.errorLogger)('Error Promise:', e, main_1.adapter);
        });
    }
    catch (error) {
        (0, logging_1.errorLogger)('Error idBySelector: ', error, main_1.adapter);
    }
};
exports.idBySelector = idBySelector;
function generateActions(action, userObject) {
    try {
        const arrayOfEntries = [
            {
                objName: 'echarts',
                name: 'echarts',
                loop: 'preset',
                elements: [
                    { name: 'preset' },
                    { name: 'echartInstance' },
                    { name: 'background' },
                    { name: 'theme' },
                    { name: 'filename' },
                ],
            },
            {
                objName: 'loc',
                name: 'location',
                loop: 'latitude',
                elements: [{ name: 'latitude' }, { name: 'longitude' }, { name: 'parse_mode', key: 0 }],
            },
            {
                objName: 'pic',
                name: 'sendPic',
                loop: 'IDs',
                elements: [
                    { name: 'id', value: 'IDs' },
                    { name: 'fileName' },
                    { name: 'delay', value: 'picSendDelay' },
                ],
            },
            {
                objName: 'get',
                name: 'getData',
                loop: 'IDs',
                elements: [
                    { name: 'id', value: 'IDs' },
                    { name: 'text', type: 'text' },
                    { name: 'newline', value: 'newline_checkbox' },
                    { name: 'parse_mode', key: 0 },
                ],
            },
            {
                objName: 'httpRequest',
                name: 'httpRequest',
                loop: 'url',
                elements: [{ name: 'url' }, { name: 'user' }, { name: 'password' }, { name: 'filename' }],
            },
        ];
        const listOfSetStateIds = [];
        action.set.forEach(function ({ trigger, switch_checkbox, returnText, parse_mode, values, confirm, ack, IDs }, key) {
            const triggerName = trigger[0];
            if (key == 0) {
                userObject[triggerName] = { switch: [] };
            }
            userObject[triggerName] = { switch: [] };
            IDs.forEach(function (id, index) {
                listOfSetStateIds.push(id);
                const toggle = (0, utils_1.isTruthy)(switch_checkbox[index]);
                const newObj = {
                    id: IDs[index],
                    value: values[index],
                    toggle: toggle,
                    confirm: confirm[index],
                    returnText: returnText[index],
                    ack: ack ? ack[index] : 'false',
                    parse_mode: (0, utils_1.isTruthy)(parse_mode[0]),
                };
                if (Array.isArray(userObject[triggerName]?.switch)) {
                    userObject[triggerName].switch.push(newObj);
                }
            });
        });
        arrayOfEntries.forEach(item => {
            if (action[item.objName]) {
                action[item.objName].forEach(function (element, index) {
                    const trigger = element.trigger[0];
                    userObject[trigger] = { [item.name]: [] };
                    if (index == 0) {
                        userObject[trigger] = { [item.name]: [] };
                    }
                    element[item.loop].forEach(function (id, key) {
                        const newObj = {};
                        item.elements.forEach(({ name, value, key: elKey }) => {
                            const elName = (value ? value : name);
                            const newKey = elKey ? elKey : key;
                            const val = !element[elName] ? false : element[elName][newKey] || 'false';
                            if (name === 'parse_mode') {
                                newObj.parse_mode = (0, utils_1.isTruthy)(val);
                            }
                            if (typeof val === 'string') {
                                newObj[name] = val.replace(/&amp;/g, '&');
                            }
                        });
                        (userObject?.[trigger]?.[item.name]).push(newObj);
                    });
                });
            }
        });
        return { obj: userObject, ids: listOfSetStateIds };
    }
    catch (err) {
        (0, logging_1.errorLogger)('Error generateActions:', err, main_1.adapter);
    }
}
const adjustValueType = (value, valueType) => {
    if (valueType == 'number') {
        if (!parseFloat(value)) {
            main_1.adapter.log.error(`Error: Value is not a number: ${value}`);
            return false;
        }
        return parseFloat(value);
    }
    if (valueType == 'boolean') {
        if (value == 'true') {
            return true;
        }
        main_1.adapter.log.error(`Error: Value is not a boolean: ${value}`);
        return false;
    }
    return value;
};
exports.adjustValueType = adjustValueType;
const checkEvent = async (dataObject, id, state, menuData, userListWithChatID, instanceTelegram, resize_keyboard, one_time_keyboard, usersInGroup) => {
    const menuArray = [];
    let ok = false;
    let calledNav = '';
    Object.keys(dataObject.action).forEach(menu => {
        if (dataObject.action[menu]?.events) {
            dataObject.action[menu].events.forEach(event => {
                if (event.ID[0] == id && event.ack[0] == state.ack.toString()) {
                    if ((state.val == true || state.val == 'true') && event.condition == 'true') {
                        ok = true;
                        menuArray.push(menu);
                        calledNav = event.menu[0];
                    }
                    else if ((state.val == false || state.val == 'false') && event.condition[0] == 'false') {
                        ok = true;
                        menuArray.push(menu);
                        calledNav = event.menu[0];
                    }
                    else if (typeof state.val == 'number' && state.val == parseInt(event.condition[0])) {
                        ok = true;
                        menuArray.push(menu);
                        calledNav = event.menu[0];
                    }
                    else if (state.val == event.condition[0]) {
                        ok = true;
                        menuArray.push(menu);
                        calledNav = event.menu[0];
                    }
                }
            });
        }
    });
    if (ok) {
        if (menuArray.length >= 1) {
            for (const menu of menuArray) {
                if (usersInGroup[menu] && menuData[menu][calledNav]) {
                    for (const user of usersInGroup[menu]) {
                        const part = menuData[menu][calledNav];
                        const menus = Object.keys(menuData);
                        if (part.nav) {
                            (0, backMenu_1.backMenuFunc)({ startSide: calledNav, navigation: part.nav, userToSend: user });
                        }
                        if (part?.nav && part?.nav[0][0].includes('menu:')) {
                            await (0, subMenu_1.callSubMenu)(JSON.stringify(part?.nav[0]), menuData, user, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, part, menuData, menus, null, part.nav);
                        }
                        else {
                            await (0, sendNav_1.sendNav)(part, user, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard);
                        }
                    }
                }
            }
        }
    }
    return ok;
};
exports.checkEvent = checkEvent;
const getUserToSendFromUserListWithChatID = (userListWithChatID, chatID) => {
    let userToSend = null;
    for (const element of userListWithChatID) {
        if (element.chatID == chatID) {
            userToSend = element.name;
            break;
        }
    }
    return userToSend;
};
exports.getUserToSendFromUserListWithChatID = getUserToSendFromUserListWithChatID;
//# sourceMappingURL=action.js.map
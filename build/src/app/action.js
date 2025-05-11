"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adjustValueType = exports.bindingFunc = exports.idBySelector = exports.getUserToSendFromUserListWithChatID = exports.checkEvent = void 0;
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
const splitValues_1 = require("../lib/splitValues");
const bindingFunc = async (text, userToSend, telegramParams, parse_mode) => {
    let textToSend;
    try {
        const { substringExcludeSearch } = (0, string_1.decomposeText)(text, config_1.config.binding.start, config_1.config.binding.end);
        const arrayOfItems = substringExcludeSearch.split(config_1.config.binding.splitChar);
        const bindingObject = {
            values: {},
        };
        for (let item of arrayOfItems) {
            if (!item.includes('?')) {
                const { key, id } = (0, splitValues_1.getBindingValues)(item);
                if (id) {
                    const result = await main_1.adapter.getForeignStateAsync(id);
                    if (result) {
                        bindingObject.values[key] = result.val?.toString() ?? '';
                    }
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
            telegramParams,
            parse_mode,
        });
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error Binding function: ', e, main_1.adapter);
    }
};
exports.bindingFunc = bindingFunc;
const idBySelector = async ({ selector, text, userToSend, newline, telegramParams, }) => {
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
                telegramParams,
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
function generateActions({ action, userObject, }) {
    try {
        const listOfSetStateIds = [];
        action?.set.forEach(function ({ trigger, switch_checkbox, returnText, parse_mode, values, confirm, ack, IDs }, index) {
            const triggerName = trigger[0];
            if (index == 0) {
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
                    ack: (0, utils_1.isTruthy)(ack[index]),
                    parse_mode: (0, utils_1.isTruthy)(parse_mode[0]),
                };
                if (Array.isArray(userObject[triggerName]?.switch)) {
                    userObject[triggerName].switch.push(newObj);
                }
            });
        });
        config_1.arrayOfEntries.forEach(item => {
            const actions = action?.[item.objName];
            actions?.forEach(function (element, index) {
                const trigger = element.trigger[0];
                userObject[trigger] = { [item.name]: [] };
                if (index == 0) {
                    userObject[trigger] = { [item.name]: [] };
                }
                element[item.loop].forEach(function (id, index) {
                    const newObj = {};
                    item.elements.forEach(({ name, value, index: elIndex }) => {
                        const elName = (value ? value : name);
                        const newIndex = elIndex ? elIndex : index;
                        const val = !element[elName] ? false : element[elName][newIndex] || 'false';
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
        return (0, utils_1.isTruthy)(value);
    }
    return value;
};
exports.adjustValueType = adjustValueType;
const checkEvent = async (dataObject, id, state, menuData, telegramParams, usersInGroup) => {
    const menuArray = [];
    let ok = false;
    let calledNav = '';
    Object.keys(dataObject.action).forEach(menu => {
        if (dataObject.action[menu]?.events) {
            dataObject.action[menu].events.forEach(event => {
                if (event.ID[0] == id && event.ack[0] == state.ack.toString()) {
                    const condition = event.condition[0];
                    if (((state.val == true || state.val == 'true') && (0, utils_1.isTruthy)(condition)) ||
                        ((state.val == false || state.val == 'false') && (0, utils_1.isFalsy)(condition)) ||
                        (typeof state.val == 'number' && state.val == parseInt(condition)) ||
                        state.val == condition) {
                        ok = true;
                        menuArray.push(menu);
                        calledNav = event.menu[0];
                    }
                }
            });
        }
    });
    if (!ok || !menuArray.length) {
        return false;
    }
    for (const menu of menuArray) {
        const part = menuData[menu][calledNav];
        if (usersInGroup[menu] && part) {
            for (const user of usersInGroup[menu]) {
                const menus = Object.keys(menuData);
                if (part.nav) {
                    (0, backMenu_1.backMenuFunc)({ activePage: calledNav, navigation: part.nav, userToSend: user });
                }
                if (part?.nav?.[0][0].includes('menu:')) {
                    await (0, subMenu_1.callSubMenu)({
                        jsonStringNav: part.nav[0][0],
                        userToSend: user,
                        telegramParams: telegramParams,
                        part: part,
                        allMenusWithData: menuData,
                        menus: menus,
                    });
                    return true;
                }
                await (0, sendNav_1.sendNav)(part, user, telegramParams);
            }
        }
    }
    return true;
};
exports.checkEvent = checkEvent;
const getUserToSendFromUserListWithChatID = (userListWithChatID, chatID) => {
    for (const element of userListWithChatID) {
        if (element.chatID == chatID) {
            return element.name;
        }
    }
};
exports.getUserToSendFromUserListWithChatID = getUserToSendFromUserListWithChatID;
//# sourceMappingURL=action.js.map
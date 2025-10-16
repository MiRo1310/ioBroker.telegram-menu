"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserToSendFromUserListWithChatID = exports.handleEvent = exports.adjustValueType = exports.bindingFunc = void 0;
exports.generateActions = generateActions;
const string_1 = require("../lib/string");
const config_1 = require("../config/config");
const splitValues_1 = require("../lib/splitValues");
const math_1 = require("../lib/math");
const telegram_1 = require("../app/telegram");
const logging_1 = require("../app/logging");
const utils_1 = require("../lib/utils");
const backMenu_1 = require("../app/backMenu");
const subMenu_1 = require("../app/subMenu");
const sendNav_1 = require("../app/sendNav");
const bindingFunc = async (adapter, instance, text, userToSend, telegramParams, parse_mode) => {
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
                    const result = await adapter.getForeignStateAsync(id);
                    if (result) {
                        bindingObject.values[key] = result.val?.toString() ?? '';
                    }
                }
            }
            else {
                Object.keys(bindingObject.values).forEach(function (key) {
                    item = item.replace(key, bindingObject.values[key]);
                });
                const { val } = (0, math_1.evaluate)(item, adapter);
                textToSend = String(val);
            }
        }
        await (0, telegram_1.sendToTelegram)({
            instance,
            userToSend,
            textToSend,
            telegramParams,
            parse_mode,
        });
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error Binding function: ', e, adapter);
    }
};
exports.bindingFunc = bindingFunc;
function generateActions({ action, userObject, adapter, }) {
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
                    ack: ack?.length ? (0, utils_1.isTruthy)(ack[index]) : false,
                    parse_mode: parse_mode?.length ? (0, utils_1.isTruthy)(parse_mode?.[0]) : false,
                };
                if (Array.isArray(userObject?.[triggerName]?.switch)) {
                    userObject[triggerName].switch?.push(newObj);
                }
            });
        });
        config_1.arrayOfEntries.forEach(item => {
            const actions = action?.[item.objName];
            actions?.forEach(function (element, index) {
                const trigger = element?.trigger[0];
                userObject[trigger] = { [item.name]: [] };
                if (index == 0) {
                    userObject[trigger] = { [item.name]: [] };
                }
                element[item.loop].forEach(function (id, index) {
                    const newObj = {};
                    item.elements.forEach(({ name, value, index: elIndex }) => {
                        const elName = (value ? value : name);
                        const newIndex = elIndex ? elIndex : index;
                        const val = !element[elName] ? false : (element[elName][newIndex] ?? 'false');
                        if (name === 'parse_mode') {
                            newObj.parse_mode = (0, utils_1.isTruthy)(val);
                        }
                        if (typeof val === 'string') {
                            newObj[name] = String(val).replace(/&amp;/g, '&');
                        }
                    });
                    (userObject?.[trigger]?.[item.name]).push(newObj);
                });
            });
        });
        return { obj: userObject, ids: listOfSetStateIds };
    }
    catch (err) {
        (0, logging_1.errorLogger)('Error generateActions:', err, adapter);
    }
}
const adjustValueType = (adapter, value, valueType) => {
    if (valueType == 'number') {
        if (!parseFloat(value)) {
            adapter.log.error(`Error: Value is not a number: ${value}`);
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
const toBoolean = (value) => {
    if (value === 'true') {
        return true;
    }
    if (value === 'false') {
        return false;
    }
    return null;
};
const handleEvent = async (adapter, user, dataObject, id, state, menuData, telegramParams) => {
    const menuArray = [];
    let ok = false;
    let calledNav = '';
    const action = dataObject.action;
    if (!action) {
        return false;
    }
    Object.keys(action).forEach(menu => {
        if (action?.[menu]?.events) {
            action[menu]?.events.forEach(event => {
                if (event.ID[0] == id && event.ack[0] == state.ack.toString()) {
                    const condition = event.condition[0];
                    const bool = toBoolean(condition);
                    if (bool
                        ? state.val === bool
                        : (typeof state.val == 'number' &&
                            (state.val == parseInt(condition) || state.val == parseFloat(condition))) ||
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
        const menus = Object.keys(menuData);
        if (part.nav) {
            (0, backMenu_1.backMenuFunc)({ activePage: calledNav, navigation: part.nav, userToSend: user.name });
        }
        if (part?.nav?.[0][0].includes('menu:')) {
            await (0, subMenu_1.callSubMenu)({
                adapter,
                instance: user.instance,
                jsonStringNav: part.nav[0][0],
                userToSend: user.name,
                telegramParams: telegramParams,
                part,
                allMenusWithData: menuData,
                menus,
            });
            return true;
        }
        await (0, sendNav_1.sendNav)(adapter, user.instance, part, user.name, telegramParams);
    }
    return true;
};
exports.handleEvent = handleEvent;
const getUserToSendFromUserListWithChatID = (userListWithChatID, chatID) => {
    for (const element of userListWithChatID) {
        if (element.chatID == chatID) {
            return element;
        }
    }
};
exports.getUserToSendFromUserListWithChatID = getUserToSendFromUserListWithChatID;
//# sourceMappingURL=action.js.map
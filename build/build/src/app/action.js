"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMenusWithUserToSend = exports.getUserToSendFromUserListWithChatID = exports.checkEvent = exports.adjustValueType = exports.exchangePlaceholderWithValue = exports.bindingFunc = exports.idBySelector = void 0;
exports.editArrayButtons = editArrayButtons;
exports.generateNewObjectStructure = generateNewObjectStructure;
exports.generateActions = generateActions;
exports.calcValue = calcValue;
exports.roundValue = roundValue;
const telegram_js_1 = require("./telegram.js");
const global_1 = require("./global");
const subMenu_js_1 = require("./subMenu.js");
const sendNav_js_1 = require("./sendNav.js");
const backMenu_js_1 = require("./backMenu.js");
const logging_js_1 = require("./logging.js");
const main_js_1 = require("../main.js");
const bindingFunc = async (text, userToSend, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, parse_mode) => {
    let value;
    try {
        const substring = (0, global_1.decomposeText)(text, 'binding:', '}').substring;
        const arrayOfItems = substring.replace('binding:{', '').replace('}', '').split(';');
        const bindingObject = {
            values: {},
        };
        for (let item of arrayOfItems) {
            if (!item.includes('?')) {
                const key = item.split(':')[0];
                const id = item.split(':')[1];
                const result = await main_js_1._this.getForeignStateAsync(id);
                if (result) {
                    bindingObject.values[key] = result.val?.toString() || '';
                }
            }
            else {
                Object.keys(bindingObject.values).forEach(function (key) {
                    item = item.replace(key, bindingObject.values[key]);
                });
                value = eval(item);
            }
        }
        await (0, telegram_js_1.sendToTelegram)({
            user: userToSend,
            textToSend: value,
            keyboard: undefined,
            instance: telegramInstance,
            resize_keyboard: one_time_keyboard,
            one_time_keyboard: resize_keyboard,
            userListWithChatID: userListWithChatID,
            parse_mode: parse_mode,
        });
    }
    catch (e) {
        (0, logging_js_1.errorLogger)('Error Binding function: ', e);
    }
};
exports.bindingFunc = bindingFunc;
function calcValue(textToSend, val) {
    const { substring } = (0, global_1.decomposeText)(textToSend, '{math:', '}');
    const mathValue = substring.replace('{math:', '').replace('}', '');
    try {
        val = eval(val + mathValue);
        textToSend = textToSend.replace(substring, '');
        return { textToSend: textToSend, val: val };
    }
    catch (e) {
        (0, logging_js_1.errorLogger)('Error Eval:', e);
    }
}
function checkValueForOneLine(text) {
    if (!text.includes('&&')) {
        return `${text}&&`;
    }
    return text;
}
function editArrayButtons(val) {
    const newVal = [];
    try {
        val.forEach(element => {
            let value = '';
            if (typeof element.value === 'string') {
                value = checkValueForOneLine(element.value);
            }
            let array = [];
            if (value.indexOf('&&') != -1) {
                array = value.split('&&');
            }
            if (array.length > 1) {
                array.forEach(function (element, index) {
                    if (typeof element === 'string') {
                        let navArray = element.split(',');
                        navArray = navArray.map(item => item.trim());
                        array[index] = navArray;
                    }
                });
            }
            else if (typeof element.value === 'string') {
                array = element.value.split(',');
                array.forEach(function (element, index) {
                    array[index] = [element.trim()];
                });
            }
            newVal.push({ call: element.call, text: element.text, parse_mode: element.parse_mode, nav: array });
        });
        return newVal;
    }
    catch (err) {
        (0, logging_js_1.errorLogger)('Error EditArray:', err);
        return null;
    }
}
const idBySelector = async (selector, text, userToSend, newline, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID) => {
    let text2Send = '';
    try {
        if (!selector.includes('functions')) {
            return;
        }
        const functions = selector.replace('functions=', '');
        let enums = [];
        const result = await main_js_1._this.getEnumsAsync();
        if (!result || !result['enum.functions'][`enum.functions.${functions}`]) {
            return;
        }
        enums = result['enum.functions'][`enum.functions.${functions}`].common.members;
        if (!enums) {
            return;
        }
        const promises = enums.map(async (id) => {
            const value = await main_js_1._this.getForeignStateAsync(id);
            if (value && value.val !== undefined && value.val !== null) {
                let newText = text;
                let res;
                if (text.includes('{common.name}')) {
                    res = await main_js_1._this.getForeignObjectAsync(id);
                    main_js_1._this.log.debug(`Name ${JSON.stringify(res?.common.name)}`);
                    if (res && res.common.name) {
                        newText = newText.replace('{common.name}', res.common.name);
                    }
                }
                if (text.includes('&amp;&amp;')) {
                    text2Send += newText.replace('&amp;&amp;', value.val);
                }
                else if (text.includes('&&')) {
                    text2Send += newText.replace('&&', value.val);
                }
                else {
                    text2Send += newText;
                    text2Send += ` ${value.val}`;
                }
            }
            if (newline === 'true') {
                text2Send += ' \n';
            }
            else {
                text2Send += ' ';
            }
            main_js_1._this.log.debug(`text2send ${JSON.stringify(text2Send)}`);
        });
        Promise.all(promises)
            .then(() => {
            (0, telegram_js_1.sendToTelegram)({
                user: userToSend,
                textToSend: text2Send,
                keyboard: undefined,
                instance: telegramInstance,
                resize_keyboard: one_time_keyboard,
                one_time_keyboard: resize_keyboard,
                userListWithChatID: userListWithChatID,
                parse_mode: 'false',
            }).catch(e => {
                (0, logging_js_1.errorLogger)('Error SendToTelegram:', e);
            });
            main_js_1._this.log.debug(`TextToSend: ${text2Send}`);
            main_js_1._this.log.debug(`UserToSend: ${userToSend}`);
        })
            .catch(e => {
            (0, logging_js_1.errorLogger)('Error Promise:', e);
        });
    }
    catch (error) {
        error([
            { text: 'Error idBySelector:', val: error.message },
            { text: 'Stack:', val: error.stack },
        ]);
    }
};
exports.idBySelector = idBySelector;
function generateNewObjectStructure(val) {
    try {
        if (!val) {
            return null;
        }
        const obj = {};
        val.forEach(function (element) {
            const call = element.call;
            obj[call] = {
                nav: element.nav,
                text: element.text,
                parse_mode: element.parse_mode == 'true' || element.parse_mode == 'false' ? element.parse_mode : 'false',
            };
        });
        return obj;
    }
    catch (err) {
        (0, logging_js_1.errorLogger)('Error GenerateNewObjectStructure:', err);
        return null;
    }
}
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
        action.set.forEach(function (element, key) {
            if (key == 0) {
                userObject[element.trigger[0]] = { switch: [] };
            }
            userObject[element.trigger[0]] = { switch: [] };
            element.IDs.forEach(function (id, index) {
                listOfSetStateIds.push(id);
                const toggle = element.switch_checkbox[index] === 'true';
                let value;
                if (element.values[index] === 'true' || element.values[index] === 'false') {
                    value = element.values[index] === 'true';
                }
                else {
                    value = element.values[index];
                }
                const newObj = {
                    id: element.IDs[index],
                    value: value.toString(),
                    toggle: toggle,
                    confirm: element.confirm[index],
                    returnText: element.returnText[index],
                    ack: element.ack ? element.ack[index] : 'false',
                    parse_mode: element.parse_mode ? element.parse_mode[0] : 'false',
                };
                if (userObject[element.trigger[0]] && userObject[element.trigger[0]]?.switch) {
                    userObject[element.trigger[0]].switch.push(newObj);
                }
            });
        });
        arrayOfEntries.forEach(item => {
            if (action[item.objName]) {
                action[item.objName].forEach(function (element, index) {
                    userObject[element.trigger[0]] = { [item.name]: [] };
                    if (index == 0) {
                        userObject[element.trigger[0]] = { [item.name]: [] };
                    }
                    element[item.loop].forEach(function (id, key) {
                        const newObj = {};
                        item.elements.forEach(elementItem => {
                            const name = elementItem.name;
                            const value = elementItem.value ? elementItem.value : elementItem.name;
                            const newKey = elementItem.key ? elementItem.key : key;
                            let val;
                            if (!element[value]) {
                                val = false;
                            }
                            else {
                                val = element[value][newKey] || 'false';
                            }
                            if (elementItem.type == 'text' && typeof val === 'string') {
                                newObj[name] = val.replace(/&amp;/g, '&');
                            }
                            else {
                                newObj[name] = val;
                            }
                        });
                        if (item.name && typeof item.name === 'string') {
                            userObject[element.trigger][item?.name].push(newObj);
                        }
                    });
                });
            }
        });
        return { obj: userObject, ids: listOfSetStateIds };
    }
    catch (err) {
        (0, logging_js_1.errorLogger)('Error generateActions:', err);
    }
}
function roundValue(val, textToSend) {
    try {
        const floatedNumber = parseFloat(val);
        const { substring, textWithoutSubstring } = (0, global_1.decomposeText)(textToSend, '{round:', '}');
        const decimalPlaces = substring.split(':')[1].replace('}', '');
        const floatedString = floatedNumber.toFixed(parseInt(decimalPlaces));
        return { val: floatedString, textToSend: textWithoutSubstring };
    }
    catch (err) {
        (0, logging_js_1.errorLogger)('Error roundValue:', err);
    }
}
const exchangePlaceholderWithValue = (textToSend, text) => {
    let searchString = '';
    if (textToSend.includes('&&')) {
        searchString = '&&';
    }
    else if (textToSend.includes('&amp;&amp;')) {
        searchString = '&amp;&amp;';
    }
    searchString !== '' && textToSend.toString().indexOf(searchString) != -1
        ? (textToSend = textToSend.replace(searchString, text.toString()))
        : (textToSend += ` ${text}`);
    return textToSend;
};
exports.exchangePlaceholderWithValue = exchangePlaceholderWithValue;
const adjustValueType = (value, valueType) => {
    if (valueType == 'number') {
        if (!parseFloat(value)) {
            main_js_1._this.log.error(`Error: Value is not a number: ${value}`);
            return false;
        }
        return parseFloat(value);
    }
    if (valueType == 'boolean') {
        if (value == 'true') {
            return true;
        }
        main_js_1._this.log.error(`Error: Value is not a boolean: ${value}`);
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
        if (dataObject.action[menu] && dataObject.action[menu].events) {
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
                if (usersInGroup[menu] && menuData.data[menu][calledNav]) {
                    for (const user of usersInGroup[menu]) {
                        const part = menuData.data[menu][calledNav];
                        const menus = Object.keys(menuData.data);
                        if (part.nav) {
                            (0, backMenu_js_1.backMenuFunc)(calledNav, part.nav, user);
                        }
                        if (part?.nav && part?.nav[0][0].includes('menu:')) {
                            await (0, subMenu_js_1.callSubMenu)(JSON.stringify(part?.nav[0]), menuData, user, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, part, menuData.data, menus, null, part.nav);
                        }
                        else {
                            await (0, sendNav_js_1.sendNav)(part, user, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard);
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
const getMenusWithUserToSend = (menusWithUsers, userToSend) => {
    const menus = [];
    for (const key in menusWithUsers) {
        if (menusWithUsers[key].includes(userToSend)) {
            menus.push(key);
        }
    }
    return menus;
};
exports.getMenusWithUserToSend = getMenusWithUserToSend;

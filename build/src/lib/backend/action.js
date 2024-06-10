"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMenusWithUserToSend = exports.getUserToSendFromUserListWithChatID = exports.checkEvent = exports.adjustValueType = exports.insertValueInPosition = exports.bindingFunc = exports.roundValue = exports.calcValue = exports.generateActions = exports.generateNewObjectStructure = exports.idBySelector = exports.editArrayButtons = void 0;
const telegram_js_1 = require("./telegram.js");
const global_1 = require("./global");
const subMenu_js_1 = require("./subMenu.js");
const sendNav_js_1 = require("./sendNav.js");
const backMenu_js_1 = require("./backMenu.js");
const logging_js_1 = require("./logging.js");
const main_1 = __importDefault(require("../../main"));
const bindingFunc = async (text, userToSend, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, parse_mode) => {
    const _this = main_1.default.getInstance();
    let value;
    try {
        const substring = (0, global_1.decomposeText)(text, "binding:", "}").substring;
        const arrayOfItems = substring.replace("binding:{", "").replace("}", "").split(";");
        const bindingObject = {
            values: {},
        };
        for (let item of arrayOfItems) {
            if (!item.includes("?")) {
                const key = item.split(":")[0];
                const id = item.split(":")[1];
                const result = await _this.getForeignStateAsync(id);
                if (result) {
                    bindingObject.values[key] = result.val?.toString() || "";
                }
            }
            else {
                Object.keys(bindingObject.values).forEach(function (key) {
                    item = item.replace(key, bindingObject.values[key]);
                });
                value = eval(item);
            }
        }
        (0, telegram_js_1.sendToTelegram)(userToSend, value, undefined, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, parse_mode);
    }
    catch (e) {
        (0, logging_js_1.error)([
            { text: "Error:", val: e.message },
            { text: "Stack:", val: e.stack },
        ]);
    }
};
exports.bindingFunc = bindingFunc;
function calcValue(_this, textToSend, val) {
    const startindex = textToSend.indexOf("{math");
    const endindex = textToSend.indexOf("}", startindex);
    const substring = textToSend.substring(startindex, endindex + 1);
    const mathValue = substring.replace("{math:", "").replace("}", "");
    try {
        val = eval(val + mathValue);
        textToSend = textToSend.replace(substring, "");
        return { textToSend: textToSend, val: val };
    }
    catch (e) {
        (0, logging_js_1.error)([
            { text: "Error Eval:", val: e.message },
            { text: "Stack:", val: e.stack },
        ]);
    }
}
exports.calcValue = calcValue;
function checkValueForOneLine(text) {
    if (!text.includes("&&")) {
        return text + "&&";
    }
    return text;
}
async function editArrayButtons(val, _this) {
    const newVal = [];
    try {
        val.forEach((element) => {
            let value = "";
            if (typeof element.value === "string") {
                value = checkValueForOneLine(element.value);
            }
            let array = [];
            if (value.indexOf("&&") != -1) {
                array = value.split("&&");
            }
            if (array.length > 1) {
                array.forEach(function (element, index) {
                    if (typeof element === "string") {
                        let navArray = element.split(",");
                        navArray = navArray.map((item) => item.trim());
                        array[index] = navArray;
                    }
                });
            }
            else if (typeof element.value === "string") {
                array = element.value.split(",");
                array.forEach(function (element, index) {
                    array[index] = [element.trim()];
                });
            }
            newVal.push({ call: element.call, text: element.text, parse_mode: element.parse_mode, nav: array });
        });
        return newVal;
    }
    catch (err) {
        (0, logging_js_1.error)([
            { text: "Error EditArray:", val: err.message },
            { text: "Stack:", val: err.stack },
        ]);
        return null;
    }
}
exports.editArrayButtons = editArrayButtons;
const idBySelector = async (_this, selector, text, userToSend, newline, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID) => {
    let text2Send = "";
    try {
        if (!selector.includes("functions")) {
            return;
        }
        const functions = selector.replace("functions=", "");
        let enums = [];
        const result = await _this.getEnumsAsync();
        if (!result || !result["enum.functions"][`enum.functions.${functions}`]) {
            return;
        }
        enums = result["enum.functions"][`enum.functions.${functions}`].common.members;
        if (!enums) {
            return;
        }
        const promises = enums.map(async (id) => {
            const value = await _this.getForeignStateAsync(id);
            if (value && value.val) {
                let newText = text;
                let name;
                if (text.includes("{common.name}")) {
                    name = await _this.getForeignObjectAsync(id);
                    _this.log.debug("Name " + JSON.stringify(name));
                    if (name && name.common.name) {
                        newText = newText.replace("{common.name}", name.common.name);
                    }
                }
                if (text.includes("&amp;&amp;")) {
                    text2Send += newText.replace("&amp;&amp;", value.val);
                }
                else {
                    text2Send += newText;
                    text2Send += " " + value.val;
                }
            }
            if (newline === "true") {
                text2Send += "\n";
            }
            else {
                text2Send += " ";
            }
            _this.log.debug("text2send " + JSON.stringify(text2Send));
        });
        Promise.all(promises)
            .then(() => {
            (0, logging_js_1.debug)([{ text: "TextToSend:", val: text2Send }, { text: "UserToSend:", val: userToSend }]);
            (0, telegram_js_1.sendToTelegram)(userToSend, text, undefined, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, "");
        })
            .catch((e) => {
            (0, logging_js_1.error)([{ text: "Error Promise:", val: e.message }, { text: "Stack:", val: e.stack }]);
        });
    }
    catch (error) {
        error([
            { text: "Error idBySelector:", val: error.message },
            { text: "Stack:", val: error.stack },
        ]);
    }
};
exports.idBySelector = idBySelector;
async function generateNewObjectStructure(val) {
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
                parse_mode: element.parse_mode == "true" || element.parse_mode == "false" ? element.parse_mode : "false",
            };
        });
        return obj;
    }
    catch (err) {
        (0, logging_js_1.error)([
            { text: "Error GenerateNewObjectStructure:", val: err.message },
            { text: "Stack:", val: err.stack },
        ]);
        return null;
    }
}
exports.generateNewObjectStructure = generateNewObjectStructure;
function generateActions(action, userObject) {
    try {
        const arrayOfEntries = [
            {
                objName: "echarts",
                name: "echarts",
                loop: "preset",
                elements: [{ name: "preset" }, { name: "echartInstance" }, { name: "background" }, { name: "theme" }, { name: "filename" }],
            },
            {
                objName: "loc",
                name: "location",
                loop: "latitude",
                elements: [{ name: "latitude" }, { name: "longitude" }, { name: "parse_mode", key: 0 }],
            },
            {
                objName: "pic",
                name: "sendPic",
                loop: "IDs",
                elements: [{ name: "id", value: "IDs" }, { name: "fileName" }, { name: "delay", value: "picSendDelay" }],
            },
            {
                objName: "get",
                name: "getData",
                loop: "IDs",
                elements: [
                    { name: "id", value: "IDs" },
                    { name: "text", type: "text" },
                    { name: "newline", value: "newline_checkbox" },
                    { name: "parse_mode", key: 0 },
                ],
            },
            {
                objName: "httpRequest",
                name: "httpRequest",
                loop: "url",
                elements: [{ name: "url" }, { name: "user" }, { name: "password" }, { name: "filename" }],
            },
        ];
        const listOfSetStateIds = [];
        action.set.forEach(function (element, key) {
            if (key == 0) {
                userObject[element.trigger] = { switch: [] };
            }
            userObject[element.trigger] = { switch: [] };
            element.IDs.forEach(function (id, index) {
                // Liste zum überwachen der Ids
                listOfSetStateIds.push(id);
                const toggle = element.switch_checkbox[index] === "true";
                let value;
                // Aus true oder false einen boolean machen
                if (element.values[index] === "true" || element.values[index] === "false") {
                    value = element.values[index] === "true";
                }
                else {
                    value = element.values[index];
                }
                const newObj = {
                    id: element.IDs[index],
                    value: value,
                    toggle: toggle,
                    confirm: element.confirm[index],
                    returnText: element.returnText[index],
                    ack: element.ack ? element.ack[index] : false,
                    parse_mode: element.parse_mode ? element.parse_mode[0] : false,
                };
                if (userObject[element.trigger] && userObject[element.trigger]?.switch) {
                    userObject[element.trigger].switch.push(newObj);
                }
            });
        });
        arrayOfEntries.forEach((item) => {
            if (action[item.objName]) {
                action[item.objName].forEach(function (element, index) {
                    userObject[element.trigger] = { [item.name]: [] };
                    if (index == 0) {
                        userObject[element.trigger] = { [item.name]: [] };
                    }
                    element[item.loop].forEach(function (id, key) {
                        const newObj = {};
                        item.elements.forEach((elementItem) => {
                            const name = elementItem.name;
                            const value = elementItem.value ? elementItem.value : elementItem.name;
                            const newKey = elementItem.key ? elementItem.key : key;
                            let val;
                            if (!element[value]) {
                                val = false;
                            }
                            else {
                                val = element[value][newKey];
                            }
                            if (val == undefined) {
                                val = "false";
                            }
                            if (elementItem.type == "text" && typeof val === "string") {
                                newObj[name] = val.replace(/&amp;/g, "&");
                            }
                            else {
                                newObj[name] = val;
                            }
                        });
                        if (item.name && typeof item.name === "string") {
                            userObject[element.trigger][item?.name].push(newObj);
                        }
                    });
                });
            }
        });
        return { obj: userObject, ids: listOfSetStateIds };
    }
    catch (err) {
        (0, logging_js_1.error)([
            { text: "Error generateActions:", val: err.message },
            { text: "Stack:", val: err.stack },
        ]);
    }
}
exports.generateActions = generateActions;
function roundValue(val, textToSend) {
    try {
        const floatedNumber = parseFloat(val);
        const result = (0, global_1.decomposeText)(textToSend, "{round:", "}");
        const substring = result.substring;
        const decimalPlaces = substring.split(":")[1].replace("}", "");
        const floatedString = floatedNumber.toFixed(parseInt(decimalPlaces));
        return { val: floatedString, textToSend: result.textWithoutSubstring };
    }
    catch (err) {
        (0, logging_js_1.error)([
            { text: "Error roundValue:", val: err.message },
            { text: "Stack:", val: err.stack },
        ]);
    }
}
exports.roundValue = roundValue;
const insertValueInPosition = (textToSend, text) => {
    let searchString = "";
    if (textToSend.includes("&&")) {
        searchString = "&&";
    }
    searchString = "&amp;&amp;";
    textToSend.toString().indexOf(searchString) != -1 ? (textToSend = textToSend.replace(searchString, text.toString())) : (textToSend += " " + text);
    return textToSend;
};
exports.insertValueInPosition = insertValueInPosition;
const adjustValueType = (value, valueType) => {
    if (valueType == "number") {
        if (!parseFloat(value)) {
            (0, logging_js_1.error)([{ text: "Error: Value is not a number:", val: value }]);
            return false;
        }
        else {
            return parseFloat(value);
        }
    }
    else if (valueType == "boolean") {
        if (value == "true") {
            return true;
        }
        else if (value == "false") {
            return false;
        }
        (0, logging_js_1.error)([{ text: "Error: Value is not a boolean:", val: value }]);
        return false;
    }
    else {
        return value;
    }
};
exports.adjustValueType = adjustValueType;
const checkEvent = (dataObject, id, state, menuData, userListWithChatID, instanceTelegram, resize_keyboard, one_time_keyboard, usersInGroup) => {
    const menuArray = [];
    let ok = false;
    let calledNav = "";
    Object.keys(dataObject.action).forEach((menu) => {
        if (dataObject.action[menu] && dataObject.action[menu]["events"]) {
            dataObject.action[menu]["events"].forEach((event) => {
                if (event.ID[0] == id && event.ack[0] == state.ack.toString()) {
                    if ((state.val == true || state.val == "true") && event.condition == "true") {
                        ok = true;
                        menuArray.push(menu);
                        calledNav = event.menu[0];
                    }
                    else if ((state.val == false || state.val == "false") && event.condition[0] == "false") {
                        ok = true;
                        menuArray.push(menu);
                        calledNav = event.menu[0];
                    }
                    else if (typeof state.val == "number" && state.val == parseInt(event.condition[0])) {
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
            menuArray.forEach((menu) => {
                if (usersInGroup[menu] && menuData.data[menu][calledNav]) {
                    usersInGroup[menu].forEach((user) => {
                        const part = menuData.data[menu][calledNav];
                        const menus = Object.keys(menuData.data);
                        if (part.nav) {
                            (0, backMenu_js_1.backMenuFunc)(calledNav, part.nav, user);
                        }
                        if (part && part.nav && JSON.stringify(part?.nav[0]).includes("menu:")) {
                            (0, subMenu_js_1.callSubMenu)(JSON.stringify(part?.nav[0]), menuData, user, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, part, menuData.data, menus, null);
                        }
                        else {
                            (0, sendNav_js_1.sendNav)(part, user, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard);
                        }
                    });
                }
            });
        }
    }
    return ok;
};
exports.checkEvent = checkEvent;
const getUserToSendFromUserListWithChatID = (userListWithChatID, chatID) => {
    let userToSend = null;
    if (!chatID) {
        return null;
    }
    userListWithChatID.forEach((element) => {
        if (element.chatID == chatID.val) {
            userToSend = element.name;
        }
        (0, logging_js_1.debug)([
            { text: "User and ChatID:", val: element },
            { text: "User:", val: userToSend },
        ]);
    });
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
//# sourceMappingURL=action.js.map
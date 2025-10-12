"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstanceById = exports.getStartSides = exports.timeStringReplacer = exports.getTypeofTimestamp = exports.getParseMode = exports.getListOfMenusIncludingUser = exports.checkOneLineValue = void 0;
exports.calcValue = calcValue;
exports.roundValue = roundValue;
exports.statusIdAndParams = statusIdAndParams;
exports.isStartside = isStartside;
exports.splitNavigation = splitNavigation;
exports.getNewStructure = getNewStructure;
exports.isSameType = isSameType;
const config_1 = require("../config/config");
const string_1 = require("../lib/string");
const math_1 = require("../lib/math");
const utils_1 = require("../lib/utils");
const object_1 = require("../lib/object");
const checkOneLineValue = (text) => !text.includes(config_1.config.rowSplitter) ? `${text} ${config_1.config.rowSplitter}` : text;
exports.checkOneLineValue = checkOneLineValue;
function calcValue(textToSend, val, adapter) {
    const { substringExcludeSearch, textExcludeSubstring } = (0, string_1.decomposeText)(textToSend, config_1.config.math.start, config_1.config.math.end);
    const { val: evalVal, error } = (0, math_1.evaluate)([val, substringExcludeSearch], adapter);
    return error
        ? { textToSend: textExcludeSubstring, calculated: val, error }
        : { textToSend: textExcludeSubstring, calculated: evalVal, error };
}
function roundValue(val, textToSend) {
    const floatVal = parseFloat(val);
    const { textExcludeSubstring, substringExcludeSearch: decimalPlaces } = (0, string_1.decomposeText)(textToSend, config_1.config.round.start, config_1.config.round.end);
    const decimalPlacesNum = parseInt(decimalPlaces);
    if (isNaN(floatVal)) {
        return { roundedValue: 'NaN', text: textExcludeSubstring, error: true };
    }
    if (isNaN(decimalPlacesNum)) {
        return { roundedValue: val, text: textExcludeSubstring, error: true };
    }
    return { roundedValue: floatVal.toFixed(decimalPlacesNum), text: textExcludeSubstring, error: false };
}
const getListOfMenusIncludingUser = (menusWithUsers, userToSend) => {
    const menus = [];
    for (const key in menusWithUsers) {
        if (menusWithUsers[key]?.some(item => item.name === userToSend)) {
            menus.push(key);
        }
    }
    return menus;
};
exports.getListOfMenusIncludingUser = getListOfMenusIncludingUser;
const getParseMode = (val = false) => (val ? 'HTML' : 'Markdown');
exports.getParseMode = getParseMode;
const getTypeofTimestamp = (val) => (val.includes('lc') ? 'lc' : 'ts');
exports.getTypeofTimestamp = getTypeofTimestamp;
const timeStringReplacer = ({ d, h, m, ms, y, s, mo }, string) => {
    if (string) {
        string = string
            .replace('sss', ms)
            .replace('ss', s)
            .replace('mm', m)
            .replace('hh', h)
            .replace('DD', d)
            .replace('MM', mo)
            .replace('YYYY', y)
            .replace('YY', y.slice(-2))
            .replace('(', '')
            .replace(')', '');
    }
    return string;
};
exports.timeStringReplacer = timeStringReplacer;
function statusIdAndParams(substringExcludeSearch) {
    const splitArray = substringExcludeSearch.split(':');
    const firstEl = splitArray[0];
    const secondEl = splitArray[1] ?? '';
    const thirdEl = splitArray[2] ?? '';
    return substringExcludeSearch.includes(config_1.config.status.oldWithId)
        ? {
            id: (0, string_1.removeQuotes)(secondEl), //'id':'ID':true
            shouldChangeByStatusParameter: (0, utils_1.isTruthy)((0, string_1.removeQuotes)(thirdEl)),
        }
        : {
            id: (0, string_1.removeQuotes)(firstEl), //'ID':true
            shouldChangeByStatusParameter: (0, utils_1.isTruthy)((0, string_1.removeQuotes)(secondEl)),
        };
}
function isStartside(startSide) {
    return startSide != '-' && startSide != '';
}
function splitNavigation(rows) {
    const generatedNavigation = [];
    rows.forEach(({ value, text, parse_mode, call }) => {
        const nav = [];
        (0, exports.checkOneLineValue)(value)
            .split(config_1.config.rowSplitter)
            .forEach(function (el, index) {
            nav[index] = (0, object_1.trimAllItems)(el.split(','));
        });
        generatedNavigation.push({ call, text, parse_mode: (0, utils_1.isTruthy)(parse_mode), nav });
    });
    return generatedNavigation;
}
function getNewStructure(val) {
    const obj = {};
    val.forEach(function ({ nav, text, parse_mode, call }) {
        obj[call] = { nav, text, parse_mode };
    });
    return obj;
}
const getStartSides = (menusWithUsers, dataObject) => {
    const startSides = {};
    Object.keys(menusWithUsers).forEach(element => {
        startSides[element] = dataObject.nav[element][0].call;
    });
    return startSides;
};
exports.getStartSides = getStartSides;
function isSameType(receivedType, obj) {
    return receivedType === obj.common.type;
}
const getInstanceById = (id) => {
    const obj = id.split('.');
    return { instanceName: obj[0], instanceNumber: obj[1], instance: obj.slice(0, 2).join('.') };
};
exports.getInstanceById = getInstanceById;
//# sourceMappingURL=appUtils.js.map
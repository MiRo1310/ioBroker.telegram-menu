"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeStringReplacer = exports.getTypeofTimestamp = exports.getParseMode = exports.getListOfMenusIncludingUser = exports.checkOneLineValue = void 0;
exports.calcValue = calcValue;
exports.roundValue = roundValue;
const config_1 = require("../config/config");
const string_1 = require("./string");
const math_1 = require("./math");
const checkOneLineValue = (text) => !text.includes(config_1.config.rowSplitter) ? `${text} ${config_1.config.rowSplitter}` : text;
exports.checkOneLineValue = checkOneLineValue;
function calcValue(textToSend, val, adapter) {
    const { substringExcludeSearch, textExcludeSubstring } = (0, string_1.decomposeText)(textToSend, config_1.config.math.start, config_1.config.math.end);
    const { val: evalVal, error } = (0, math_1.evaluate)([val, substringExcludeSearch], adapter);
    return error
        ? { textToSend: textExcludeSubstring, val, error }
        : { textToSend: textExcludeSubstring, val: evalVal, error };
}
function roundValue(val, textToSend) {
    const floatVal = parseFloat(val);
    const { textExcludeSubstring, substringExcludeSearch: decimalPlaces } = (0, string_1.decomposeText)(textToSend, config_1.config.round.start, config_1.config.round.end);
    const decimalPlacesNum = parseInt(decimalPlaces);
    if (isNaN(floatVal)) {
        return { val: 'NaN', textToSend: textExcludeSubstring, error: true };
    }
    if (isNaN(decimalPlacesNum)) {
        return { val, textToSend: textExcludeSubstring, error: true };
    }
    return { val: floatVal.toFixed(decimalPlacesNum), textToSend: textExcludeSubstring, error: false };
}
const getListOfMenusIncludingUser = (menusWithUsers, userToSend) => {
    const menus = [];
    for (const key in menusWithUsers) {
        if (menusWithUsers[key].includes(userToSend)) {
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
//# sourceMappingURL=appUtils.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMenusWithUser = exports.checkOneLineValue = void 0;
exports.calcValue = calcValue;
exports.roundValue = roundValue;
const config_1 = require("../config/config");
const string_1 = require("./string");
const logging_1 = require("../app/logging");
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
function roundValue(val, textToSend, adapter) {
    try {
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
    catch (err) {
        (0, logging_1.errorLogger)('Error roundValue:', err, adapter);
        return { val, textToSend, error: true };
    }
}
const getMenusWithUser = (menusWithUsers, userToSend) => {
    const menus = [];
    for (const key in menusWithUsers) {
        if (menusWithUsers[key].includes(userToSend)) {
            menus.push(key);
        }
    }
    return menus;
};
exports.getMenusWithUser = getMenusWithUser;
//# sourceMappingURL=appUtils.js.map
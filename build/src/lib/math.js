"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluate = evaluate;
exports.calcValue = calcValue;
const logging_1 = require("../app/logging");
const string_1 = require("./string");
const config_1 = require("../config/config");
function evaluate(val, adapter) {
    try {
        return { val: eval(val.join(' ')) ?? '', error: false };
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error Eval:', e, adapter);
        return { val: '', error: true };
    }
}
function calcValue(textToSend, val, adapter) {
    const { substringExcludedSearch, textWithoutSubstring } = (0, string_1.decomposeText)(textToSend, config_1.config.math.start, config_1.config.math.end);
    const { val: evalVal, error } = evaluate([val, substringExcludedSearch], adapter);
    return error
        ? { textToSend: textWithoutSubstring, val, error }
        : { textToSend: textWithoutSubstring, val: evalVal, error };
}
//# sourceMappingURL=math.js.map
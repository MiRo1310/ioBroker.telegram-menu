"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlaceholderValue = exports.exchangePlaceholderWithValue = exports.exchangeValue = exports.isNoValueParameter = void 0;
const config_1 = require("../config/config");
const string_1 = require("./string");
function isNoValueParameter(textToSend) {
    let insertValue = true;
    if (textToSend.includes('{novalue}')) {
        textToSend = (0, string_1.removeMultiSpaces)(textToSend.replace('{novalue}', ''));
        insertValue = false;
    }
    return { insertValue, textToSend };
}
exports.isNoValueParameter = isNoValueParameter;
const exchangeValue = (adapter, textToSend, val, shouldChange = true) => {
    const result = isNoValueParameter(textToSend);
    textToSend = result.textToSend;
    if (textToSend.includes(config_1.config.change.start) && shouldChange) {
        const { start, end, command } = config_1.config.change;
        const { substring, textExcludeSubstring } = (0, string_1.decomposeText)(textToSend, start, end); // change{"true":"an","false":"aus"}
        const stringExcludedChange = (0, string_1.replaceAll)(substring, "'", '"').replace(command, ''); // {"true":"an","false":"aus"}
        const { json, isValidJson } = (0, string_1.parseJSON)(stringExcludedChange);
        if (isValidJson) {
            const newValue = json[String(val)] ?? val;
            return {
                newValue,
                textToSend: (0, string_1.removeMultiSpaces)(exchangePlaceholderWithValue(textExcludeSubstring, result.insertValue ? newValue : '')),
                error: false,
            };
        }
        adapter.log.error(`There is a error in your input: ${stringExcludedChange}`);
        return { newValue: val ?? '', textToSend, error: true };
    }
    return {
        textToSend: exchangePlaceholderWithValue(textToSend, result.insertValue ? (val ?? '') : ''),
        newValue: val ?? '',
        error: false,
    };
};
exports.exchangeValue = exchangeValue;
function exchangePlaceholderWithValue(textToSend, val) {
    const searchString = getPlaceholderValue(textToSend);
    return searchString !== ''
        ? textToSend.replace(searchString, val.toString()).trim()
        : `${textToSend} ${val}`.trim();
}
exports.exchangePlaceholderWithValue = exchangePlaceholderWithValue;
function getPlaceholderValue(textToSend) {
    if (textToSend.includes('&&')) {
        return '&&';
    }
    if (textToSend.includes('&amp;&amp;')) {
        return '&amp;&amp;';
    }
    return '';
}
exports.getPlaceholderValue = getPlaceholderValue;
//# sourceMappingURL=exchangeValue.js.map
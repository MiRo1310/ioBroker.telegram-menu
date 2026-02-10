"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exchangeValue = void 0;
exports.isNoValueParameter = isNoValueParameter;
exports.exchangePlaceholderWithValue = exchangePlaceholderWithValue;
exports.getPlaceholderValue = getPlaceholderValue;
const string_1 = require("../lib/string");
const config_1 = require("../config/config");
function isNoValueParameter(textToSend) {
    let insertValue = true;
    if (textToSend.includes('{novalue}')) {
        textToSend = (0, string_1.removeDuplicateSpaces)(textToSend.replace('{novalue}', ''));
        insertValue = false;
    }
    return { insertValue, textToSend };
}
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
                textToSend: (0, string_1.removeDuplicateSpaces)(exchangePlaceholderWithValue(textExcludeSubstring, result.insertValue ? newValue : '')),
                error: false,
            };
        }
        adapter.log.error(`There is a error in your input: ${stringExcludedChange}`);
        return { newValue: val ?? '', textToSend: (0, string_1.removeDuplicateSpaces)(textToSend), error: true };
    }
    const text = (0, string_1.removeDuplicateSpaces)(exchangePlaceholderWithValue(textToSend, result.insertValue ? (val ?? '') : ''));
    return {
        textToSend: text,
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
function getPlaceholderValue(textToSend) {
    if (textToSend.includes('&&')) {
        return '&&';
    }
    if (textToSend.includes('&amp;&amp;')) {
        return '&amp;&amp;';
    }
    return '';
}
//# sourceMappingURL=exchangeValue.js.map
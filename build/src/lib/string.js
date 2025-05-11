"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmptyString = exports.isNonEmptyString = exports.pad = exports.isString = exports.getValueToExchange = exports.cleanUpString = exports.removeQuotes = exports.replaceAllItems = exports.replaceAll = exports.jsonString = void 0;
exports.parseJSON = parseJSON;
exports.decomposeText = decomposeText;
exports.stringReplacer = stringReplacer;
exports.getNewline = getNewline;
exports.isBooleanString = isBooleanString;
const config_1 = require("../config/config");
const utils_1 = require("./utils");
const logging_1 = require("../app/logging");
const jsonString = (val) => JSON.stringify(val);
exports.jsonString = jsonString;
function parseJSON(val, adapter) {
    try {
        return { json: JSON.parse(val), isValidJson: true };
    }
    catch (e) {
        if (adapter) {
            (0, logging_1.errorLogger)('Error parseJSON:', e, adapter);
        }
        return { json: val, isValidJson: false };
    }
}
const replaceAll = (text, searchValue, replaceValue) => {
    const escapedSearchValue = searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape-Sonderzeichen
    return text.replace(new RegExp(escapedSearchValue, 'g'), replaceValue);
};
exports.replaceAll = replaceAll;
const replaceAllItems = (text, searched) => {
    searched.forEach(item => {
        if (typeof item === 'string') {
            text = (0, exports.replaceAll)(text, item, '');
        }
        else {
            text = (0, exports.replaceAll)(text, item.search, item.val);
        }
    });
    return text;
};
exports.replaceAllItems = replaceAllItems;
const removeQuotes = (text) => text.replace(/['"]/g, '');
exports.removeQuotes = removeQuotes;
const cleanUpString = (text) => {
    if (!text) {
        return '';
    }
    return text
        .replace(/^['"]|['"]$/g, '') // Entferne Anführungszeichen am Anfang/Ende
        .replace(/\\n/g, '\n') // Ersetze \n durch einen echten Zeilenumbruch
        .replace(/ \\\n/g, '\n') // Ersetze \n mit Leerzeichen davor durch einen echten Zeilenumbruch
        .replace(/\\(?!n)/g, ''); // Entferne alle Backslashes, die nicht von einem 'n' gefolgt werden
};
exports.cleanUpString = cleanUpString;
function decomposeText(text, firstSearch, secondSearch) {
    const startindex = text.indexOf(firstSearch);
    const endindex = text.indexOf(secondSearch, startindex);
    const substring = text.substring(startindex, endindex + secondSearch.length);
    const substringExcludedSearch = stringReplacer(substring, [firstSearch, secondSearch]);
    const textWithoutSubstring = text.replace(substring, '').trim();
    return {
        startindex,
        endindex,
        substring,
        textExcludeSubstring: textWithoutSubstring,
        substringExcludeSearch: substringExcludedSearch,
    };
}
// TODO : Move to utils
const getValueToExchange = (adapter, textToSend, val) => {
    //TODO Use JSON => change{"true":"Wärmepumpe ist verbunden","false":"Wärmepumpe ist nicht verbunden"}
    if (textToSend.includes(config_1.config.change.start)) {
        const { start, end, command } = config_1.config.change;
        const { startindex, endindex, substring } = decomposeText(textToSend, start, end); // change{"true":"an","false":"aus"}
        const modifiedString = (0, exports.replaceAll)(substring, "'", '"').replace(command, ''); // {"true":"an","false":"aus"}
        const { json, isValidJson } = parseJSON(modifiedString);
        if (isValidJson) {
            return {
                newValue: json[String(val)] ?? val,
                textToSend: textToSend.substring(0, startindex) + textToSend.substring(endindex + 1),
                error: false,
            };
        }
        adapter.log.error(`There is a error in your input: ${modifiedString}`);
        return { newValue: val, textToSend, error: true };
    }
    return { textToSend, newValue: val, error: false };
};
exports.getValueToExchange = getValueToExchange;
const isString = (value) => typeof value === 'string';
exports.isString = isString;
function stringReplacer(substring, valueToReplace) {
    if (typeof valueToReplace[0] === 'string') {
        valueToReplace.forEach(item => {
            substring = substring.replace(item, '');
        });
        return substring;
    }
    valueToReplace.forEach(({ val, newValue }) => {
        substring = substring.replace(val, newValue);
    });
    return substring;
}
const pad = (value, length = 2) => {
    if (value < 0) {
        return `-${(value * -1).toString().padStart(length - 1, '0')}`;
    }
    return value.toString().padStart(length, '0');
};
exports.pad = pad;
function getNewline(newline) {
    return (0, utils_1.isTruthy)(newline) ? '\n' : '';
}
function isBooleanString(str) {
    return str === 'true' || str === 'false';
}
const isNonEmptyString = (str) => str.trim() !== '';
exports.isNonEmptyString = isNonEmptyString;
const isEmptyString = (str) => str.trim() === '';
exports.isEmptyString = isEmptyString;
//# sourceMappingURL=string.js.map
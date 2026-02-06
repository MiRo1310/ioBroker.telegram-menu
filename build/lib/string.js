"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmptyString = exports.isNonEmptyString = exports.pad = exports.isString = exports.cleanUpString = exports.removeDuplicateSpaces = exports.removeQuotes = exports.replaceAllItems = exports.replaceAll = exports.jsonString = void 0;
exports.parseJSON = parseJSON;
exports.decomposeText = decomposeText;
exports.stringReplacer = stringReplacer;
exports.ifTruthyAddNewLine = ifTruthyAddNewLine;
exports.isBooleanString = isBooleanString;
const logging_1 = require("../app/logging");
const utils_1 = require("../lib/utils");
const jsonString = (val) => JSON.stringify(val);
exports.jsonString = jsonString;
function parseJSON(val, adapter) {
    try {
        return val ? { json: JSON.parse(val), isValidJson: true } : { json: val ?? '', isValidJson: false };
    }
    catch (e) {
        if (adapter) {
            (0, logging_1.errorLogger)('Error parseJSON:', e, adapter);
        }
        return { json: val ?? '', isValidJson: false };
    }
}
const replaceAll = (text, searchValue, replaceValue) => {
    const escapedSearchValue = searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
const removeDuplicateSpaces = (text) => text.replace(/\s+/g, ' ').trim();
exports.removeDuplicateSpaces = removeDuplicateSpaces;
const cleanUpString = (text) => {
    if (!text) {
        return '';
    }
    return text
        .replace(/^['"]|['"]$/g, '') // Entferne Anführungszeichen am Anfang/Ende
        .replace(/\\n/g, '\n') // Ersetze \n durch einen echten Zeilenumbruch
        .replace(/ \\\n/g, '\n') // Ersetze \n mit Leerzeichen davor durch einen echten Zeilenumbruch
        .replace(/\\(?!n)/g, '') // Entferne alle Backslashes, die nicht von einem 'n' gefolgt werden)
        .replace(/\n /g, '\n') // Entferne Leerzeichen vor Zeilenumbrüchen
        .replace(/ {2,}/g, ' ');
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
function ifTruthyAddNewLine(newline) {
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
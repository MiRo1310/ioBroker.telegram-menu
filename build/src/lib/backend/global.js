"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decomposeText = exports.isJSON = exports.replaceAll = exports.deleteDoubleEntriesInArray = void 0;
function deleteDoubleEntriesInArray(arr) {
    return arr.filter((item, index) => arr.indexOf(item) === index);
}
exports.deleteDoubleEntriesInArray = deleteDoubleEntriesInArray;
function replaceAll(text, searchValue, replaceValue) {
    return text.replace(new RegExp(searchValue, "g"), replaceValue);
}
exports.replaceAll = replaceAll;
function isJSON(_string) {
    try {
        JSON.parse(_string);
        return true;
    }
    catch (error) {
        return false;
    }
}
exports.isJSON = isJSON;
function decomposeText(text, searchValue, secondValue) {
    const startindex = text.indexOf(searchValue);
    const endindex = text.indexOf(secondValue, startindex);
    const substring = text.substring(startindex, endindex + secondValue.length);
    const textWithoutSubstring = text.replace(substring, "").trim();
    return {
        startindex: startindex,
        endindex: endindex,
        substring: substring,
        textWithoutSubstring: textWithoutSubstring,
    };
}
exports.decomposeText = decomposeText;
//# sourceMappingURL=global.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFalsy = exports.isTruthy = exports.isString = exports.deepCopy = exports.deleteDoubleEntriesInArray = exports.isDefined = void 0;
exports.decomposeText = decomposeText;
exports.checkDirectoryIsOk = checkDirectoryIsOk;
exports.parseJSON = parseJSON;
const logging_1 = require("./logging");
const main_1 = require("../main");
const isDefined = (value) => value !== undefined && value !== null;
exports.isDefined = isDefined;
const deleteDoubleEntriesInArray = (arr) => arr.filter((item, index) => arr.indexOf(item) === index);
exports.deleteDoubleEntriesInArray = deleteDoubleEntriesInArray;
function decomposeText(text, searchValue, secondValue) {
    const startindex = text.indexOf(searchValue);
    const endindex = text.indexOf(secondValue, startindex);
    const substring = text.substring(startindex, endindex + secondValue.length);
    const textWithoutSubstring = text.replace(substring, '').trim();
    return {
        startindex: startindex,
        endindex: endindex,
        substring: substring,
        textWithoutSubstring: textWithoutSubstring,
    };
}
const deepCopy = (obj) => {
    try {
        if (!obj) {
            return undefined;
        }
        return JSON.parse(JSON.stringify(obj));
    }
    catch (err) {
        console.error(`Error deepCopy: ${JSON.stringify(err)}`);
    }
};
exports.deepCopy = deepCopy;
const isString = (value) => typeof value === 'string';
exports.isString = isString;
const isTruthy = (value) => ['1', 1, true, 'true'].includes(value);
exports.isTruthy = isTruthy;
const isFalsy = (value) => ['0', 0, false, 'false', undefined, null].includes(value);
exports.isFalsy = isFalsy;
function checkDirectoryIsOk(directory) {
    if (['', null, undefined].includes(directory)) {
        main_1._this.log.error('No directory to save the picture. Please add a directory in the settings with full read and write permissions.');
        return false;
    }
    return true;
}
function parseJSON(value) {
    try {
        return JSON.parse(value);
    }
    catch (error) {
        (0, logging_1.errorLogger)('Error parseJson: ', error);
        return undefined;
    }
}

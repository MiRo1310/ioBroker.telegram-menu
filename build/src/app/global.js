"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFalsy = exports.isTruthy = exports.isString = exports.deleteDoubleEntriesInArray = void 0;
exports.parseJSON = parseJSON;
const logging_1 = require("./logging");
const deleteDoubleEntriesInArray = (arr) => arr.filter((item, index) => arr.indexOf(item) === index);
exports.deleteDoubleEntriesInArray = deleteDoubleEntriesInArray;
const isString = (value) => typeof value === 'string';
exports.isString = isString;
const isTruthy = (value) => ['1', 1, true, 'true'].includes(value);
exports.isTruthy = isTruthy;
const isFalsy = (value) => ['0', 0, false, 'false', undefined, null].includes(value);
exports.isFalsy = isFalsy;
function parseJSON(value) {
    try {
        return JSON.parse(value);
    }
    catch (error) {
        (0, logging_1.errorLogger)('Error parseJson: ', error);
        return undefined;
    }
}
//# sourceMappingURL=global.js.map
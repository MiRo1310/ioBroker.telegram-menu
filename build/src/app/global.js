"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFalsy = exports.isTruthy = exports.isString = exports.deleteDoubleEntriesInArray = void 0;
const deleteDoubleEntriesInArray = (arr) => arr.filter((item, index) => arr.indexOf(item) === index);
exports.deleteDoubleEntriesInArray = deleteDoubleEntriesInArray;
const isString = (value) => typeof value === 'string';
exports.isString = isString;
const isTruthy = (value) => ['1', 1, true, 'true'].includes(value);
exports.isTruthy = isTruthy;
const isFalsy = (value) => ['0', 0, false, 'false', undefined, null].includes(value);
exports.isFalsy = isFalsy;
//# sourceMappingURL=global.js.map
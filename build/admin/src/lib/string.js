"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAction = exports.isEmptyString = exports.splitTrimAndJoin = exports.isFalsy = exports.isTruthy = exports.replaceSpaceWithUnderscore = void 0;
const replaceSpaceWithUnderscore = (menu) => menu.replace(/ /g, '_');
exports.replaceSpaceWithUnderscore = replaceSpaceWithUnderscore;
const isTruthy = (val) => ['1', 1, true, 'true'].includes(val);
exports.isTruthy = isTruthy;
const isFalsy = (val) => ['0', 0, false, 'false'].includes(val);
exports.isFalsy = isFalsy;
const splitTrimAndJoin = (str, separator, newSeparator) => str
    .split(separator)
    .map((s) => s.trim())
    .join(newSeparator || separator);
exports.splitTrimAndJoin = splitTrimAndJoin;
const isEmptyString = (str) => str.trim() === '';
exports.isEmptyString = isEmptyString;
const isAction = (str) => str === 'action';
exports.isAction = isAction;
//# sourceMappingURL=string.js.map
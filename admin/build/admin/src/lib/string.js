"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitTrimAndJoin = exports.isFalsy = exports.isTruthy = exports.replaceSpaceWithUnderscore = void 0;
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
//# sourceMappingURL=string.js.map
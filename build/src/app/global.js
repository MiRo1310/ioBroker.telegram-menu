"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFalsy = exports.isTruthy = void 0;
const isTruthy = (value) => ['1', 1, true, 'true'].includes(value);
exports.isTruthy = isTruthy;
const isFalsy = (value) => ['0', 0, false, 'false', undefined, null].includes(value);
exports.isFalsy = isFalsy;
//# sourceMappingURL=global.js.map
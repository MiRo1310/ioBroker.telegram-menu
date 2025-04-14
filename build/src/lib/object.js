"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trimAllItems = exports.removeDuplicates = void 0;
const removeDuplicates = (arr) => arr.filter((item, index) => arr.indexOf(item) === index);
exports.removeDuplicates = removeDuplicates;
const trimAllItems = (array) => array.map(item => item.trim());
exports.trimAllItems = trimAllItems;
//# sourceMappingURL=object.js.map
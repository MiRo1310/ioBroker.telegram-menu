"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirstItem = exports.getDoubleEntries = void 0;
const getDoubleEntries = (array) => {
    const entries = [...array];
    const doubleEntries = [];
    entries.forEach((element, index) => {
        if (index !== entries.indexOf(element)) {
            if (element != '-') {
                doubleEntries.push(element);
            }
        }
    });
    return doubleEntries;
};
exports.getDoubleEntries = getDoubleEntries;
const getFirstItem = (obj) => Object.keys(obj)[0];
exports.getFirstItem = getFirstItem;
//# sourceMappingURL=object.js.map
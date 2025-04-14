"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkObjectOrArray = exports.sortArray = exports.deleteDoubleEntriesInArray = exports.isChecked = exports.deepCopy = exports.processUserData = void 0;
exports.scrollToId = scrollToId;
const processUserData = (data) => {
    try {
        const array = [];
        const newData = JSON.parse(data);
        Object.keys(newData).forEach(key => {
            const name = newData[key].firstName;
            array.push({ name: name, chatID: key });
        });
        return array;
    }
    catch (err) {
        console.error(`Error processUserData: ${JSON.stringify(err)}`);
    }
};
exports.processUserData = processUserData;
const deepCopy = (obj) => {
    try {
        return JSON.parse(JSON.stringify(obj));
    }
    catch (err) {
        console.error(`Error deepCopy: ${JSON.stringify(err)}`);
    }
};
exports.deepCopy = deepCopy;
const isChecked = (value) => ['true', true].includes(value);
exports.isChecked = isChecked;
const deleteDoubleEntriesInArray = (arr) => arr.filter((item, index) => arr.indexOf(item) === index);
exports.deleteDoubleEntriesInArray = deleteDoubleEntriesInArray;
const sortArray = (arr) => {
    arr.sort((a, b) => {
        const lowerCaseA = a.toLowerCase();
        const lowerCaseB = b.toLowerCase();
        if (lowerCaseA < lowerCaseB) {
            return -1;
        }
        if (lowerCaseA > lowerCaseB) {
            return 1;
        }
        return 0;
    });
    return arr;
};
exports.sortArray = sortArray;
const checkObjectOrArray = (obj) => {
    if (typeof obj == 'object' && Array.isArray(obj)) {
        return 'array';
    }
    if (typeof obj == 'object') {
        return 'object';
    }
    return typeof obj;
};
exports.checkObjectOrArray = checkObjectOrArray;
function scrollToId(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}
//# sourceMappingURL=Utils.js.map
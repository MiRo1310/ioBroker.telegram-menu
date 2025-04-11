"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceAll = exports.validateNewLine = exports.jsonString = void 0;
exports.parseJSON = parseJSON;
const main_1 = require("../main");
const jsonString = (val) => JSON.stringify(val);
exports.jsonString = jsonString;
function parseJSON(val) {
    try {
        const parsed = JSON.parse(val);
        return { json: parsed, isValidJson: true };
    }
    catch (error) {
        main_1._this.log.error(`Error parse json: ${(0, exports.jsonString)(error)}`);
        return { json: {}, isValidJson: false };
    }
}
const validateNewLine = (text) => {
    const { json, isValidJson } = parseJSON(text);
    if (isValidJson) {
        text = json;
    }
    return text.replace(/""/g, '"').replace(/\\n/g, '\n');
};
exports.validateNewLine = validateNewLine;
const replaceAll = (text, searchValue, replaceValue) => text.replace(new RegExp(searchValue, 'g'), replaceValue);
exports.replaceAll = replaceAll;

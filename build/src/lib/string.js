"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateNewLine = exports.replaceAll = exports.jsonString = void 0;
exports.parseJSON = parseJSON;
exports.decomposeText = decomposeText;
const jsonString = (val) => JSON.stringify(val);
exports.jsonString = jsonString;
function parseJSON(val) {
    try {
        const parsed = JSON.parse(val);
        return { json: parsed, isValidJson: true };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }
    catch (e) {
        return { json: val, isValidJson: false };
    }
}
const replaceAll = (text, searchValue, replaceValue) => {
    const escapedSearchValue = searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape-Sonderzeichen
    return text.replace(new RegExp(escapedSearchValue, 'g'), replaceValue).trim();
};
exports.replaceAll = replaceAll;
const validateNewLine = (text) => {
    return text
        .replace(/^['"]|['"]$/g, '') // Entferne Anführungszeichen am Anfang/Ende
        .replace(/\\n/g, '\n') // Ersetze \n durch einen echten Zeilenumbruch
        .replace(/ \\\n/g, '\n') // Ersetze \n mit Leerzeichen davor durch einen echten Zeilenumbruch
        .replace(/\\(?!n)/g, ''); // Entferne alle Backslashes, die nicht von einem 'n' gefolgt werden
};
exports.validateNewLine = validateNewLine;
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
//# sourceMappingURL=string.js.map
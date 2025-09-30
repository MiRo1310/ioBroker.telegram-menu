"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTextTableFromJson = exports.createKeyboardFromJson = void 0;
const logging_1 = require("./logging");
const main_1 = require("../main");
const string_1 = require("../lib/string");
const json_1 = require("../lib/json");
const lastText = {};
const createKeyboardFromJson = (val, text, id, user) => {
    try {
        if (text) {
            lastText[user] = text;
        }
        else {
            text = lastText[user];
        }
        const { substring } = (0, string_1.decomposeText)(text, '{json:', '}');
        const array = substring.split(';');
        const headline = array[2];
        const itemArray = array[1].replace('[', '').replace(']', '').replace(/"/g, '').split(',');
        let idShoppingList = false;
        if (array.length > 3 && array[3] == 'shoppinglist') {
            idShoppingList = true;
        }
        const { validJson, error } = (0, json_1.makeValidJson)(val, main_1.adapter);
        main_1.adapter.log.debug(`Val ${validJson} with type ${typeof val}`);
        if (error) {
            return;
        }
        const { json, isValidJson } = (0, string_1.parseJSON)(validJson, main_1.adapter);
        if (!isValidJson) {
            return;
        }
        const keyboard = { inline_keyboard: [] };
        json.forEach((element, index) => {
            const firstRow = [];
            const rowArray = [];
            itemArray.forEach(item => {
                if (index == 0) {
                    const btnText = item.split(':')[1];
                    if (btnText.length > 0) {
                        firstRow.push({ text: btnText, callback_data: '1' });
                    }
                }
                const text = element[item.split(':')[0]];
                if (!element.buttondelete || !text) {
                    return;
                }
                if (idShoppingList) {
                    const value = element.buttondelete;
                    const valueDeleteLinkArray = (0, string_1.decomposeText)(value ?? '', "('", "')")
                        .substring.replace("('", '')
                        .replace(",true')", '')
                        .split('.');
                    const instanceAlexa = valueDeleteLinkArray[1];
                    const valueDeleteId = valueDeleteLinkArray[5];
                    const instanceShoppingListID = `${id.split('.')[1]}.${id.split('.')[2]}`;
                    rowArray.push({
                        text,
                        callback_data: `sList:${instanceShoppingListID}:${instanceAlexa}:${valueDeleteId}:`,
                    });
                }
                else {
                    rowArray.push({ text, callback_data: '1' });
                }
            });
            if (index == 0) {
                keyboard.inline_keyboard.push(firstRow);
            }
            keyboard.inline_keyboard.push(rowArray);
        });
        main_1.adapter.log.debug(`Keyboard : ${(0, string_1.jsonString)(keyboard)}`);
        return { text: headline, keyboard };
    }
    catch (err) {
        (0, logging_1.errorLogger)('Error createKeyboardFromJson:', err, main_1.adapter);
    }
};
exports.createKeyboardFromJson = createKeyboardFromJson;
function createTextTableFromJson(val, textToSend) {
    try {
        const substring = (0, string_1.decomposeText)(textToSend, '{json:', '}').substring;
        const array = substring.split(';');
        const itemArray = array[1].replace('[', '').replace(']', '').replace(/"/g, '').split(',');
        const valArray = JSON.parse(val);
        const lengthArray = []; // Array für die Länge der Items
        itemArray.forEach(element => {
            lengthArray.push(element.split(':')[1].length);
        });
        valArray.forEach(element => {
            itemArray.forEach((item, index) => {
                const length = element[item.split(':')[0]]?.toString().length;
                if (length && lengthArray[index] < length) {
                    lengthArray[index] = length;
                }
            });
        });
        main_1.adapter.log.debug(`Length of rows : ${(0, string_1.jsonString)(lengthArray)}`);
        const headline = array[2];
        let textTable = textToSend.replace(substring, '').trim();
        if (textTable != '') {
            textTable += ' \n\n';
        }
        textTable += ` ${headline} \n\``;
        const enlargeColumn = 1;
        const reduce = lengthArray.length == 1 ? 2 : 0;
        const lineLength = lengthArray.reduce((a, b) => a + b, 0) + 5 - reduce + enlargeColumn * lengthArray.length;
        // Breakline
        textTable += `${'-'.repeat(lineLength)} \n`;
        valArray.forEach((element, elementIndex) => {
            itemArray.forEach((item, index) => {
                // TableHead
                if (elementIndex == 0 && index == 0) {
                    textTable += '|';
                    itemArray.forEach((item2, i) => {
                        if (item2.split(':')[1].length > 0) {
                            textTable += ` ${item2
                                .split(':')[1]
                                .toString()
                                .padEnd(lengthArray[i] + enlargeColumn, ' ')}|`;
                            if (i == itemArray.length - 1) {
                                textTable += '\n';
                                // Breakline
                                textTable += `${'-'.repeat(lineLength)} \n`;
                            }
                        }
                        else {
                            textTable = textTable.slice(0, -1);
                        }
                    });
                }
                // TableBody
                if (index == 0) {
                    textTable += '|';
                }
                const text = element[item.split(':')[0]];
                if (!text) {
                    return;
                }
                textTable += ` ${text.toString().padEnd(lengthArray[index] + enlargeColumn, ' ')}|`;
                if (index == itemArray.length - 1) {
                    textTable += '\n';
                }
            });
        });
        // Breakline
        textTable += '-'.repeat(lineLength);
        textTable += '`';
        return textTable;
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error createTextTableFromJson:', e, main_1.adapter);
    }
}
exports.createTextTableFromJson = createTextTableFromJson;
//# sourceMappingURL=jsonTable.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKeyboardFromJson = void 0;
exports.createTextTableFromJson = createTextTableFromJson;
const global_1 = require("./global");
const logging_1 = require("./logging");
const main_1 = require("../main");
const string_1 = require("../lib/string");
const lastText = {};
const createKeyboardFromJson = (val, text, id, user) => {
    try {
        if (text) {
            lastText[user] = text;
        }
        else {
            text = lastText[user];
        }
        const array = (0, global_1.decomposeText)(text, '{json:', '}').substring.split(';');
        const headline = array[2];
        const itemArray = array[1].replace('[', '').replace(']', '').replace(/"/g, '').split(',');
        let idShoppingList = false;
        if (array.length > 3 && array[3] == 'shoppinglist') {
            idShoppingList = true;
        }
        main_1._this.log.debug(`Val: ${val} with type: ${typeof val}`);
        const valArray = (0, global_1.parseJSON)(val);
        if (!valArray) {
            return;
        }
        const keyboard = { inline_keyboard: [] };
        valArray.forEach((element, index) => {
            const firstRow = [];
            const rowArray = [];
            itemArray.forEach(item => {
                if (index == 0) {
                    const btnText = item.split(':')[1];
                    if (btnText.length > 0) {
                        firstRow.push({ text: btnText, callback_data: '1' });
                    }
                }
                if (idShoppingList) {
                    const value = element.buttondelete;
                    const valueDeleteLinkArray = (0, global_1.decomposeText)(value, "('", "')")
                        .substring.replace("('", '')
                        .replace(",true')", '')
                        .split('.');
                    const instanceAlexa = valueDeleteLinkArray[1];
                    const valueDeleteId = valueDeleteLinkArray[5];
                    const instanceShoppingListID = `${id.split('.')[1]}.${id.split('.')[2]}`;
                    rowArray.push({
                        text: element[item.split(':')[0]],
                        callback_data: `sList:${instanceShoppingListID}:${instanceAlexa}:${valueDeleteId}:`,
                    });
                }
                else {
                    rowArray.push({ text: element[item.split(':')[0]], callback_data: '1' });
                }
            });
            if (index == 0) {
                keyboard.inline_keyboard.push(firstRow);
            }
            keyboard.inline_keyboard.push(rowArray);
        });
        main_1._this.log.debug(`Keyboard: ${(0, string_1.jsonString)(keyboard)}`);
        return { text: headline, keyboard };
    }
    catch (err) {
        (0, logging_1.errorLogger)('Error createKeyboardFromJson:', err);
    }
};
exports.createKeyboardFromJson = createKeyboardFromJson;
function createTextTableFromJson(val, textToSend) {
    try {
        if (!val) {
            return;
        }
        const substring = (0, global_1.decomposeText)(textToSend, '{json:', '}').substring;
        const array = substring.split(';');
        const itemArray = array[1].replace('[', '').replace(']', '').replace(/"/g, '').split(',');
        const valArray = JSON.parse(val);
        // Array für die Größte Länge der Items
        const lengthArray = [];
        // Trägt für jedes Item einen Eintrag im lengthArray ein
        itemArray.forEach(element => {
            lengthArray.push(element.split(':')[1].length);
        });
        valArray.forEach(element => {
            itemArray.forEach((item, index) => {
                if (lengthArray[index] < element[item.split(':')[0]].toString().length) {
                    lengthArray[index] = element[item.split(':')[0]].toString().length;
                }
            });
        });
        main_1._this.log.debug(`Length of rows: ${(0, string_1.jsonString)(lengthArray)}`);
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
                textTable += ` ${element[item.split(':')[0]].toString().padEnd(lengthArray[index] + enlargeColumn, ' ')}|`;
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
        (0, logging_1.errorLogger)('Error createTextTableFromJson:', e);
    }
}

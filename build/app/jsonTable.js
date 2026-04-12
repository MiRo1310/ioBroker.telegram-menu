"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKeyboardFromJson = void 0;
exports.createTextTableFromJson = createTextTableFromJson;
const string_1 = require("../lib/string");
const json_1 = require("../lib/json");
const logging_1 = require("../app/logging");
const config_1 = require("../config/config");
const lastText = {};
const createKeyboardFromJson = (adapter, val, text, id, user) => {
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
        const { validJson, error } = (0, json_1.makeValidJson)(val, adapter);
        adapter.log.debug(`Val ${validJson} with type ${typeof val}`);
        if (error) {
            return;
        }
        const { json, isValidJson } = (0, string_1.parseJSON)(validJson, adapter);
        if (!isValidJson) {
            return;
        }
        const keyboard = { inline_keyboard: [] };
        if (!Array.isArray(json)) {
            return;
        }
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
        adapter.log.debug(`Keyboard : ${(0, string_1.jsonString)(keyboard)}`);
        return { text: headline, keyboard };
    }
    catch (err) {
        (0, logging_1.errorLogger)('Error createKeyboardFromJson:', err, adapter);
    }
};
exports.createKeyboardFromJson = createKeyboardFromJson;
const getTableBreakLine = (lineLength) => `${'-'.repeat(lineLength)} \n`;
const getTableHeader = (headline) => ` ${headline} \n`;
const isLastElementOFArray = (array, index) => array.length - 1 === index;
function tableHead(elementIndex, index, textTable, itemArray, lengthArray, enlargeColumn, lineLength) {
    if (elementIndex == 0 && index == 0) {
        textTable += '|';
        itemArray.forEach((item2, i) => {
            if (item2.split(':')[1].length > 0) {
                textTable += ` ${item2
                    .split(':')[1]
                    .toString()
                    .padEnd(lengthArray[i] + enlargeColumn, ' ')}|`;
                if (isLastElementOFArray(itemArray, i)) {
                    textTable += '\n';
                    textTable += getTableBreakLine(lineLength);
                }
            }
            else {
                textTable = textTable.slice(0, -1);
            }
        });
    }
    return textTable;
}
function tableBody(index, textTable, element, item, lengthArray, enlargeColumn, itemArray) {
    if (index == 0) {
        textTable += '|';
    }
    const text = element[item.split(':')[0]] ?? '';
    textTable += ` ${text.toString().padEnd(lengthArray[index] + enlargeColumn, ' ')}|`;
    if (index == itemArray.length - 1) {
        textTable += '\n';
    }
    return textTable;
}
const getTableData = (parsedJson, array) => {
    const header = array[1];
    const itemArray = array[0].replace(']', '').replace(/"/g, '').split(','); //  [Pollen:Pollen,Riskindex:Riskindex,Riskindextext:Riskindextext]
    const keyText = [];
    itemArray.forEach(item => {
        const splitted = item.split(':');
        keyText.push({ key: splitted[0], cellText: splitted[1] });
    });
    const tableObj = {
        length: [],
        header,
        data: [[]],
    };
    keyText.forEach(item => {
        tableObj.length.push({ key: item.key, length: item.cellText.length });
        tableObj.data[0].push(item.cellText);
    });
    parsedJson.forEach((row, index) => {
        keyText.forEach(item => {
            const value = row[item.key] ?? '';
            const lengthElement = tableObj.length.find(l => l.key === item.key);
            if (lengthElement.length < value.length) {
                lengthElement.length = value.length;
            }
            if (!tableObj.data[index + 1]) {
                tableObj.data[index + 1] = [];
            }
            tableObj.data[index + 1].push(row[item.key] ?? '');
        });
    });
    return tableObj;
};
function createTextTableFromJson(adapter, json, textToSend) {
    try {
        //TODO Object erst zusammen bauen
        const { substring, substringExcludeSearch } = (0, string_1.decomposeText)(textToSend, '{json;[', `;${config_1.config.json.textTable}}`); // {json;[Pollen:Pollen,Riskindex:Riskindex,Riskindextext:Riskindextext];Pollenflug;TextTable}
        const array = substringExcludeSearch.split(';'); // Pollen:Pollen,Riskindex:Riskindex,Riskindextext:Riskindextext];Pollenflug;
        const header = array[1];
        const itemArray = array[0].replace(']', '').replace(/"/g, '').split(',');
        const parsedJson = JSON.parse(json);
        if (!parsedJson) {
            return;
        }
        const valueObj = getTableData(parsedJson, array);
        console.log(valueObj);
        const lengthArray = []; // Array für die Länge der Items
        itemArray.forEach(element => {
            lengthArray.push(element.split(':')[1]?.length ?? 0);
        });
        if (!Array.isArray(parsedJson)) {
            return;
        }
        parsedJson.forEach(element => {
            itemArray.forEach((item, index) => {
                const length = element[item.split(':')[0]]?.toString().length;
                if (length && lengthArray[index] < length) {
                    lengthArray[index] = length;
                }
            });
        });
        adapter.log.debug(`Length of rows : ${(0, string_1.jsonString)(lengthArray)}`);
        let textTable = textToSend.replace(substring, '').trim();
        if (textTable != '') {
            textTable += '\n\n';
        }
        textTable += getTableHeader(header);
        const enlargeColumn = 1;
        const reduce = lengthArray.length == 1 ? 2 : 0;
        const lineLength = lengthArray.reduce((a, b) => a + b, 0) + 5 - reduce + enlargeColumn * lengthArray.length;
        // Breakline
        textTable += getTableBreakLine(lineLength);
        parsedJson.forEach((element, elementIndex) => {
            itemArray.forEach((item, index) => {
                // TableHead
                textTable = tableHead(elementIndex, index, textTable, itemArray, lengthArray, enlargeColumn, lineLength);
                // TableBody
                textTable = tableBody(index, textTable, element, item, lengthArray, enlargeColumn, itemArray);
            });
        });
        // Breakline
        textTable += '-'.repeat(lineLength);
        // textTable += '`';
        return textTable;
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error createTextTableFromJson:', e, adapter);
    }
}
//# sourceMappingURL=jsonTable.js.map
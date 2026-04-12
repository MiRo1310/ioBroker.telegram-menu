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
const getTableBreakLine = (lineLength) => `${'-'.repeat(lineLength + 2)} \n`;
const getTableHeader = (headline) => ` ${headline} \n\n`;
const isLastElementOFArray = (array, index) => array.length - 1 === index;
function getCellValue(header, tableObj, enlargeColumn) {
    const length = tableObj.length.find(l => l.key === header.key)?.length ?? 0;
    return ` ${header.value.toString().padEnd(length + enlargeColumn, ' ')}|`;
}
const getRowValue = (index, tableObj, enlargeColumn) => {
    let rowValue = '|';
    tableObj.data[index].forEach((header, i) => {
        rowValue += getCellValue(header, tableObj, enlargeColumn);
        if (isLastElementOFArray(tableObj.data[0], i)) {
            rowValue += '\n';
        }
    });
    return rowValue;
};
function tableHead(textTable, tableObj, enlargeColumn) {
    textTable += getRowValue(0, tableObj, enlargeColumn);
    textTable += getTableBreakLine(getLineLength(tableObj, enlargeColumn));
    return textTable;
}
function tableBody(textTable, tableObj, enlargeColumn) {
    tableObj.data.forEach((row, i) => {
        if (i === 0) {
            return;
        }
        textTable += getRowValue(i, tableObj, enlargeColumn);
    });
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
        tableObj.data[0].push({ value: item.cellText, key: item.key });
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
            tableObj.data[index + 1].push({ value: row[item.key] ?? '', key: item.key });
        });
    });
    return tableObj;
};
function getLineLength(tableObj, enlargeColumn) {
    const reduce = tableObj.data[0].length == 1 ? 2 : 0;
    return (tableObj.length.reduce((a, b) => a + b.length, 0) + 5 - reduce + enlargeColumn * tableObj.length.length);
}
function createTextTableFromJson(adapter, json, textToSend) {
    try {
        //TODO Object erst zusammen bauen
        const { substringExcludeSearch } = (0, string_1.decomposeText)(textToSend, '{json;[', `;${config_1.config.json.textTable}}`); // {json;[Pollen:Pollen,Riskindex:Riskindex,Riskindextext:Riskindextext];Pollenflug;TextTable}
        const array = substringExcludeSearch.split(';'); // Pollen:Pollen,Riskindex:Riskindex,Riskindextext:Riskindextext];Pollenflug;
        const header = array[1];
        const parsedJson = JSON.parse(json);
        if (!Array.isArray(parsedJson)) {
            return;
        }
        const tableObj = getTableData(parsedJson, array);
        let textTable = getTableHeader(header);
        const enlargeColumn = 1;
        const lineLength = getLineLength(tableObj, enlargeColumn);
        // Breakline
        textTable += '`';
        // Setze den Text in dreifache Backticks (```), um einen Codeblock zu erzeugen, oder in einfache Backticks (`), um Inline-Code zu erzeugen.
        //Beispiel für einen Codeblock (empfohlen für Tabellen):
        textTable += getTableBreakLine(lineLength);
        textTable = tableHead(textTable, tableObj, enlargeColumn);
        // TableBody
        textTable = tableBody(textTable, tableObj, enlargeColumn);
        // Breakline
        textTable += getTableBreakLine(lineLength);
        textTable += '`';
        return textTable;
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error createTextTableFromJson:', e, adapter);
    }
}
//# sourceMappingURL=jsonTable.js.map
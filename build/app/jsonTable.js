"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKeyboardFromJson = exports.lastRequestJsonButtonHistory = exports.jsonTableButtonHistory = void 0;
exports.createTextTableFromJson = createTextTableFromJson;
const string_1 = require("../lib/string");
const logging_1 = require("../app/logging");
exports.jsonTableButtonHistory = {};
class lastRequestJsonButtonHistoryClass {
    lastRequestJsonButtonHistory = [];
    id = 0;
    requestIds = [];
    resetId(id) {
        this.requestIds.filter(id => id !== id);
        this.lastRequestJsonButtonHistory.filter(i => i.id !== id);
    }
    getRequestIds() {
        return this.requestIds;
    }
    addRequestId(id) {
        this.requestIds.push(id);
    }
    setData(text, instance, user) {
        const id = this.getNewId();
        this.lastRequestJsonButtonHistory.push({ text, instance, user, id });
        return id;
    }
    getLast(id) {
        return this.lastRequestJsonButtonHistory.find(i => i.id === id);
    }
    getNewId() {
        const id = this.id;
        this.id++;
        return id;
    }
}
exports.lastRequestJsonButtonHistory = new lastRequestJsonButtonHistoryClass();
const createKeyboardFromJson = (adapter, val, text, id, user, instance) => {
    try {
        if (text) {
            exports.jsonTableButtonHistory[user] = text;
        }
        else {
            text = exports.jsonTableButtonHistory[user];
        }
        const requestId = exports.lastRequestJsonButtonHistory.setData(text, instance, user);
        const { json: parsedJsonUserInput, isValidJson: validJsonUserInput } = (0, string_1.parseJSON)(text);
        if (!validJsonUserInput) {
            adapter.log.warn(`No valid Json, ${text}`);
            return;
        }
        const { json, isValidJson } = (0, string_1.parseJSON)(val, adapter);
        if (!isValidJson) {
            return;
        }
        const keyboard = { inline_keyboard: [] };
        if (!Array.isArray(json)) {
            return;
        }
        json.forEach(element => {
            const rowArray = [];
            parsedJsonUserInput.tableData.forEach(item => {
                const listItemLabel = element[item.key];
                if (!element.buttondelete || !listItemLabel) {
                    return;
                }
                const value = element.buttondelete;
                const valueDeleteLinkArray = (0, string_1.decomposeText)(value ?? '', "('", "')")
                    .substring.replace("('", '')
                    .replace(",true')", '')
                    .split('.');
                const instanceAlexa = valueDeleteLinkArray[1];
                const valueDeleteId = valueDeleteLinkArray[5];
                const instanceShoppingListID = `${id.split('.')[1]}.${id.split('.')[2]}`;
                const name = element.name;
                if (name) {
                    rowArray.push({
                        text: name,
                        callback_data: `sList:${instanceShoppingListID}:${instanceAlexa}:${valueDeleteId}:${parsedJsonUserInput.listName}:${requestId}`,
                    });
                }
            });
            keyboard.inline_keyboard.push(rowArray);
        });
        adapter.log.debug(`Keyboard : ${(0, string_1.jsonString)(keyboard)}`);
        return { text: parsedJsonUserInput.tableLabel ?? 'List', keyboard };
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
    const tableObj = {
        length: [],
        data: [[]],
    };
    array.forEach(item => {
        tableObj.length.push({ key: item.key, length: item.label ? item.label.length : item.key.length });
        tableObj.data[0].push({ value: item.label ?? item.key, key: item.key });
    });
    parsedJson.forEach((row, index) => {
        array.forEach(item => {
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
        const { json: parsedJsonUserInput, isValidJson } = (0, string_1.parseJSON)(textToSend);
        if (!isValidJson) {
            return;
        }
        const parsedJson = JSON.parse(json);
        if (!Array.isArray(parsedJson)) {
            return;
        }
        const tableObj = getTableData(parsedJson, parsedJsonUserInput.tableData);
        let textTable = '';
        if (parsedJsonUserInput.tableLabel !== '') {
            textTable = getTableHeader(parsedJsonUserInput.tableLabel);
        }
        const enlargeColumn = 1;
        const lineLength = getLineLength(tableObj, enlargeColumn);
        // Breakline
        // Setze den Text in dreifache Backticks (```), um einen Codeblock zu erzeugen, oder in einfache Backticks (`), um Inline-Code zu erzeugen.
        //Beispiel für einen Codeblock (empfohlen für Tabellen):
        textTable += '`';
        textTable += getTableBreakLine(lineLength);
        textTable = tableHead(textTable, tableObj, enlargeColumn);
        textTable = tableBody(textTable, tableObj, enlargeColumn);
        textTable += getTableBreakLine(lineLength);
        textTable += '`';
        return textTable;
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error createTextTableFromJson:', e, adapter);
    }
}
//# sourceMappingURL=jsonTable.js.map
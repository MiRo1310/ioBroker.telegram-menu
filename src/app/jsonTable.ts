import type { Adapter, Keyboard, KeyboardItem, LastText, ValArray } from '@backend/types/types';
import { decomposeText, jsonString, parseJSON } from '@backend/lib/string';
import { makeValidJson } from '@backend/lib/json';
import { errorLogger } from '@backend/app/logging';
import { config } from '@backend/config/config';

interface TableObj {
    length: { key: string; length: number }[];
    header: string;
    data: { value: string | number; key: string }[][]; // jede row darin jede celle
}

interface IKeyText {
    key: string;
    cellText: string;
}

interface IJsonShoppingList {
    tableData: { key: string; label: string }[];
    tableLabel: string;
    listName: string;
    type: 'alexaShoppingList';
}

const lastText: LastText = {};
const createKeyboardFromJson = (
    adapter: Adapter,
    val: string,
    text: string | null,
    id: string,
    user: string,
): { text: string; keyboard: Keyboard } | undefined => {
    try {
        if (text) {
            lastText[user] = text;
        } else {
            text = lastText[user];
        }
        const { json: parsedJsonUserInput, isValidJson: validJsonUserInput } = parseJSON<IJsonShoppingList>(text);
        if (!validJsonUserInput) {
            adapter.log.warn(`No valid Json, ${text}`);
            return;
        }

        const { validJson, error } = makeValidJson(val, adapter);

        adapter.log.debug(`Val ${validJson} with type ${typeof val}`);
        if (error) {
            return;
        }

        const { json, isValidJson } = parseJSON<ValArray[]>(validJson, adapter);
        if (!isValidJson) {
            return;
        }

        const keyboard: Keyboard = { inline_keyboard: [] };
        if (!Array.isArray(json)) {
            return;
        }
        json.forEach(element => {
            const rowArray: KeyboardItem[] = [];
            parsedJsonUserInput.tableData.forEach(item => {
                const listItemLabel = element[item.key];
                if (!element.buttondelete || !listItemLabel) {
                    return;
                }

                const value = element.buttondelete;
                const valueDeleteLinkArray = decomposeText(value ?? '', "('", "')")
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
                        callback_data: `sList:${instanceShoppingListID}:${instanceAlexa}:${valueDeleteId}:${parsedJsonUserInput.listName}`,
                    });
                }
            });
            keyboard.inline_keyboard.push(rowArray);
        });

        adapter.log.debug(`Keyboard : ${jsonString(keyboard)}`);

        return { text: parsedJsonUserInput.tableLabel ?? 'List', keyboard };
    } catch (err: any) {
        errorLogger('Error createKeyboardFromJson:', err, adapter);
    }
};

const getTableBreakLine = (lineLength: number): string => `${'-'.repeat(lineLength + 2)} \n`;
const getTableHeader = (headline: string): string => ` ${headline} \n\n`;
const isLastElementOFArray = (array: any[], index: number): boolean => array.length - 1 === index;

function getCellValue(
    header: {
        value: string | number;
        key: string;
    },
    tableObj: TableObj,
    enlargeColumn: number,
): string {
    const length = tableObj.length.find(l => l.key === header.key)?.length ?? 0;
    return ` ${header.value.toString().padEnd(length + enlargeColumn, ' ')}|`;
}

const getRowValue = (index: number, tableObj: TableObj, enlargeColumn: number): string => {
    let rowValue = '|';

    tableObj.data[index].forEach((header, i) => {
        rowValue += getCellValue(header, tableObj, enlargeColumn);
        if (isLastElementOFArray(tableObj.data[0], i)) {
            rowValue += '\n';
        }
    });
    return rowValue;
};

function tableHead(textTable: string, tableObj: TableObj, enlargeColumn: number): string {
    textTable += getRowValue(0, tableObj, enlargeColumn);

    textTable += getTableBreakLine(getLineLength(tableObj, enlargeColumn));

    return textTable;
}

function tableBody(
    textTable: string,

    tableObj: TableObj,
    enlargeColumn: number,
): string {
    tableObj.data.forEach((row, i) => {
        if (i === 0) {
            return;
        }
        textTable += getRowValue(i, tableObj, enlargeColumn);
    });
    return textTable;
}

const getTableData = (parsedJson: ValArray[], array: string[]): TableObj => {
    const header = array[1];
    const itemArray: string[] = array[0].replace(']', '').replace(/"/g, '').split(','); //  [Pollen:Pollen,Riskindex:Riskindex,Riskindextext:Riskindextext]
    const keyText: IKeyText[] = [];

    itemArray.forEach(item => {
        const splitted = item.split(':');
        keyText.push({ key: splitted[0], cellText: splitted[1] });
    });

    const tableObj: TableObj = {
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

            const lengthElement = tableObj.length.find(l => l.key === item.key)!;
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

function getLineLength(tableObj: TableObj, enlargeColumn: number): number {
    const reduce = tableObj.data[0].length == 1 ? 2 : 0;
    return (
        tableObj.length.reduce((a, b): number => a + b.length, 0) + 5 - reduce + enlargeColumn * tableObj.length.length
    );
}

function createTextTableFromJson(adapter: Adapter, json: string, textToSend: string): string | undefined {
    try {
        const { substringExcludeSearch } = decomposeText(textToSend, '{json;[', `;${config.json.textTable}}`); // {json;[Pollen:Pollen,Riskindex:Riskindex,Riskindextext:Riskindextext];Pollenflug;TextTable}
        const array = substringExcludeSearch.split(';'); // Pollen:Pollen,Riskindex:Riskindex,Riskindextext:Riskindextext];Pollenflug;
        const header = array[1];

        const parsedJson: ValArray[] | undefined = JSON.parse(json);
        if (!Array.isArray(parsedJson)) {
            return;
        }
        const tableObj = getTableData(parsedJson, array);

        let textTable = getTableHeader(header);

        const enlargeColumn = 1;

        const lineLength = getLineLength(tableObj, enlargeColumn);

        // Breakline
        // Setze den Text in dreifache Backticks (```), um einen Codeblock zu erzeugen, oder in einfache Backticks (`), um Inline-Code zu erzeugen.
        //Beispiel für einen Codeblock (empfohlen für Tabellen):
        textTable += '`';

        textTable += getTableBreakLine(lineLength);

        textTable = tableHead(textTable, tableObj, enlargeColumn);

        // TableBody
        textTable = tableBody(textTable, tableObj, enlargeColumn);

        // Breakline
        textTable += getTableBreakLine(lineLength);
        textTable += '`';
        return textTable;
    } catch (e: any) {
        errorLogger('Error createTextTableFromJson:', e, adapter);
    }
}
export { createKeyboardFromJson, createTextTableFromJson };

import type { Adapter, Keyboard, KeyboardItem, ValArray } from '@backend/types/types';
import { decomposeText, jsonString, parseJSON } from '@backend/lib/string';
import { errorLogger } from '@backend/app/logging';

interface TableObj {
    length: { key: string; length: number }[];
    data: { value: string | number; key: string }[][]; // jede row darin jede celle
}

interface IJsonShoppingList {
    tableData: ITableData[];
    tableLabel: string;
    type: 'alexaShoppingList';
}
interface ITableButtonList {
    listName: string;
}

interface ITableData {
    key: string;
    label?: string;
}

export type IJsonTableText = Record<string, string>;
export interface IJsonTableButtonHistory {
    text: string | null;
    instance: string | null;
    user: string | null;
    id: number | null;
}
export const jsonTableButtonHistory: IJsonTableText = {};

class lastRequestJsonButtonHistoryClass {
    private lastRequestJsonButtonHistory: IJsonTableButtonHistory[] = [];
    private id: number = 0;
    private requestIds: number[] = [];

    public resetId(id: number): void {
        this.requestIds.filter(id => id !== id);
        this.lastRequestJsonButtonHistory.filter(i => i.id !== id);
    }

    public getRequestIds(): number[] {
        return this.requestIds;
    }

    addRequestId(id: number): void {
        this.requestIds.push(id);
    }

    public setData(text: string, instance: string, user: string): number {
        const id = this.getNewId();
        this.lastRequestJsonButtonHistory.push({ text, instance, user, id });
        return id;
    }

    public getLast(id: number): IJsonTableButtonHistory | undefined {
        return this.lastRequestJsonButtonHistory.find(i => i.id === id);
    }

    private getNewId(): number {
        const id = this.id;
        this.id++;
        return id;
    }
}

export const lastRequestJsonButtonHistory = new lastRequestJsonButtonHistoryClass();

const createKeyboardFromJson = (
    adapter: Adapter,
    val: string,
    text: string | null,
    id: string,
    user: string,
    instance: string,
): { text: string; keyboard: Keyboard } | undefined => {
    try {
        if (text) {
            jsonTableButtonHistory[user] = text;
        } else {
            text = jsonTableButtonHistory[user];
        }
        const requestId = lastRequestJsonButtonHistory.setData(text, instance, user);
        const { json: parsedJsonUserInput, isValidJson: validJsonUserInput } = parseJSON<
            IJsonShoppingList & ITableButtonList
        >(text);
        if (!validJsonUserInput) {
            adapter.log.warn(`No valid Json, ${text}`);
            return;
        }

        const { json, isValidJson } = parseJSON<ValArray[]>(val, adapter);
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
                        callback_data: `sList:${instanceShoppingListID}:${instanceAlexa}:${valueDeleteId}:${parsedJsonUserInput.listName}:${requestId}`,
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

const getTableData = (parsedJson: ValArray[], array: ITableData[]): TableObj => {
    const tableObj: TableObj = {
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
        const { json: parsedJsonUserInput, isValidJson } = parseJSON<IJsonShoppingList>(textToSend);
        if (!isValidJson) {
            return;
        }

        const parsedJson: ValArray[] | undefined = JSON.parse(json);
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
    } catch (e: any) {
        errorLogger('Error createTextTableFromJson:', e, adapter);
    }
}
export { createKeyboardFromJson, createTextTableFromJson };

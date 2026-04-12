import type { Adapter, Keyboard, KeyboardItem, LastText, ValArray } from '@backend/types/types';
import { decomposeText, jsonString, parseJSON } from '@backend/lib/string';
import { makeValidJson } from '@backend/lib/json';
import { errorLogger } from '@backend/app/logging';
import { config } from '@backend/config/config';

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
        const { substring } = decomposeText(text, '{json:', '}');

        const array = substring.split(';');
        const headline = array[2];
        const itemArray: string[] = array[1].replace('[', '').replace(']', '').replace(/"/g, '').split(',');
        let idShoppingList = false;
        if (array.length > 3 && array[3] == 'shoppinglist') {
            idShoppingList = true;
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
        json.forEach((element, index) => {
            const firstRow: KeyboardItem[] = [];
            const rowArray: KeyboardItem[] = [];
            itemArray.forEach(item => {
                if (index == 0) {
                    const btnText: string = item.split(':')[1];
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
                    const valueDeleteLinkArray = decomposeText(value ?? '', "('", "')")
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
                } else {
                    rowArray.push({ text, callback_data: '1' });
                }
            });
            if (index == 0) {
                keyboard.inline_keyboard.push(firstRow);
            }
            keyboard.inline_keyboard.push(rowArray);
        });

        adapter.log.debug(`Keyboard : ${jsonString(keyboard)}`);

        return { text: headline, keyboard };
    } catch (err: any) {
        errorLogger('Error createKeyboardFromJson:', err, adapter);
    }
};

const getTableBreakLine = (lineLength: number): string => `${'-'.repeat(lineLength)} \n`;
const getTableHeader = (headline: string): string => ` ${headline} \n`;
const isLastElementOFArray = (array: any[], index: number): boolean => array.length - 1 === index;

function tableHead(
    elementIndex: number,
    index: number,
    textTable: string,
    itemArray: string[],
    lengthArray: number[],
    enlargeColumn: number,
    lineLength: number,
): string {
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
            } else {
                textTable = textTable.slice(0, -1);
            }
        });
    }
    return textTable;
}

function tableBody(
    index: number,
    textTable: string,
    element: ValArray,
    item: string,
    lengthArray: number[],
    enlargeColumn: number,
    itemArray: string[],
): string {
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
interface TableObj {
    length: { key: string; length: number }[];
    header: string;
    data: (string | number)[][]; // jede row darin jede celle
}

interface IKeyText {
    key: string;
    cellText: string;
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
        tableObj.data[0].push(item.cellText);
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
            tableObj.data[index + 1].push(row[item.key] ?? '');
        });
    });
    return tableObj;
};

function createTextTableFromJson(adapter: Adapter, json: string, textToSend: string): string | undefined {
    try {
        //TODO Object erst zusammen bauen
        const { substring, substringExcludeSearch } = decomposeText(
            textToSend,
            '{json;[',
            `;${config.json.textTable}}`,
        ); // {json;[Pollen:Pollen,Riskindex:Riskindex,Riskindextext:Riskindextext];Pollenflug;TextTable}
        const array = substringExcludeSearch.split(';'); // Pollen:Pollen,Riskindex:Riskindex,Riskindextext:Riskindextext];Pollenflug;
        const header = array[1];
        const itemArray: string[] = array[0].replace(']', '').replace(/"/g, '').split(',');

        const parsedJson: ValArray[] | undefined = JSON.parse(json);
        if (!parsedJson) {
            return;
        }
        const valueObj = getTableData(parsedJson, array);
        console.log(valueObj);
        const lengthArray: number[] = []; // Array für die Länge der Items

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
        adapter.log.debug(`Length of rows : ${jsonString(lengthArray)}`);

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
                textTable = tableHead(
                    elementIndex,
                    index,
                    textTable,
                    itemArray,
                    lengthArray,
                    enlargeColumn,
                    lineLength,
                );
                // TableBody
                textTable = tableBody(index, textTable, element, item, lengthArray, enlargeColumn, itemArray);
            });
        });
        // Breakline
        textTable += '-'.repeat(lineLength);
        // textTable += '`';
        return textTable;
    } catch (e: any) {
        errorLogger('Error createTextTableFromJson:', e, adapter);
    }
}
export { createKeyboardFromJson, createTextTableFromJson };

import { errorLogger } from './logging';
import type { Keyboard, KeyboardItem, LastText, ValArray } from '../types/types';
import { adapter } from '../main';
import { decomposeText, jsonString, parseJSON } from '../lib/string';
import { makeValidJson } from '../lib/json';

const lastText: LastText = {};
const createKeyboardFromJson = (
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

function createTextTableFromJson(val: string, textToSend: string): string | undefined {
    try {
        const substring = decomposeText(textToSend, '{json:', '}').substring;
        const array = substring.split(';');
        const itemArray: string[] = array[1].replace('[', '').replace(']', '').replace(/"/g, '').split(',');
        const valArray: ValArray[] = JSON.parse(val);

        const lengthArray: number[] = []; // Array für die Länge der Items

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
        adapter.log.debug(`Length of rows : ${jsonString(lengthArray)}`);
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
                        } else {
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
    } catch (e: any) {
        errorLogger('Error createTextTableFromJson:', e, adapter);
    }
}
export { createKeyboardFromJson, createTextTableFromJson };

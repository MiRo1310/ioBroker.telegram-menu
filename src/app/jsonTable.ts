import { decomposeText, parseJSON } from './global';
import { errorLogger } from './logging';
import type { LastText, ValArray, KeyboardItem, Keyboard } from '../types/types';
import { _this } from '../main';
import { jsonString } from '../lib/string';

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
        const array = decomposeText(text, '{json:', '}').substring.split(';');
        const headline = array[2];
        const itemArray: string[] = array[1].replace('[', '').replace(']', '').replace(/"/g, '').split(',');
        let idShoppingList = false;
        if (array.length > 3 && array[3] == 'shoppinglist') {
            idShoppingList = true;
        }

        _this.log.debug(`Val: ${val} with type: ${typeof val}`);

        const valArray: ValArray[] | undefined = parseJSON(val);
        if (!valArray) {
            return;
        }

        const keyboard: Keyboard = { inline_keyboard: [] };

        valArray.forEach((element, index) => {
            const firstRow: KeyboardItem[] = [];
            const rowArray: KeyboardItem[] = [];
            itemArray.forEach(item => {
                if (index == 0) {
                    const btnText: string = item.split(':')[1];
                    if (btnText.length > 0) {
                        firstRow.push({ text: btnText, callback_data: '1' });
                    }
                }
                if (idShoppingList) {
                    const value = element.buttondelete;
                    const valueDeleteLinkArray = decomposeText(value, "('", "')")
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
                } else {
                    rowArray.push({ text: element[item.split(':')[0]], callback_data: '1' });
                }
            });
            if (index == 0) {
                keyboard.inline_keyboard.push(firstRow);
            }
            keyboard.inline_keyboard.push(rowArray);
        });

        _this.log.debug(`Keyboard: ${jsonString(keyboard)}`);

        return { text: headline, keyboard };
    } catch (err: any) {
        errorLogger('Error createKeyboardFromJson:', err);
    }
};

function createTextTableFromJson(val: string, textToSend: string): string | undefined {
    try {
        if (!val) {
            return;
        }
        const substring = decomposeText(textToSend, '{json:', '}').substring;
        const array = substring.split(';');
        const itemArray: string[] = array[1].replace('[', '').replace(']', '').replace(/"/g, '').split(',');
        const valArray: ValArray[] = JSON.parse(val);
        // Array für die Größte Länge der Items
        const lengthArray: number[] = [];
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
        _this.log.debug(`Length of rows: ${jsonString(lengthArray)}`);
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
    } catch (e: any) {
        errorLogger('Error createTextTableFromJson:', e);
    }
}
export { createKeyboardFromJson, createTextTableFromJson };

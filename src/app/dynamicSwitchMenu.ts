import { errorLogger } from './logging';
import type { Keyboard, KeyboardItems } from '../types/types';
import { textModifier } from '../lib/utilities';
import { adapter } from '../main';

async function createDynamicSwitchMenu(
    calledValue: string,
    device: string,
    text: string,
): Promise<{ text?: string; keyboard: Keyboard; device: string } | undefined> {
    try {
        const changedCalledValue = await textModifier(calledValue);
        const splittedArray: string[] | undefined = changedCalledValue?.replace(/"/g, '').split(':');

        if (!splittedArray) {
            return;
        }
        device = splittedArray[2];
        const arrayOfValues = splittedArray[1]
            .replace('dynSwitch', '')
            .replace(/\]/g, '')
            .replace(/\[/g, '')
            .split(',');

        const lengthOfRow = parseInt(splittedArray[3]) || 6;

        const array: KeyboardItems[][] = [];
        const keyboard: Keyboard = { inline_keyboard: array };
        if (arrayOfValues) {
            let keyboardItemsArray: KeyboardItems[] = [];
            arrayOfValues.forEach((value, index: number) => {
                if (value.includes('|')) {
                    const splittedValue = value.split('|');
                    keyboardItemsArray.push({
                        text: splittedValue[0],
                        callback_data: `menu:dynS:${device}:${splittedValue[1]}`,
                    });
                } else {
                    keyboardItemsArray.push({
                        text: value,
                        callback_data: `menu:dynS:${device}:${value}`,
                    });
                }
                if (
                    ((index + 1) % lengthOfRow == 0 && index != 0 && arrayOfValues.length > 0) ||
                    index + 1 == arrayOfValues.length
                ) {
                    keyboard.inline_keyboard.push(keyboardItemsArray);
                    keyboardItemsArray = [];
                }
            });
            return { text, keyboard, device };
        }
    } catch (e: any) {
        errorLogger('Error parsing dynSwitch:', e, adapter);
    }
}
export { createDynamicSwitchMenu };

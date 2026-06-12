import type { Keyboard, KeyboardItems } from '@backend/types/types';
import { textModifier } from '@backend/lib/utilities';
import type { AppContext } from '@backend/app/appContext';

async function createDynamicSwitchMenu(
    appContext: AppContext,
    calledValue: string,
    device: string,
    text: string,
): Promise<{ text?: string; keyboard: Keyboard; device: string } | undefined> {
    const changedCalledValue = await textModifier(appContext, calledValue);
    const splittedArray: string[] | undefined = changedCalledValue?.replace(/"/g, '').split(':');

    if (!splittedArray) {
        return;
    }
    device = splittedArray[2];
    const arrayOfValues = splittedArray[1].replace('dynSwitch', '').replace(/]/g, '').replace(/\[/g, '').split(',');

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
}
export { createDynamicSwitchMenu };

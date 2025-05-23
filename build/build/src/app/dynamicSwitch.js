"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamicSwitch = dynamicSwitch;
const logging_1 = require("./logging");
const utilities_1 = require("../lib/utilities");
async function dynamicSwitch(calledValue, device, text) {
    try {
        const changedCalledValue = await (0, utilities_1.checkStatusInfo)(calledValue);
        const splittedArray = changedCalledValue?.replace(/"/g, '').split(':');
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
        const array = [];
        const keyboard = { inline_keyboard: array };
        if (arrayOfValues) {
            let keyboardItemsArray = [];
            arrayOfValues.forEach((value, index) => {
                if (value.includes('|')) {
                    const splittedValue = value.split('|');
                    keyboardItemsArray.push({
                        text: splittedValue[0],
                        callback_data: `menu:dynS:${device}:${splittedValue[1]}`,
                    });
                }
                else {
                    keyboardItemsArray.push({
                        text: value,
                        callback_data: `menu:dynS:${device}:${value}`,
                    });
                }
                if (((index + 1) % lengthOfRow == 0 && index != 0 && arrayOfValues.length > 0) ||
                    index + 1 == arrayOfValues.length) {
                    keyboard.inline_keyboard.push(keyboardItemsArray);
                    keyboardItemsArray = [];
                }
            });
            return { text, keyboard, device };
        }
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error parsing dynSwitch:', e);
    }
}

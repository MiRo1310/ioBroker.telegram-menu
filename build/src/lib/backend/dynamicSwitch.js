"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamicSwitch = void 0;
const logging_1 = require("./logging");
const utilities_1 = require("./utilities");
async function dynamicSwitch(calledValue, device2Switch, text) {
    try {
        const changedCalledValue = await (0, utilities_1.checkStatusInfo)(calledValue);
        const splittedArray = changedCalledValue?.replace(/"/g, "").split(":");
        if (!splittedArray) {
            return;
        }
        device2Switch = splittedArray[2];
        const arrayOfValues = splittedArray[1].replace("dynSwitch", "").replace(/\]/g, "").replace(/\[/g, "").split(",");
        const lengthOfRow = parseInt(splittedArray[3]) || 6;
        const array = [];
        const keyboard = { inline_keyboard: array };
        if (arrayOfValues) {
            let arrayOfEntriesDynamicSwitch = [];
            arrayOfValues.forEach((value, index) => {
                if (value.includes("|")) {
                    const splittedValue = value.split("|");
                    arrayOfEntriesDynamicSwitch.push({ text: splittedValue[0], callback_data: `menu:dynS:${device2Switch}:${splittedValue[1]}` });
                }
                else {
                    arrayOfEntriesDynamicSwitch.push({ text: value, callback_data: `menu:dynS:${device2Switch}:${value}` });
                }
                if (((index + 1) % lengthOfRow == 0 && index != 0 && arrayOfValues.length > 0) || index + 1 == arrayOfValues.length) {
                    keyboard.inline_keyboard.push(arrayOfEntriesDynamicSwitch);
                    arrayOfEntriesDynamicSwitch = [];
                }
            });
            return { text, keyboard: JSON.stringify(keyboard), device: device2Switch };
        }
    }
    catch (e) {
        (0, logging_1.error)([
            { text: "Error parsing dynSwitch:", val: e.message },
            { text: "Stack:", val: e.stack },
        ]);
    }
}
exports.dynamicSwitch = dynamicSwitch;
//# sourceMappingURL=dynamicSwitch.js.map
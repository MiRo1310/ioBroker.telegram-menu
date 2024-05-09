"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { checkStatusInfo } = require("./utilities");
async function dynamicSwitch(_this, calledValue, device2Switch, text) {
    try {
        const changedCalledValue = await checkStatusInfo(_this, calledValue);
        const splittedArray = changedCalledValue.replace(/"/g, "").split(":");
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
                else
                    arrayOfEntriesDynamicSwitch.push({ text: value, callback_data: `menu:dynS:${device2Switch}:${value}` });
                if (((index + 1) % lengthOfRow == 0 && index != 0 && arrayOfValues.length > 0) || index + 1 == arrayOfValues.length) {
                    keyboard.inline_keyboard.push(arrayOfEntriesDynamicSwitch);
                    arrayOfEntriesDynamicSwitch = [];
                }
            });
            return [text, JSON.stringify(keyboard), device2Switch];
        }
    }
    catch (e) {
        _this.log.error("Error parsing dynSwitch: " + JSON.stringify(e.message));
        _this.log.error(JSON.stringify(e.stack));
    }
}
module.exports = {
    dynamicSwitch,
};
//# sourceMappingURL=dynamicSwitch.js.map
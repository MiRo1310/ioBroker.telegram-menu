"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEchartsValues = exports.getSubmenuNumberValues = exports.getMenuValues = void 0;
exports.getProcessTimeValues = getProcessTimeValues;
exports.getBindingValues = getBindingValues;
const string_1 = require("./string");
const appUtils_1 = require("./appUtils");
const getMenuValues = (str) => {
    const splitText = str.split(':');
    return { cbData: splitText[1], menuToHandle: splitText[2], val: splitText[3] };
};
exports.getMenuValues = getMenuValues;
function getProcessTimeValues(substringExcludeSearch) {
    const array = substringExcludeSearch.split(','); //["lc","(DD MM YYYY hh:mm:ss:sss)","id:'ID'"]
    return {
        typeofTimestamp: (0, appUtils_1.getTypeofTimestamp)(array[0]),
        timeString: array[1] ?? '',
        idString: (0, string_1.replaceAllItems)(array[2] ?? '', ['id:', '}', "'"]),
    };
}
function getBindingValues(item) {
    const array = item.split(':');
    return { key: array[0], id: array[1] };
}
const getSubmenuNumberValues = (str) => {
    const splitText = str.split(':'); // submenu:number2-8-1-°C:SetMenuNumber:3
    return { callbackData: splitText[1], device: splitText[2], value: parseFloat(splitText[3]) };
};
exports.getSubmenuNumberValues = getSubmenuNumberValues;
const getEchartsValues = (preset) => {
    const splitPreset = preset.split('.');
    return `${splitPreset[0]}.${splitPreset[1]}`;
};
exports.getEchartsValues = getEchartsValues;
//# sourceMappingURL=splitValues.js.map
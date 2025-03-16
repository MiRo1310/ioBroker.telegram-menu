"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decomposeText = exports.insertNewItemsInData = void 0;
const Utils_js_1 = require("./Utils.js");
const insertParseModeCheckbox = (data) => {
    const actions = ['set', 'get'];
    Object.keys(data.action).forEach(menu => {
        actions.forEach(action => {
            data.action[menu][action].forEach((_, indexItem) => {
                const element = data.action[menu][action][indexItem];
                if (!element.parse_mode) {
                    data.action[menu][action][indexItem].parse_mode = ['false'];
                }
            });
        });
    });
    Object.keys(data.nav).forEach(menu => {
        data.nav[menu].forEach((_, indexItem) => {
            const element = data.nav[menu][indexItem];
            if (!element.parse_mode) {
                data.nav[menu][indexItem].parse_mode = 'false';
            }
        });
    });
    return data;
};
const insertAckCheckbox = (data, updateNative) => {
    Object.keys(data.action).forEach(menu => {
        data.action[menu].set.forEach((item, indexItem) => {
            const element = data.action[menu].set[indexItem];
            if (!element.ack) {
                data.action[menu].set[indexItem].ack = [];
            }
            else {
                return;
            }
            element.returnText.map((textItem, textIndex) => {
                let substring = '';
                if (textItem.includes('ack:')) {
                    if (textItem.includes('ack:true')) {
                        substring = textItem.replace('ack:true', '').replace('  ', ' ');
                        data.action[menu].set[indexItem].ack[textIndex] = 'true';
                    }
                    else {
                        substring = textItem.includes('ack:false')
                            ? textItem.replace('ack:false', '').replace('  ', ' ')
                            : textItem;
                        data.action[menu].set[indexItem].ack[textIndex] = 'false';
                    }
                    data.action[menu].set[indexItem].returnText[textIndex] = substring;
                    return;
                }
                data.action[menu].set[indexItem].ack[textIndex] = 'false';
            });
        });
    });
    updateNative('data', data);
};
const insertNewItemsInData = (data, updateNative) => {
    if (Object.keys(data).length == 0) {
        return;
    }
    const copyData = (0, Utils_js_1.deepCopy)(data);
    if (!copyData) {
        return;
    }
    insertAckCheckbox(insertParseModeCheckbox(copyData), updateNative);
};
exports.insertNewItemsInData = insertNewItemsInData;
function decomposeText(text, searchValue, secondValue) {
    const startindex = text.indexOf(searchValue);
    const endindex = text.indexOf(secondValue, startindex);
    const substring = text.substring(startindex, endindex + secondValue.length);
    const textWithoutSubstring = text.replace(substring, '').trim();
    return {
        startindex: startindex,
        endindex: endindex,
        substring: substring,
        textWithoutSubstring: textWithoutSubstring,
    };
}
exports.decomposeText = decomposeText;
//# sourceMappingURL=newValuesForNewVersion.js.map
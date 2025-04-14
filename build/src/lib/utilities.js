"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkStatusInfo = exports.checkStatus = exports.processTimeIdLc = void 0;
exports.checkTypeOfId = checkTypeOfId;
const utils_1 = require("./utils");
const string_1 = require("./string");
const logging_1 = require("../app/logging");
const time_1 = require("./time");
const main_1 = require("../main");
const config_1 = require("../config/config");
const appUtils_1 = require("./appUtils");
const processTimeIdLc = async (textToSend, id) => {
    const { substring, substringExcludeSearch } = (0, string_1.decomposeText)(textToSend, config_1.config.timestamp.start, config_1.config.timestamp.end); //{time.lc,(DD MM YYYY hh:mm:ss:sss),id:'ID'}
    const array = substringExcludeSearch.split(','); //["lc","(DD MM YYYY hh:mm:ss:sss)","id:'ID'"]
    const timestampString = array[0];
    const timeString = array[1]; //"(DD MM YYYY hh:mm:ss:sss)"
    const idString = array[2];
    const typeofTimestamp = (0, appUtils_1.getTypeofTimestamp)(timestampString); //"{time.lc"
    const idFromText = (0, string_1.replaceAllItems)(idString, ['id:', '}', "'"]); //"id:'ID'"
    if (!id && (!idFromText || idFromText.length < 5)) {
        return textToSend.replace(substring, 'Invalid ID');
    }
    const value = await main_1.adapter.getForeignStateAsync(id ?? idFromText);
    if (!value) {
        return textToSend.replace(substring, 'Invalid ID');
    }
    const timeStringUser = (0, string_1.replaceAllItems)(timeString, [',(', ')', '}']); //"(DD MM YYYY hh:mm:ss:sss)"
    const unixTs = value[typeofTimestamp];
    const timeWithPad = (0, time_1.getTimeWithPad)((0, time_1.extractTimeValues)(unixTs));
    const timeStringReplaced = (0, appUtils_1.timeStringReplacer)(timeWithPad, timeStringUser);
    return timeStringReplaced ?? textToSend;
};
exports.processTimeIdLc = processTimeIdLc;
// TODO Check Usage of function
const checkStatus = async (text) => {
    const { substring, substringExcludeSearch } = (0, string_1.decomposeText)(text, config_1.config.status.start, config_1.config.status.end); //substring {status:'ID':true} new | old {status:'id':'ID':true}
    const { id, shouldChange } = (0, appUtils_1.statusIdAndParams)(substringExcludeSearch);
    const stateValue = await main_1.adapter.getForeignStateAsync(id);
    if (!(0, utils_1.isDefined)(stateValue?.val)) {
        main_1.adapter.log.debug(`State not found: ${id}`);
        return text.replace(substring, '');
    }
    if (text.includes(config_1.config.time)) {
        text = text.replace(substring, '');
        const val = String(stateValue.val);
        return (0, time_1.integrateTimeIntoText)(text, val).replace(val, '');
    }
    if (!shouldChange) {
        return text.replace(substring, stateValue.val.toString());
    }
    const { newValue: val, textToSend, error } = (0, string_1.getValueToExchange)(main_1.adapter, text, stateValue.val);
    text = !error ? textToSend : text;
    const newValue = !error ? val : stateValue.val;
    main_1.adapter.log.debug(`CheckStatus Text: ${text} Substring: ${substring}`);
    return text.replace(substring, newValue.toString());
};
exports.checkStatus = checkStatus;
const checkStatusInfo = async (text) => {
    try {
        main_1.adapter.log.debug(`Check status Info: ${text}`);
        if (text.includes(config_1.config.status.start)) {
            while (text.includes(config_1.config.status.start)) {
                text = await (0, exports.checkStatus)(text);
            }
        }
        if (text.includes(config_1.config.timestamp.lc) || text.includes(config_1.config.timestamp.ts)) {
            text = await (0, exports.processTimeIdLc)(text);
        }
        if (text.includes(config_1.config.set.start)) {
            const result = (0, string_1.decomposeText)(text, config_1.config.set.start, config_1.config.set.end);
            const id = result.substring.split(',')[0].replace("{set:'id':", '').replace(/'/g, '');
            const importedValue = result.substring.split(',')[1];
            text = result.textExcludeSubstring;
            const convertedValue = await checkTypeOfId(id, importedValue);
            const ack = result.substring.split(',')[2].replace('}', '') == 'true';
            if (text === '') {
                text = 'Wähle eine Aktion';
            }
            if (convertedValue) {
                await main_1.adapter.setForeignStateAsync(id, convertedValue, ack);
            }
        }
        if (text) {
            main_1.adapter.log.debug(`CheckStatusInfo: ${text}`);
            return text;
        }
        return '';
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error checkStatusInfo:', e, main_1.adapter);
        return '';
    }
};
exports.checkStatusInfo = checkStatusInfo;
async function checkTypeOfId(id, value) {
    try {
        const receivedType = typeof value;
        const obj = await main_1.adapter.getForeignObjectAsync(id);
        if (!obj || !(0, utils_1.isDefined)(value)) {
            return;
        }
        if (receivedType === obj.common.type || !obj.common.type) {
            return value;
        }
        main_1.adapter.log.debug(`Change Value type from  "${receivedType}" to "${obj.common.type}"`);
        switch (obj.common.type) {
            case 'string':
                return value;
            case 'number':
                return parseFloat((0, string_1.jsonString)(value));
            case 'boolean':
                return (0, utils_1.isTruthy)(value);
        }
        return value;
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error checkTypeOfId:', e, main_1.adapter);
    }
}
//# sourceMappingURL=utilities.js.map
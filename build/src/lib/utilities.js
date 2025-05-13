"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkStatusInfo = exports.checkStatus = exports.processTimeIdLc = void 0;
exports.transformValueToTypeOfId = transformValueToTypeOfId;
const utils_1 = require("./utils");
const string_1 = require("./string");
const logging_1 = require("../app/logging");
const time_1 = require("./time");
const main_1 = require("../main");
const config_1 = require("../config/config");
const appUtils_1 = require("./appUtils");
const setstate_1 = require("../app/setstate");
const splitValues_1 = require("./splitValues");
const processTimeIdLc = async (textToSend, id) => {
    const { substring, substringExcludeSearch } = (0, string_1.decomposeText)(textToSend, config_1.config.timestamp.start, config_1.config.timestamp.end); //{time.lc,(DD MM YYYY hh:mm:ss:sss),id:'ID'}
    const { typeofTimestamp, timeString, idString } = (0, splitValues_1.getProcessTimeValues)(substringExcludeSearch);
    if (!id && (!idString || idString.length < 5)) {
        return textToSend.replace(substring, 'Invalid ID');
    }
    const value = await main_1.adapter.getForeignStateAsync(id ?? idString);
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
    const { substring, substringExcludeSearch, textExcludeSubstring } = (0, string_1.decomposeText)(text, config_1.config.status.start, config_1.config.status.end); //substring {status:'ID':true} new | old {status:'id':'ID':true}
    const { id, shouldChange } = (0, appUtils_1.statusIdAndParams)(substringExcludeSearch);
    const stateValue = await main_1.adapter.getForeignStateAsync(id);
    if (!(0, utils_1.isDefined)(stateValue?.val)) {
        main_1.adapter.log.debug(`State not found: ${id}`);
        return text.replace(substring, '');
    }
    const stateValueString = String(stateValue.val);
    if (text.includes(config_1.config.time)) {
        return (0, time_1.integrateTimeIntoText)(textExcludeSubstring, stateValueString).replace(stateValueString, '');
    }
    if (!shouldChange) {
        return text.replace(substring, stateValueString);
    }
    const { newValue: val, textToSend, error } = (0, string_1.getValueToExchange)(main_1.adapter, text, stateValue.val);
    return (!error ? textToSend : text).replace(substring, !error ? val.toString() : stateValueString);
};
exports.checkStatus = checkStatus;
const checkStatusInfo = async (text) => {
    if (!text) {
        return '';
    }
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
            const { substring, textExcludeSubstring } = (0, string_1.decomposeText)(text, config_1.config.set.start, config_1.config.set.end);
            const id = substring.split(',')[0].replace("{set:'id':", '').replace(/'/g, '');
            const importedValue = substring.split(',')[1];
            text = textExcludeSubstring;
            const convertedValue = await transformValueToTypeOfId(id, importedValue);
            const ack = substring.split(',')[2].replace('}', '') == 'true';
            if ((0, string_1.isEmptyString)(text)) {
                text = 'Wähle eine Aktion';
            }
            if (convertedValue) {
                await (0, setstate_1.setstateIobroker)({ id, value: convertedValue, ack });
            }
        }
        main_1.adapter.log.debug(`CheckStatusInfo: ${text}`);
        return text;
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error checkStatusInfo:', e, main_1.adapter);
        return '';
    }
};
exports.checkStatusInfo = checkStatusInfo;
async function transformValueToTypeOfId(id, value) {
    try {
        const receivedType = typeof value;
        const obj = await main_1.adapter.getForeignObjectAsync(id);
        if (!obj || !(0, utils_1.isDefined)(value) || (0, appUtils_1.isSameType)(receivedType, obj)) {
            return value;
        }
        main_1.adapter.log.debug(`Change Value type from "${receivedType}" to "${obj.common.type}"`);
        switch (obj.common.type) {
            case 'string':
                return String(value);
            case 'number':
                return typeof value === 'string' ? parseFloat(value) : parseFloat((0, string_1.jsonString)(value));
            case 'boolean':
                return (0, utils_1.isTruthy)(value);
            default:
                return value;
        }
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error checkTypeOfId:', e, main_1.adapter);
    }
}
//# sourceMappingURL=utilities.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.textModifier = exports.setTimeValue = void 0;
exports.transformValueToTypeOfId = transformValueToTypeOfId;
const utils_1 = require("../lib/utils");
const status_1 = require("../app/status");
const splitValues_1 = require("../lib/splitValues");
const string_1 = require("../lib/string");
const config_1 = require("../config/config");
const appUtils_1 = require("../lib/appUtils");
const time_1 = require("../lib/time");
const setstate_1 = require("../app/setstate");
const logging_1 = require("../app/logging");
const setTimeValue = async (adapter, textToSend, id) => {
    const { substring, substringExcludeSearch } = (0, string_1.decomposeText)(textToSend, config_1.config.timestamp.start, config_1.config.timestamp.end); //{time.lc,(DD MM YYYY hh:mm:ss:sss),id:'ID'}
    const { typeofTimestamp, timeString, idString } = (0, splitValues_1.getProcessTimeValues)(substringExcludeSearch);
    if (!id && (!idString || idString.length < 5)) {
        return textToSend.replace(substring, config_1.invalidId);
    }
    const value = await adapter.getForeignStateAsync(id ?? idString);
    if (!value) {
        return textToSend.replace(substring, config_1.invalidId);
    }
    const formattedTimeParams = (0, string_1.replaceAllItems)(timeString, [',(', '(', ')', '}']); //"(DD MM YYYY hh:mm:ss:sss)"
    const unixTs = value[typeofTimestamp];
    const timeWithPad = (0, time_1.getTimeWithPad)((0, time_1.extractTimeValues)(unixTs));
    const formattedTime = (0, appUtils_1.timeStringReplacer)(timeWithPad, formattedTimeParams);
    return formattedTime ? textToSend.replace(substring, formattedTime) : textToSend;
};
exports.setTimeValue = setTimeValue;
const textModifier = async (adapter, text) => {
    if (!text) {
        return '';
    }
    try {
        const inputText = text;
        while (text.includes(config_1.config.status.start)) {
            text = await (0, status_1.checkStatus)(adapter, text);
        }
        if (text.includes(config_1.config.timestamp.lc) || text.includes(config_1.config.timestamp.ts)) {
            text = await (0, exports.setTimeValue)(adapter, text);
        }
        if (text.includes(config_1.config.set.start)) {
            const { substring, textExcludeSubstring } = (0, string_1.decomposeText)(text, config_1.config.set.start, config_1.config.set.end);
            const id = substring.split(',')[0].replace("{set:'id':", '').replace(/'/g, '');
            const importedValue = substring.split(',')[1];
            text = textExcludeSubstring;
            const convertedValue = await transformValueToTypeOfId(adapter, id, importedValue);
            const ack = substring.split(',')[2]?.replace('}', '') == 'true';
            if ((0, string_1.isEmptyString)(text)) {
                text = 'Wähle eine Aktion';
            }
            if (convertedValue) {
                await (0, setstate_1.setstateIobroker)({ adapter, id, value: convertedValue, ack });
            }
        }
        text === inputText
            ? adapter.log.debug(`Return text : ${text} `)
            : adapter.log.debug(`Return text was modified from "${inputText}" to "${text}" `);
        return text;
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error returnTextModifier:', e, adapter);
        return '';
    }
};
exports.textModifier = textModifier;
async function transformValueToTypeOfId(adapter, id, value) {
    try {
        const receivedType = typeof value;
        const obj = await adapter.getForeignObjectAsync(id);
        if (!obj || !(0, utils_1.isDefined)(value) || (0, appUtils_1.isSameType)(receivedType, obj)) {
            return value;
        }
        adapter.log.debug(`Change Value type from "${receivedType}" to "${obj.common.type}"`);
        switch (obj.common.type) {
            case 'string':
                return String(value);
            case 'number':
                return typeof value === 'string' ? parseFloat(value) : parseFloat((0, string_1.jsonString)(value));
            case 'boolean':
                return (0, utils_1.isDefined)(value) && !['false', false, 0, '0', 'null', 'undefined'].includes(value);
            default:
                return value;
        }
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error checkTypeOfId:', e, adapter);
    }
}
//# sourceMappingURL=utilities.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.textModifier = exports.changeToNumber = exports.getTimeValue = void 0;
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
const getTimeValue = async (appContext, textToSend, optionalId) => {
    const { substring, substringExcludeSearch } = (0, string_1.decomposeText)(textToSend, config_1.config.timestamp.start, config_1.config.timestamp.end); //{time.lc,(DD MM YYYY hh:mm:ss:sss),id:'ID'}
    const { typeofTimestamp, timeString, idString } = (0, splitValues_1.getProcessTimeValues)(substringExcludeSearch);
    if (!optionalId && (!idString || idString.length < 5)) {
        return config_1.invalidId;
    }
    const id = (optionalId ?? idString).replace(/'/g, '').replace(/"/g, '');
    const value = await appContext.adapter.getForeignStateAsync(id);
    if (!value) {
        return config_1.invalidId;
    }
    const formattedTimeParams = (0, string_1.replaceAllItems)(timeString, [',(', '(', ')', '}']); //"(DD MM YYYY hh:mm:ss:sss)"
    const unixTs = value[typeofTimestamp];
    const timeWithPad = (0, time_1.getTimeWithPad)((0, time_1.extractTimeValues)(unixTs));
    const formattedTime = (0, appUtils_1.timeStringReplacer)(timeWithPad, formattedTimeParams);
    return textToSend.replace(substring, formattedTime).trim();
};
exports.getTimeValue = getTimeValue;
const changeToNumber = (adapter, value) => {
    const val = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(val)) {
        adapter.log.warn(`Value "${value}" is not a valid number. Returning NaN.`);
        return;
    }
    return val;
};
exports.changeToNumber = changeToNumber;
const textModifier = async (appContext, text) => {
    if (!text) {
        return '';
    }
    try {
        const inputText = text;
        while (text.includes(config_1.config.status.start)) {
            text = await (0, status_1.checkStatus)(appContext, text);
        }
        if (text.includes(config_1.config.timestamp.lc) || text.includes(config_1.config.timestamp.ts)) {
            text = await (0, exports.getTimeValue)(appContext, text);
        }
        if (text.includes(config_1.config.set.start)) {
            const { substring, textExcludeSubstring } = (0, string_1.decomposeText)(text, config_1.config.set.start, config_1.config.set.end);
            const [idString, importedValue, ackString] = substring.split(',').map(i => i?.replace(/}/g, ''));
            const id = idString?.replace("{set:'id':", '').replace(/'/g, '');
            text = textExcludeSubstring;
            const convertedValue = id && importedValue ? await transformValueToTypeOfId(appContext, id, importedValue) : undefined;
            const ack = ackString?.replace('}', '') == 'true' || false;
            if (convertedValue && id) {
                await (0, setstate_1.setstateIobroker)({ appContext, id, value: convertedValue, ack });
            }
        }
        text === inputText
            ? appContext.adapter.log.debug(`Return text : ${text} `)
            : appContext.adapter.log.debug(`Return text was modified from "${inputText}" to "${text}" `);
        return text;
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error returnTextModifier:', e, appContext.adapter);
        return '';
    }
};
exports.textModifier = textModifier;
async function transformValueToTypeOfId(appContext, id, value) {
    try {
        const receivedType = typeof value;
        const obj = await appContext.adapter.getForeignObjectAsync(id);
        if (!obj || !(0, utils_1.isDefined)(value) || (0, appUtils_1.isSameType)(receivedType, obj)) {
            return value;
        }
        appContext.adapter.log.debug(`Change Value type from "${receivedType}" to "${obj.common.type}"`);
        switch (obj.common.type) {
            case 'string':
                return String(value);
            case 'number':
                return (0, exports.changeToNumber)(appContext.adapter, value);
            case 'boolean':
                return (0, utils_1.isDefined)(value) && !['false', false, 0, '0', 'null', 'undefined'].includes(value);
            default:
                return value;
        }
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error checkTypeOfId:', e, appContext.adapter);
    }
}
//# sourceMappingURL=utilities.js.map
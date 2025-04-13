"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processTimeIdLc = exports.checkStatusInfo = void 0;
exports.checkTypeOfId = checkTypeOfId;
const utils_1 = require("./utils");
const string_1 = require("./string");
const logging_1 = require("../app/logging");
const time_1 = require("./time");
const main_1 = require("../main");
const config_1 = require("../config/config");
const appUtils_1 = require("./appUtils");
const processTimeIdLc = async (textToSend, id) => {
    const { substring } = (0, string_1.decomposeText)(textToSend, config_1.config.timestamp.start, config_1.config.timestamp.end); //{time.lc,(DD MM YYYY hh:mm:ss:sss),id:'ID'}
    const array = substring.split(',');
    let changedSubstring = substring;
    changedSubstring = changedSubstring.replace(array[0], '');
    const key = (0, appUtils_1.getTypeofTimestamp)(array[0]);
    let idFromText = '';
    if (!id) {
        if (!changedSubstring.includes('id:')) {
            main_1.adapter.log.debug(`Error processTimeIdLc: id not found in: ${changedSubstring}`);
            return;
        }
        if (array[2]) {
            idFromText = array[2].replace('id:', '').replace('}', '').replace(/'/g, '');
            changedSubstring = changedSubstring.replace(array[2], '').replace(/,/g, '');
        }
    }
    if (!id && !idFromText) {
        return;
    }
    const value = await main_1.adapter.getForeignStateAsync(id || idFromText);
    let unixTs;
    let timeStringUser;
    if (key && value) {
        timeStringUser = changedSubstring.replace(',(', '').replace(')', '').replace('}', '');
        unixTs = value[key];
    }
    if (!unixTs) {
        return;
    }
    const { ms, s, m, h, d, mo, y } = (0, time_1.getTimeWithPad)((0, time_1.extractTimeValues)(unixTs));
    if (timeStringUser) {
        if (timeStringUser.includes('sss')) {
            timeStringUser = timeStringUser.replace('sss', ms);
        }
        if (timeStringUser.includes('ss')) {
            timeStringUser = timeStringUser.replace('ss', s);
        }
        if (timeStringUser.includes('mm')) {
            timeStringUser = timeStringUser.replace('mm', m);
        }
        if (timeStringUser.includes('hh')) {
            timeStringUser = timeStringUser.replace('hh', h);
        }
        if (timeStringUser.includes('DD')) {
            timeStringUser = timeStringUser.replace('DD', d);
        }
        if (timeStringUser.includes('MM')) {
            timeStringUser = timeStringUser.replace('MM', mo);
        }
        if (timeStringUser.includes('YYYY')) {
            timeStringUser = timeStringUser.replace('YYYY', y);
        }
        if (timeStringUser.includes('YY')) {
            timeStringUser = timeStringUser.replace('YY', y.slice(-2));
        }
        timeStringUser = timeStringUser.replace('(', '').replace(')', '');
        return textToSend.replace(substring, timeStringUser);
    }
    return textToSend;
};
exports.processTimeIdLc = processTimeIdLc;
// TODO Check Usage of function
const checkStatus = async (text, processTimeValue) => {
    try {
        const substring = (0, string_1.decomposeText)(text, '{status:', '}').substring;
        let id, valueChange;
        main_1.adapter.log.debug(`Substring ${substring}`);
        if (substring.includes("status:'id':")) {
            id = substring.split(':')[2].replace("'}", '').replace(/'/g, '').replace(/}/g, '');
            valueChange = substring.split(':')[3] ? substring.split(':')[3].replace('}', '') !== 'false' : true;
        }
        else {
            id = substring.split(':')[1].replace("'}", '').replace(/'/g, '').replace(/}/g, '');
            valueChange = substring.split(':')[2] ? substring.split(':')[2].replace('}', '') !== 'false' : true;
        }
        const stateValue = await main_1.adapter.getForeignStateAsync(id);
        if (!stateValue) {
            main_1.adapter.log.debug(`State not found: ${id}`);
            return '';
        }
        if (text.includes('{time}') && processTimeValue) {
            text = text.replace(substring, '');
            const val = String(stateValue.val);
            return processTimeValue(text, val).replace(val, '');
        }
        if (!(0, utils_1.isDefined)(stateValue.val)) {
            main_1.adapter.log.debug(`State Value is undefined: ${id}`);
            return text.replace(substring, '');
        }
        if (!valueChange) {
            return text.replace(substring, stateValue.val.toString());
        }
        const { newValue: val, textToSend, error } = (0, string_1.getValueToExchange)(main_1.adapter, text, stateValue.val);
        let newValue;
        if (!error) {
            text = textToSend;
            newValue = val;
        }
        else {
            newValue = stateValue.val;
        }
        main_1.adapter.log.debug(`CheckStatus Text: ${text} Substring: ${substring}`);
        main_1.adapter.log.debug(`CheckStatus Return Value: ${text.replace(substring, newValue.toString())}`);
        return text.replace(substring, newValue.toString());
    }
    catch (e) {
        main_1.adapter.log.error(`Error checkStatus:${e.message}`);
        main_1.adapter.log.error(`Stack:${e.stack}`);
        return '';
    }
};
const checkStatusInfo = async (text) => {
    try {
        if (!text) {
            return '';
        }
        main_1.adapter.log.debug(`Text: ${text}`);
        if (text.includes('{status:')) {
            while (text.includes('{status:')) {
                text = await checkStatus(text, time_1.integrateTimeIntoText);
            }
        }
        if (text.includes('{time.lc') || text.includes('{time.ts')) {
            text = (await processTimeIdLc(text, null)) || '';
        }
        if (text.includes('{set:')) {
            const result = (0, string_1.decomposeText)(text, '{set:', '}');
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
        main_1.adapter.log.debug(`Check Type of Id: ${id}`);
        const obj = await main_1.adapter.getForeignObjectAsync(id);
        const receivedType = typeof value;
        if (!obj || !value) {
            return value;
        }
        if (receivedType === obj.common.type || !obj.common.type) {
            return value;
        }
        main_1.adapter.log.debug(`Change Value type from  "${receivedType}" to "${obj.common.type}"`);
        if (obj.common.type === 'boolean') {
            if (value == 'true') {
                value = true;
            }
            if (value == 'false') {
                value = false;
            }
            return value;
        }
        if (obj.common.type === 'string') {
            return JSON.stringify(value);
        }
        if (obj && obj.common && obj.common.type === 'number' && typeof value === 'string') {
            return parseFloat(value);
        }
        return value;
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error checkTypeOfId:', e, main_1.adapter);
    }
}
//# sourceMappingURL=utilities.js.map
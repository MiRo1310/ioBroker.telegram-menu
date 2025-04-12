"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decomposeText = exports.processTimeIdLc = exports.checkStatusInfo = void 0;
exports.checkTypeOfId = checkTypeOfId;
const main_1 = require("../main");
const global_1 = require("../app/global");
const string_1 = require("./string");
Object.defineProperty(exports, "decomposeText", { enumerable: true, get: function () { return string_1.decomposeText; } });
const logging_1 = require("../app/logging");
const time_1 = require("./time");
const processTimeIdLc = async (textToSend, id) => {
    let key = '';
    const { substring } = (0, string_1.decomposeText)(textToSend, '{time.', '}');
    const array = substring.split(',');
    let changedSubstring = substring;
    changedSubstring = changedSubstring.replace(array[0], '');
    if (array[0].includes('lc')) {
        key = 'lc';
    }
    else if (array[0].includes('ts')) {
        key = 'ts';
    }
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
    let timeValue;
    let timeStringUser;
    if (key && value) {
        timeStringUser = changedSubstring.replace(',(', '').replace(')', '').replace('}', '');
        timeValue = value[key];
    }
    if (!timeValue) {
        return;
    }
    const timeObj = new Date(timeValue);
    const milliseconds = timeObj.getMilliseconds();
    const seconds = timeObj.getSeconds();
    const minutes = timeObj.getMinutes();
    const hours = timeObj.getHours();
    const day = timeObj.getDate();
    const month = timeObj.getMonth() + 1;
    const year = timeObj.getFullYear();
    const time = {
        ms: milliseconds < 10 ? `00${milliseconds}` : milliseconds < 100 ? `0${milliseconds}` : milliseconds,
        s: seconds < 10 ? `0${seconds}` : seconds,
        m: minutes < 10 ? `0${minutes}` : minutes,
        h: hours < 10 ? `0${hours}` : hours,
        d: day < 10 ? `0${day}` : day,
        mo: month < 10 ? `0${month}` : month,
        y: year,
    };
    if (timeStringUser) {
        if (timeStringUser.includes('sss')) {
            timeStringUser = timeStringUser.replace('sss', time.ms.toString());
        }
        if (timeStringUser.includes('ss')) {
            timeStringUser = timeStringUser.replace('ss', time.s.toString());
        }
        if (timeStringUser.includes('mm')) {
            timeStringUser = timeStringUser.replace('mm', time.m.toString());
        }
        if (timeStringUser.includes('hh')) {
            timeStringUser = timeStringUser.replace('hh', time.h.toString());
        }
        if (timeStringUser.includes('DD')) {
            timeStringUser = timeStringUser.replace('DD', time.d.toString());
        }
        if (timeStringUser.includes('MM')) {
            timeStringUser = timeStringUser.replace('MM', time.mo.toString());
        }
        if (timeStringUser.includes('YYYY')) {
            timeStringUser = timeStringUser.replace('YYYY', time.y.toString());
        }
        if (timeStringUser.includes('YY')) {
            timeStringUser = timeStringUser.replace('YY', time.y.toString().slice(-2));
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
        if (!(0, global_1.isDefined)(stateValue.val)) {
            main_1.adapter.log.debug(`State Value is undefined: ${id}`);
            return text.replace(substring, '');
        }
        if (!valueChange) {
            return text.replace(substring, stateValue.val.toString());
        }
        const { newValue: val, textToSend, error } = (0, string_1.getValueToExchange)(text, stateValue.val, main_1.adapter);
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
            return;
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
            text = result.textWithoutSubstring;
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
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error checkStatusInfo:', e);
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
        (0, logging_1.errorLogger)('Error checkTypeOfId:', e);
    }
}
//# sourceMappingURL=utilities.js.map
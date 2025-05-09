"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "__esModule", { value: true });
exports.processTimeIdLc = exports.checkStatusInfo = void 0;
exports.checkTypeOfId = checkTypeOfId;
exports.changeValue = changeValue;
exports.decomposeText = decomposeText;
const main_1 = require("../main");
const global_1 = require("../app/global");
const string_1 = require("./string");
const logging_1 = require("../app/logging");
const time_1 = require("./time");
const exchangeValue = (textToSend, stateVal) => {
    const { startindex, endindex } = decomposeText(textToSend, 'change{', '}');
    let match = textToSend.substring(startindex + 'change'.length + 1, textToSend.indexOf('}', startindex));
    let objChangeValue;
    match = (0, string_1.replaceAll)(match, "'", '"');
    // TODO check type
    const { json, isValidJson } = (0, string_1.parseJSON)(`{${match}}`);
    if (isValidJson) {
        objChangeValue = json;
    }
    else {
        main_1._this.log.error(`There is a error in your input: ${match}`);
        return false;
    }
    let newValue;
    objChangeValue[String(stateVal)] ? (newValue = objChangeValue[String(stateVal)]) : (newValue = stateVal);
    return {
        valueChange: newValue,
        textToSend: textToSend.substring(0, startindex) + textToSend.substring(endindex + 1),
    };
};
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
function changeValue(textToSend, val) {
    if (textToSend.includes('change{')) {
        const result = exchangeValue(textToSend, val);
        if (!result) {
            return { textToSend: '', val: '', error: true };
        }
        if (typeof result === 'boolean') {
            return { textToSend: '', val: '', error: true };
        }
        return { textToSend: result.textToSend, val: result.valueChange, error: false };
    }
    return { textToSend: '', val: '', error: true };
}
const processTimeIdLc = async (textToSend, id) => {
    let key = '';
    const { substring } = decomposeText(textToSend, '{time.', '}');
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
            main_1._this.log.debug(`Error processTimeIdLc: id not found in: ${changedSubstring}`);
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
    const value = await main_1._this.getForeignStateAsync(id || idFromText);
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
const checkStatus = async (text, processTimeValue) => {
    try {
        const substring = decomposeText(text, '{status:', '}').substring;
        let id, valueChange;
        main_1._this.log.debug(`Substring ${substring}`);
        if (substring.includes("status:'id':")) {
            id = substring.split(':')[2].replace("'}", '').replace(/'/g, '').replace(/}/g, '');
            valueChange = substring.split(':')[3] ? substring.split(':')[3].replace('}', '') !== 'false' : true;
        }
        else {
            id = substring.split(':')[1].replace("'}", '').replace(/'/g, '').replace(/}/g, '');
            valueChange = substring.split(':')[2] ? substring.split(':')[2].replace('}', '') !== 'false' : true;
        }
        const stateValue = await main_1._this.getForeignStateAsync(id);
        if (!stateValue) {
            main_1._this.log.debug(`State not found: ${id}`);
            return '';
        }
        if (text.includes('{time}') && processTimeValue) {
            text = text.replace(substring, '');
            if (stateValue.val && typeof stateValue.val === 'string') {
                return processTimeValue(text, stateValue).replace(stateValue.val, '');
            }
        }
        if (!(0, global_1.isDefined)(stateValue.val)) {
            main_1._this.log.debug(`State Value is undefined: ${id}`);
            return text.replace(substring, '');
        }
        if (!valueChange) {
            return text.replace(substring, stateValue.val.toString());
        }
        const changedResult = changeValue(text, stateValue.val);
        let newValue;
        if (changedResult) {
            text = changedResult.textToSend;
            newValue = changedResult.val;
        }
        else {
            newValue = stateValue.val;
        }
        main_1._this.log.debug(`CheckStatus Text: ${text} Substring: ${substring} NewValue: ${substring}`);
        main_1._this.log.debug(`CheckStatus Return Value: ${text.replace(substring, newValue.toString())}`);
        return text.replace(substring, newValue.toString());
    }
    catch (e) {
        main_1._this.log.error(`Error checkStatus:${e.message}`);
        main_1._this.log.error(`Stack:${e.stack}`);
        return '';
    }
};
const checkStatusInfo = async (text) => {
    try {
        if (!text) {
            return;
        }
        main_1._this.log.debug(`Text: ${text}`);
        if (text.includes('{status:')) {
            while (text.includes('{status:')) {
                text = await checkStatus(text, time_1.processTimeValue);
            }
        }
        if (text.includes('{time.lc') || text.includes('{time.ts')) {
            text = (await processTimeIdLc(text, null)) || '';
        }
        if (text.includes('{set:')) {
            const result = decomposeText(text, '{set:', '}');
            const id = result.substring.split(',')[0].replace("{set:'id':", '').replace(/'/g, '');
            const importedValue = result.substring.split(',')[1];
            text = result.textWithoutSubstring;
            const convertedValue = await checkTypeOfId(id, importedValue);
            const ack = result.substring.split(',')[2].replace('}', '') == 'true';
            if (text === '') {
                text = 'Wähle eine Aktion';
            }
            if (convertedValue) {
                await main_1._this.setForeignStateAsync(id, convertedValue, ack);
            }
        }
        if (text) {
            main_1._this.log.debug(`CheckStatusInfo: ${text}`);
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
        main_1._this.log.debug(`Check Type of Id: ${id}`);
        const obj = await main_1._this.getForeignObjectAsync(id);
        const receivedType = typeof value;
        if (!obj || !value) {
            return value;
        }
        if (receivedType === obj.common.type || !obj.common.type) {
            return value;
        }
        main_1._this.log.debug(`Change Value type from  "${receivedType}" to "${obj.common.type}"`);
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

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "__esModule", { value: true });
exports.getState = getState;
const telegram_1 = require("./telegram");
const action_1 = require("./action");
const jsonTable_1 = require("./jsonTable");
const utilities_1 = require("../lib/utilities");
const global_1 = require("./global");
const main_1 = require("../main");
const time_1 = require("../lib/time");
const string_1 = require("../lib/string");
function getState(part, userToSend, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID) {
    let text = '';
    let i = 1;
    // Parse Mode ist nur immer im ersten Element
    const parse_mode = part.getData?.[0].parse_mode || 'false';
    part.getData?.forEach(async (element) => {
        try {
            main_1._this.log.debug(`Get Value ID: ${element.id}`);
            const specifiedSelektor = 'functions=';
            const id = element.id;
            let textToSend = '';
            if (id.indexOf(specifiedSelektor) != -1) {
                await (0, action_1.idBySelector)(id, element.text, userToSend, element.newline, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID);
                return;
            }
            if (element.text.includes('binding:')) {
                main_1._this.log.debug('Binding');
                await (0, action_1.bindingFunc)(element.text, userToSend, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, parse_mode);
                return;
            }
            await main_1._this.getForeignStateAsync(id).then(async (value) => {
                if (!(0, global_1.isDefined)(value)) {
                    main_1._this.log.error('The state is empty!');
                    return;
                }
                const valueForJson = value.val?.toString() ?? '';
                main_1._this.log.debug(`State: ${(0, string_1.jsonString)(value)}`);
                let val = valueForJson.replace(/\\/g, '').replace(/"/g, '');
                let newline = '';
                if (element.newline === 'true') {
                    newline = '\n';
                }
                if (element.text) {
                    textToSend = element.text.toString();
                    if (element.text.includes('{time.lc') || element.text.includes('{time.ts')) {
                        textToSend = (await (0, utilities_1.processTimeIdLc)(element.text, id)) || '';
                        val = '';
                    }
                    if (textToSend.includes('{time}')) {
                        textToSend = (0, time_1.processTimeValue)(textToSend, value);
                        val = '';
                    }
                    if (textToSend.includes('math:')) {
                        const result = (0, action_1.calcValue)(textToSend, val);
                        if (result) {
                            textToSend = result.textToSend;
                            val = result.val;
                            main_1._this.log.debug(`TextToSend: ${textToSend} val: ${val}`);
                        }
                    }
                    if (textToSend.includes('round:')) {
                        const result = (0, action_1.roundValue)(val, textToSend);
                        if (result) {
                            main_1._this.log.debug(`The Value was rounded ${JSON.stringify(val)} to ${JSON.stringify(result.val)}`);
                            val = result.val;
                            textToSend = result.textToSend;
                        }
                    }
                    if (textToSend.includes('{json')) {
                        if ((0, global_1.decomposeText)(textToSend, '{json', '}').substring.includes('TextTable')) {
                            const result = (0, jsonTable_1.createTextTableFromJson)(valueForJson, textToSend);
                            if (result) {
                                await (0, telegram_1.sendToTelegram)({
                                    user: userToSend,
                                    textToSend: result,
                                    keyboard: undefined,
                                    instance: telegramInstance,
                                    resize_keyboard: one_time_keyboard,
                                    one_time_keyboard: resize_keyboard,
                                    userListWithChatID: userListWithChatID,
                                    parse_mode: parse_mode,
                                });
                                return;
                            }
                            main_1._this.log.debug('Cannot create a Text-Table');
                        }
                        else {
                            const result = (0, jsonTable_1.createKeyboardFromJson)(valueForJson, textToSend, element.id, userToSend);
                            if (valueForJson && valueForJson.length > 0) {
                                if (result && result.text && result.keyboard) {
                                    (0, telegram_1.sendToTelegramSubmenu)(userToSend, result.text, result.keyboard, telegramInstance, userListWithChatID, parse_mode);
                                }
                                return;
                            }
                            await (0, telegram_1.sendToTelegram)({
                                user: userToSend,
                                textToSend: 'The state is empty!',
                                keyboard: undefined,
                                instance: telegramInstance,
                                resize_keyboard: one_time_keyboard,
                                one_time_keyboard: resize_keyboard,
                                userListWithChatID: userListWithChatID,
                                parse_mode: parse_mode,
                            });
                            main_1._this.log.debug('The state is empty!');
                            return;
                        }
                    }
                    const { val: _val, textToSend: _text, error } = (0, utilities_1.changeValue)(textToSend, val);
                    val = _val;
                    textToSend = _text;
                    if (!error) {
                        main_1._this.log.debug(`Value Changed to: ${textToSend}`);
                    }
                    else {
                        main_1._this.log.debug(`No Change`);
                    }
                    if (textToSend.indexOf('&&') != -1) {
                        text += `${textToSend.replace('&&', val.toString())}${newline}`;
                    }
                    else {
                        text += `${textToSend} ${val}${newline}`;
                    }
                }
                else {
                    text += `${val} ${newline}`;
                }
                main_1._this.log.debug(`Text: ${text}`);
                if (i == part.getData?.length) {
                    if (userToSend) {
                        await (0, telegram_1.sendToTelegram)({
                            user: userToSend,
                            textToSend: text,
                            keyboard: undefined,
                            instance: telegramInstance,
                            resize_keyboard: one_time_keyboard,
                            one_time_keyboard: resize_keyboard,
                            userListWithChatID: userListWithChatID,
                            parse_mode: parse_mode,
                        });
                    }
                }
                i++;
            });
        }
        catch (error) {
            error({
                array: [
                    { text: 'Error GetData:', val: error.message },
                    { text: 'Stack:', val: error.stack },
                ],
            });
        }
    });
}

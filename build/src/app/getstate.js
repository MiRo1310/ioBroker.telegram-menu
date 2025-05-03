"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getState = getState;
const telegram_1 = require("./telegram");
const action_1 = require("./action");
const jsonTable_1 = require("./jsonTable");
const utilities_1 = require("../lib/utilities");
const utils_1 = require("../lib/utils");
const main_1 = require("../main");
const time_1 = require("../lib/time");
const string_1 = require("../lib/string");
const appUtils_1 = require("../lib/appUtils");
const config_1 = require("../config/config");
const logging_1 = require("./logging");
function isLastElement(i, array) {
    return i == array?.length;
}
function getState(part, userToSend, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID) {
    let createdText = '';
    let i = 1;
    const parse_mode = part.getData?.[0].parse_mode; // Parse Mode ist nur immer im ersten Element
    part.getData?.forEach(async ({ newline, text, id }) => {
        try {
            main_1.adapter.log.debug(`Get Value ID: ${id}`);
            if (id.includes(config_1.config.functionSelektor)) {
                await (0, action_1.idBySelector)({
                    selector: id,
                    text,
                    userToSend,
                    newline,
                    telegramInstance,
                    one_time_keyboard,
                    resize_keyboard,
                    userListWithChatID,
                });
                return;
            }
            if (text.includes(config_1.config.binding.start)) {
                await (0, action_1.bindingFunc)(text, userToSend, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, parse_mode);
                return;
            }
            const state = await main_1.adapter.getForeignStateAsync(id);
            if (!(0, utils_1.isDefined)(state)) {
                main_1.adapter.log.error('The state is empty!');
                return;
            }
            const stateValue = (0, string_1.cleanUpString)(state.val?.toString());
            let modifiedStateVal = stateValue;
            let modifiedTextToSend = text;
            if (text.includes(config_1.config.timestamp.ts) || text.includes(config_1.config.timestamp.lc)) {
                modifiedTextToSend = await (0, utilities_1.processTimeIdLc)(text, id);
                modifiedStateVal = '';
            }
            if (modifiedTextToSend.includes(config_1.config.time)) {
                modifiedTextToSend = (0, time_1.integrateTimeIntoText)(modifiedTextToSend, stateValue);
                modifiedStateVal = '';
            }
            if (modifiedTextToSend.includes(config_1.config.math.start)) {
                const { textToSend, calculated, error } = (0, appUtils_1.calcValue)(modifiedTextToSend, modifiedStateVal, main_1.adapter);
                if (!error) {
                    modifiedTextToSend = textToSend;
                    modifiedStateVal = calculated;
                    main_1.adapter.log.debug(`TextToSend: ${modifiedTextToSend} val: ${modifiedStateVal}`);
                }
            }
            if (modifiedTextToSend.includes(config_1.config.round.start)) {
                const { error, text, roundedValue } = (0, appUtils_1.roundValue)(String(modifiedStateVal), modifiedTextToSend);
                if (!error) {
                    main_1.adapter.log.debug(`Rounded from ${(0, string_1.jsonString)(modifiedStateVal)} to ${(0, string_1.jsonString)(roundedValue)}`);
                    modifiedStateVal = roundedValue;
                    modifiedTextToSend = text;
                }
            }
            if (modifiedTextToSend.includes(config_1.config.json.start)) {
                const { substring } = (0, string_1.decomposeText)(modifiedTextToSend, config_1.config.json.start, config_1.config.json.end);
                if (substring.includes(config_1.config.json.textTable)) {
                    const result = (0, jsonTable_1.createTextTableFromJson)(stateValue, modifiedTextToSend);
                    if (result) {
                        await (0, telegram_1.sendToTelegram)({
                            userToSend,
                            textToSend: result,
                            telegramInstance,
                            resize_keyboard,
                            one_time_keyboard,
                            userListWithChatID,
                            parse_mode,
                        });
                        return;
                    }
                    main_1.adapter.log.debug('Cannot create a Text-Table');
                }
                else {
                    const result = (0, jsonTable_1.createKeyboardFromJson)(stateValue, modifiedTextToSend, id, userToSend);
                    if (stateValue && stateValue.length > 0) {
                        if (result && result.text && result.keyboard) {
                            (0, telegram_1.sendToTelegramSubmenu)(userToSend, result.text, result.keyboard, telegramInstance, userListWithChatID, parse_mode);
                        }
                        return;
                    }
                    await (0, telegram_1.sendToTelegram)({
                        userToSend,
                        textToSend: 'The state is empty!',
                        telegramInstance,
                        resize_keyboard,
                        one_time_keyboard,
                        userListWithChatID,
                        parse_mode,
                    });
                    main_1.adapter.log.debug('The state is empty!');
                    return;
                }
            }
            const { newValue: _val, textToSend: _text, error, } = (0, string_1.getValueToExchange)(main_1.adapter, modifiedTextToSend, modifiedStateVal);
            modifiedStateVal = String(_val);
            modifiedTextToSend = _text;
            main_1.adapter.log.debug(!error ? `Value Changed to: ${modifiedTextToSend}` : `No Change`);
            const isNewline = (0, string_1.getNewline)(newline);
            createdText += modifiedTextToSend.includes(config_1.config.rowSplitter)
                ? `${modifiedTextToSend.replace(config_1.config.rowSplitter, modifiedStateVal.toString())}${isNewline}`
                : `${modifiedTextToSend} ${modifiedStateVal} ${isNewline}`;
            main_1.adapter.log.debug(`Text: ${createdText}`);
            if (isLastElement(i, part.getData)) {
                await (0, telegram_1.sendToTelegram)({
                    userToSend,
                    textToSend: createdText,
                    telegramInstance,
                    resize_keyboard,
                    one_time_keyboard,
                    userListWithChatID,
                    parse_mode,
                });
            }
            i++;
        }
        catch (error) {
            (0, logging_1.errorLogger)('Error GetData:', error, main_1.adapter);
        }
    });
}
//# sourceMappingURL=getstate.js.map
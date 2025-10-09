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
const exchangeValue_1 = require("../lib/exchangeValue");
const idBySelector_1 = require("./idBySelector");
const parseMode_1 = require("./parseMode");
async function getState(instance, part, userToSend, telegramParams) {
    try {
        const parse_mode = (0, parseMode_1.isParseModeFirstElement)(part);
        const valueArrayForCorrectOrder = [];
        const promises = (part.getData || []).map(async ({ newline, text, id }, index) => {
            main_1.adapter.log.debug(`Get Value ID: ${id}`);
            if (id.includes(config_1.config.functionSelektor)) {
                await (0, idBySelector_1.idBySelector)({
                    instance,
                    adapter: main_1.adapter,
                    selector: id,
                    text,
                    userToSend,
                    newline,
                    telegramParams,
                });
                return;
            }
            if (text.includes(config_1.config.binding.start)) {
                await (0, action_1.bindingFunc)(instance, text, userToSend, telegramParams, parse_mode);
                return;
            }
            const state = await main_1.adapter.getForeignStateAsync(id);
            if (!(0, utils_1.isDefined)(state)) {
                main_1.adapter.log.error('The state is empty!');
                valueArrayForCorrectOrder[index] = 'N/A';
                return Promise.resolve();
            }
            const stateValue = (0, string_1.cleanUpString)(state.val?.toString());
            let modifiedStateVal = stateValue;
            let modifiedTextToSend = text;
            if (text.includes(config_1.config.timestamp.ts) || text.includes(config_1.config.timestamp.lc)) {
                modifiedTextToSend = await (0, utilities_1.setTimeValue)(main_1.adapter, text, id);
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
                    main_1.adapter.log.debug(`textToSend : ${modifiedTextToSend} val : ${modifiedStateVal}`);
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
                            instance,
                            userToSend,
                            textToSend: result,
                            telegramParams,
                            parse_mode,
                        });
                        return;
                    }
                    main_1.adapter.log.debug('Cannot create a Text-Table');
                }
                else {
                    const result = (0, jsonTable_1.createKeyboardFromJson)(stateValue, modifiedTextToSend, id, userToSend);
                    if (stateValue && stateValue.length > 0) {
                        if (result?.text && result?.keyboard) {
                            (0, telegram_1.sendToTelegramSubmenu)(instance, userToSend, result.text, result.keyboard, telegramParams, parse_mode);
                        }
                        return;
                    }
                    await (0, telegram_1.sendToTelegram)({
                        instance,
                        userToSend,
                        textToSend: 'The state is empty!',
                        telegramParams,
                        parse_mode,
                    });
                    main_1.adapter.log.debug('The state is empty!');
                    return;
                }
            }
            const { textToSend: _text, error } = (0, exchangeValue_1.exchangeValue)(main_1.adapter, modifiedTextToSend, modifiedStateVal);
            const isNewline = (0, string_1.getNewline)(newline);
            modifiedTextToSend = `${_text} ${isNewline}`;
            main_1.adapter.log.debug(!error ? `Value Changed to: ${modifiedTextToSend}` : `No Change`);
            valueArrayForCorrectOrder[index] = modifiedTextToSend;
        });
        await Promise.all(promises);
        if (valueArrayForCorrectOrder.length) {
            await (0, telegram_1.sendToTelegram)({
                instance,
                userToSend,
                textToSend: valueArrayForCorrectOrder.join(''),
                telegramParams,
                parse_mode,
            });
        }
    }
    catch (error) {
        (0, logging_1.errorLogger)('Error GetData:', error, main_1.adapter);
    }
}
//# sourceMappingURL=getstate.js.map
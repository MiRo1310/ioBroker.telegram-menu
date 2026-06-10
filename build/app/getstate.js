"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getState = getState;
const config_1 = require("../config/config");
const parseMode_1 = require("../app/parseMode");
const idBySelector_1 = require("../app/idBySelector");
const action_1 = require("../app/action");
const utils_1 = require("../lib/utils");
const string_1 = require("../lib/string");
const utilities_1 = require("../lib/utilities");
const time_1 = require("../lib/time");
const appUtils_1 = require("../lib/appUtils");
const jsonTable_1 = require("../app/jsonTable");
const telegram_1 = require("../app/telegram");
const exchangeValue_1 = require("../lib/exchangeValue");
const logging_1 = require("../app/logging");
async function getState(instance, part, userToSend, appContext) {
    try {
        const parse_mode = (0, parseMode_1.isParseModeFirstElement)(part);
        const valueArrayForCorrectOrder = [];
        const promises = (part.getData || []).map(async ({ newline, text, id }, index) => {
            appContext.adapter.log.debug(`Get Value ID: ${id}`);
            if (id.includes(config_1.config.functionSelektor)) {
                await (0, idBySelector_1.idBySelector)({
                    instance,
                    selector: id,
                    text,
                    userToSend,
                    newline,
                    appContext,
                });
                return;
            }
            if (text.includes(config_1.config.binding.start)) {
                await (0, action_1.bindingFunc)(appContext, instance, text, userToSend, parse_mode);
                return;
            }
            const state = await appContext.adapter.getForeignStateAsync(id);
            if (!(0, utils_1.isDefined)(state)) {
                appContext.adapter.log.error('The state is empty!');
                valueArrayForCorrectOrder[index] = 'N/A';
                return Promise.resolve();
            }
            const stateValue = state.val?.toString() ?? '';
            const cleanedString = (0, string_1.cleanUpString)(stateValue);
            let modifiedStateVal = cleanedString;
            let modifiedTextToSend = text;
            if (text.includes(config_1.config.timestamp.ts) || text.includes(config_1.config.timestamp.lc)) {
                modifiedTextToSend = await (0, utilities_1.getTimeValue)(appContext, text, id);
                modifiedStateVal = '';
            }
            if (modifiedTextToSend.includes(config_1.config.time)) {
                modifiedTextToSend = (0, time_1.integrateTimeIntoText)(modifiedTextToSend, cleanedString);
                modifiedStateVal = '';
            }
            const { textToSend, calculated, error: err, } = (0, appUtils_1.mathFunction)(modifiedTextToSend, modifiedStateVal, appContext.adapter);
            if (!err) {
                modifiedTextToSend = textToSend;
                modifiedStateVal = calculated;
                appContext.adapter.log.debug(`textToSend : ${modifiedTextToSend} val : ${modifiedStateVal}`);
            }
            if (modifiedTextToSend.includes(config_1.config.round.start)) {
                const { error, text, roundedValue } = (0, appUtils_1.roundValue)(String(modifiedStateVal), modifiedTextToSend);
                if (!error) {
                    appContext.adapter.log.debug(`Rounded from ${(0, string_1.jsonString)(modifiedStateVal)} to ${(0, string_1.jsonString)(roundedValue)}`);
                    modifiedStateVal = roundedValue;
                    modifiedTextToSend = text;
                }
            }
            if (modifiedTextToSend.includes(config_1.config.json.textTable)) {
                const result = (0, jsonTable_1.createTextTableFromJson)(appContext.adapter, cleanedString, modifiedTextToSend);
                if (result) {
                    await (0, telegram_1.sendToTelegram)({
                        instance,
                        userToSend,
                        textToSend: result,
                        appContext,
                        parse_mode: false,
                        shouldCleanUpString: false,
                    });
                    return;
                }
                appContext.adapter.log.debug('Cannot create a Text-Table');
            }
            if (modifiedTextToSend.includes('alexaShoppingList')) {
                const result = (0, jsonTable_1.createKeyboardFromJson)(appContext, stateValue, modifiedTextToSend, id, userToSend, instance);
                if (stateValue && stateValue.length > 0) {
                    if (result?.text && result?.keyboard) {
                        (0, telegram_1.sendToTelegramSubmenu)(instance, userToSend, result.text, result.keyboard, appContext, parse_mode);
                    }
                    return;
                }
                await (0, telegram_1.sendToTelegram)({
                    instance,
                    userToSend,
                    textToSend: 'The state is empty!',
                    appContext,
                    parse_mode,
                });
                appContext.adapter.log.debug('The state is empty!');
                return;
            }
            const { textToSend: _text, error } = (0, exchangeValue_1.exchangeValue)(appContext, modifiedTextToSend, modifiedStateVal);
            const isNewline = (0, string_1.ifTruthyAddNewLine)(newline);
            modifiedTextToSend = `${_text} ${isNewline}`;
            appContext.adapter.log.debug(!error ? `Value Changed to: ${modifiedTextToSend}` : `No Change`);
            valueArrayForCorrectOrder[index] = modifiedTextToSend;
        });
        await Promise.all(promises);
        if (valueArrayForCorrectOrder.length) {
            await (0, telegram_1.sendToTelegram)({
                instance,
                userToSend,
                textToSend: valueArrayForCorrectOrder.join(''),
                appContext,
                parse_mode,
            });
        }
    }
    catch (error) {
        (0, logging_1.errorLogger)('Error GetData:', error, appContext.adapter);
    }
}
//# sourceMappingURL=getstate.js.map
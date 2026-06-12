"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getState = getState;
const config_1 = require("../config/config");
const parseMode_1 = require("../app/parseMode");
const idBySelector_1 = require("../app/idBySelector");
const action_1 = require("../app/action");
const utils_1 = require("../lib/utils");
const string_1 = require("../lib/string");
const jsonTable_1 = require("../app/jsonTable");
const telegram_1 = require("../app/telegram");
const exchangeValue_1 = require("../lib/exchangeValue");
const stateValueTransformer_1 = require("../app/stateValueTransformer");
async function getState(instance, part, userToSend, appContext) {
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
        const transformer = new stateValueTransformer_1.StateValueTransformer(text, cleanedString, appContext);
        await transformer.applyTimestamp(id);
        transformer.applyTime();
        transformer.applyMath();
        transformer.applyRound();
        let modifiedTextToSend = transformer.text;
        const modifiedStateVal = transformer.stateVal;
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
//# sourceMappingURL=getstate.js.map
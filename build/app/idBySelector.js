"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idBySelector = void 0;
const config_1 = require("../config/config");
const exchangeValue_1 = require("../lib/exchangeValue");
const string_1 = require("../lib/string");
const telegram_1 = require("../app/telegram");
const logging_1 = require("../app/logging");
const idBySelector = async ({ instance, adapter, selector, text, userToSend, newline, telegramParams, }) => {
    let text2Send = '';
    try {
        const functions = selector.replace(config_1.config.functionSelektor, '');
        let enums = [];
        const result = await adapter.getEnumsAsync();
        const enumsFunctions = result?.['enum.functions'][`enum.functions.${functions}`];
        if (!enumsFunctions) {
            return;
        }
        enums = enumsFunctions.common.members;
        if (!enums) {
            return;
        }
        const promises = enums.map(async (id) => {
            const value = await adapter.getForeignStateAsync(id);
            let newText = text;
            if (text.includes('{common.name}')) {
                const result = await adapter.getForeignObjectAsync(id);
                newText = newText.replace('{common.name}', getCommonName({ name: result?.common.name, adapter }));
            }
            if (text.includes('{folder.name}')) {
                const result = await adapter.getForeignObjectAsync(removeLastPartOfId(id));
                newText = newText.replace('{folder.name}', getCommonName({ name: result?.common.name, adapter }));
            }
            const { textToSend } = (0, exchangeValue_1.exchangeValue)(adapter, newText, value?.val ?? '');
            text2Send += textToSend;
            text2Send += (0, string_1.ifTruthyAddNewLine)(newline);
            adapter.log.debug(`Text to send:  ${JSON.stringify(text2Send)}`);
        });
        Promise.all(promises)
            .then(async () => {
            await (0, telegram_1.sendToTelegram)({
                instance,
                userToSend,
                textToSend: text2Send,
                telegramParams,
            });
        })
            .catch(e => {
            (0, logging_1.errorLogger)('Error Promise', e, adapter);
        });
    }
    catch (error) {
        (0, logging_1.errorLogger)('Error idBySelector', error, adapter);
    }
};
exports.idBySelector = idBySelector;
function getCommonName({ name, adapter }) {
    const language = adapter.language ?? 'en';
    if (!name) {
        return '';
    }
    if (typeof name === 'string') {
        return name;
    }
    if (language) {
        return name[language] ?? '';
    }
    return '';
}
function removeLastPartOfId(id) {
    const parts = id.split('.');
    parts.pop();
    return parts.join('.');
}
//# sourceMappingURL=idBySelector.js.map
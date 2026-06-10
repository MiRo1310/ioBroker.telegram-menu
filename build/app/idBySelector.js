"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idBySelector = void 0;
const config_1 = require("../config/config");
const exchangeValue_1 = require("../lib/exchangeValue");
const string_1 = require("../lib/string");
const telegram_1 = require("../app/telegram");
const logging_1 = require("../app/logging");
const idBySelector = async ({ instance, selector, text, userToSend, newline, appContext, }) => {
    let text2Send = '';
    try {
        const functions = selector.replace(config_1.config.functionSelektor, '');
        let enums = [];
        const result = await appContext.adapter.getEnumsAsync();
        const enumsFunctions = result?.['enum.functions'][`enum.functions.${functions}`];
        if (!enumsFunctions) {
            return;
        }
        enums = enumsFunctions.common.members;
        if (!enums) {
            return;
        }
        const promises = enums.map(async (id) => {
            const value = await appContext.adapter.getForeignStateAsync(id);
            let newText = text;
            if (text.includes('{common.name}')) {
                const result = await appContext.adapter.getForeignObjectAsync(id);
                newText = newText.replace('{common.name}', getCommonName({ name: result?.common.name, appContext }));
            }
            if (text.includes('{folder.name}')) {
                const result = await appContext.adapter.getForeignObjectAsync(removeLastPartOfId(id));
                newText = newText.replace('{folder.name}', getCommonName({ name: result?.common.name, appContext }));
            }
            const { textToSend } = (0, exchangeValue_1.exchangeValue)(appContext, newText, value?.val ?? '');
            text2Send += textToSend;
            text2Send += (0, string_1.ifTruthyAddNewLine)(newline);
            appContext.adapter.log.debug(`Text to send:  ${JSON.stringify(text2Send)}`);
        });
        Promise.all(promises)
            .then(async () => {
            await (0, telegram_1.sendToTelegram)({
                instance,
                userToSend,
                textToSend: text2Send,
                appContext,
            });
        })
            .catch(e => {
            (0, logging_1.errorLogger)('Error Promise', e, appContext.adapter);
        });
    }
    catch (error) {
        (0, logging_1.errorLogger)('Error idBySelector', error, appContext.adapter);
    }
};
exports.idBySelector = idBySelector;
function getCommonName({ name, appContext }) {
    const language = appContext.adapter.language ?? 'en';
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
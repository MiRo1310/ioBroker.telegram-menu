"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSetState = exports.setstateIobroker = void 0;
exports.resolveIdExpression = resolveIdExpression;
exports.parseForeignId = parseForeignId;
exports.buildReturnText = buildReturnText;
exports.resolveIdReferences = resolveIdReferences;
const config_1 = require("../config/config");
const string_1 = require("../lib/string");
const utilities_1 = require("../lib/utilities");
const utils_1 = require("../lib/utils");
const exchangeValue_1 = require("../lib/exchangeValue");
const appUtils_1 = require("../lib/appUtils");
const dynamicValue_1 = require("../app/dynamicValue");
const telegram_1 = require("../app/telegram");
const modifiedValue = (valueFromSubmenu, value) => {
    /* istanbul ignore next */
    return value.includes(config_1.config.modifiedValue)
        ? value.replace(config_1.config.modifiedValue, valueFromSubmenu)
        : valueFromSubmenu;
};
async function resolveIdExpression(appContext, text) {
    const startValue = '{id:';
    const endValue = '}';
    if (text.includes(startValue)) {
        const { substring, substringExcludeSearch: id } = (0, string_1.decomposeText)(text, startValue, endValue);
        const state = await appContext.adapter.getForeignStateAsync((0, string_1.removeQuotes)(id));
        if (!(0, utils_1.isDefined)(state?.val)) {
            appContext.adapter.log.warn(`State with id ${id} not found or has no value`);
            return (0, string_1.removeDuplicateSpaces)(text.replace(substring, ''));
        }
        if (!text.includes('{math:')) {
            const res = (0, string_1.removeDuplicateSpaces)(text.replace(substring, ''));
            return (0, exchangeValue_1.exchangeValue)(appContext, res, String(state.val), true).textToSend;
        }
        const newValue = text.replace(substring, '');
        const { error, textToSend, calculated } = (0, appUtils_1.mathFunction)(newValue, String(state?.val), appContext.adapter);
        /* istanbul ignore next */
        return error ? String(state?.val) : (0, exchangeValue_1.exchangeValue)(appContext, textToSend, String(calculated), true).textToSend;
    }
    return (0, string_1.removeDuplicateSpaces)(text);
}
const setstateIobroker = async ({ id, value, ack, appContext, }) => {
    const val = await (0, utilities_1.transformValueToTypeOfId)(appContext, id, value);
    appContext.adapter.log.debug(`Value to Set: ${(0, string_1.jsonString)(val)}`);
    if ((0, utils_1.isDefined)(val)) {
        await appContext.adapter.setForeignStateAsync(id, val, ack);
    }
};
exports.setstateIobroker = setstateIobroker;
const setValue = async (appContext, id, value, valueFromSubmenu, ack) => {
    appContext.adapter.log.debug(`Value to Set: ${(0, string_1.jsonString)(value)}`);
    const valueToSet = (0, utils_1.isDefined)(value) && (0, string_1.isNonEmptyString)(value)
        ? await resolveIdExpression(appContext, value)
        : modifiedValue(String(valueFromSubmenu), value ?? '');
    appContext.adapter.log.debug(`Value to Set: ${(0, string_1.jsonString)(valueToSet)}`);
    await (0, exports.setstateIobroker)({ appContext, id, value: valueToSet, ack });
    return valueToSet;
};
const foreignIdStart = '{"foreignId":"';
function handleUpdateFromForeignId(returnText) {
    return returnText.includes(foreignIdStart);
}
function parseForeignId(returnText) {
    const { substring } = (0, string_1.decomposeText)(returnText, foreignIdStart, '}');
    const { json, isValidJson } = (0, string_1.parseJSON)(substring);
    if (!isValidJson || !json.foreignId) {
        return null;
    }
    return {
        foreignId: json.foreignId,
        text: json.text,
        resolvedText: returnText.replace(substring, json.text),
    };
}
async function buildReturnText(appContext, returnText, valueToTelegram) {
    const { textToSend } = (0, exchangeValue_1.exchangeValue)(appContext, (0, string_1.singleQuotesToDoubleQuotes)(returnText), valueToTelegram);
    return await resolveIdReferences(appContext, textToSend);
}
async function resolveIdReferences(appContext, text, maxIterations = 20) {
    let result = text;
    let i = 0;
    while (result.includes('{id:') && i < maxIterations) {
        result = await resolveIdExpression(appContext, result);
        i++;
    }
    if (i === maxIterations && result.includes('{id:')) {
        appContext.adapter.log.warn(`resolveIdReferences: iteration limit (${maxIterations}) reached — unresolved {id:} in: "${text}"`);
    }
    return result;
}
async function handleSwitchItem(appContext, instance, switchDef, userToSend, valueFromSubmenu) {
    const { returnText: text, id: switchId, parse_mode, confirm, ack, toggle, value } = switchDef;
    let idToGetValueFrom = switchId;
    let returnText = text;
    const useForeignId = handleUpdateFromForeignId(returnText);
    if (returnText.includes('{setDynamicValue')) {
        const { confirmText, id } = await dynamicValue_1.dynamicValue.setValue({
            instance,
            returnText,
            ack,
            id: idToGetValueFrom,
            userToSend,
            appContext,
            parse_mode,
            confirm,
        });
        if (confirm && id) {
            await appContext.stateIdRegistry.addIds(appContext.adapter, {
                id,
                confirm,
                returnText: confirmText,
                userToSend,
                instance,
            });
        }
        return;
    }
    let valueToTelegram = valueFromSubmenu ?? value;
    if (useForeignId) {
        returnText = (0, string_1.singleQuotesToDoubleQuotes)(returnText);
        const { substring } = (0, string_1.decomposeText)(returnText, foreignIdStart, '}');
        const { json, isValidJson } = (0, string_1.parseJSON)(substring);
        if (!isValidJson || !json.foreignId) {
            return;
        }
        idToGetValueFrom = json.foreignId;
        returnText = returnText.replace(substring, json.text);
        await appContext.stateIdRegistry.addIds(appContext.adapter, {
            id: json.foreignId,
            confirm: true,
            returnText: json.text,
            userToSend,
            instance,
        });
    }
    if (toggle) {
        const state = await appContext.adapter.getForeignStateAsync(switchId);
        const newValue = state ? !state.val : false;
        await (0, exports.setstateIobroker)({ appContext, id: switchId, value: newValue, ack });
        valueToTelegram = newValue;
    }
    else {
        const modifiedVal = await setValue(appContext, switchId, value, valueFromSubmenu, ack);
        if ((0, utils_1.isDefined)(modifiedVal)) {
            valueToTelegram = modifiedVal;
        }
    }
    if (useForeignId) {
        const state = await appContext.adapter.getForeignStateAsync(idToGetValueFrom);
        /* istanbul ignore next */
        valueToTelegram = state ? state.val : valueToTelegram;
    }
    if (confirm && !useForeignId) {
        if (appContext.stateIdRegistry.getIds().some(e => e.id === idToGetValueFrom)) {
            appContext.adapter.log.error(`Double-send detected: ID "${idToGetValueFrom}" is registered in stateIdRegistry AND confirm-path fires — check confirm/useForeignId logic.`);
        }
        const textToSend = await buildReturnText(appContext, returnText, valueToTelegram);
        const telegramData = { instance, userToSend, textToSend, appContext, parse_mode };
        await (0, telegram_1.sendToTelegram)(telegramData);
        return telegramData;
    }
}
const handleSetState = async (appContext, instance, part, userToSend, valueFromSubmenu) => {
    if (!part.switch) {
        return;
    }
    for (const switchDef of part.switch) {
        const result = await handleSwitchItem(appContext, instance, switchDef, userToSend, valueFromSubmenu);
        if (result)
            return result;
    }
};
exports.handleSetState = handleSetState;
//# sourceMappingURL=setstate.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkStatus = void 0;
const string_1 = require("../lib/string");
const config_1 = require("../config/config");
const appUtils_1 = require("../lib/appUtils");
const utils_1 = require("../lib/utils");
const time_1 = require("../lib/time");
const exchangeValue_1 = require("../lib/exchangeValue");
const checkStatus = async (adapter, text) => {
    const { substring, substringExcludeSearch, textExcludeSubstring } = (0, string_1.decomposeText)(text, config_1.config.status.start, config_1.config.status.end); //substring {status:'ID':true} new | old {status:'id':'ID':true}
    const { id, shouldChangeByStatusParameter } = (0, appUtils_1.statusIdAndParams)(substringExcludeSearch);
    const stateValue = await adapter.getForeignStateAsync(id);
    if (!(0, utils_1.isDefined)(stateValue?.val)) {
        adapter.log.debug(`State not found for id : "${id}"`);
        return text.replace(substring, '');
    }
    const stateValueString = String(stateValue.val);
    if (text.includes(config_1.config.time)) {
        return (0, time_1.integrateTimeIntoText)(textExcludeSubstring, stateValueString).replace(stateValueString, '');
    }
    const modifiedText = text.replace(substring, '&&');
    const { textToSend, error } = (0, exchangeValue_1.exchangeValue)(adapter, modifiedText, stateValue.val, shouldChangeByStatusParameter);
    return !error ? textToSend : modifiedText;
};
exports.checkStatus = checkStatus;
//# sourceMappingURL=status.js.map
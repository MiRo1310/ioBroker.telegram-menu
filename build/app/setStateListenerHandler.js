"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetStateListenerHandler = void 0;
const string_1 = require("../lib/string");
const utils_1 = require("../lib/utils");
const exchangeValue_1 = require("../lib/exchangeValue");
const telegram_1 = require("../app/telegram");
class SetStateListenerHandler {
    appContext;
    constructor(appContext) {
        this.appContext = appContext;
    }
    async handleSetStateListener(state, setStateIdsToListenTo, id) {
        if (state && setStateIdsToListenTo?.find(element => element.id == id)) {
            this.appContext.adapter.log.debug(`Subscribed state changed: { id : ${id} , state : ${(0, string_1.jsonString)(state)} }`);
            for (const el of setStateIdsToListenTo) {
                const { id: elId, userToSend, confirm, returnText, parse_mode } = el;
                const key = setStateIdsToListenTo.indexOf(el);
                if (elId == id) {
                    this.appContext.adapter.log.debug(`Send Value: ${(0, string_1.jsonString)(el)}`);
                    this.appContext.adapter.log.debug(`State: ${(0, string_1.jsonString)(state)}`);
                    if (await this.handlePreConfirm(confirm, state, returnText, el, userToSend, parse_mode)) {
                        continue;
                    }
                    this.appContext.adapter.log.debug(`Data: ${(0, string_1.jsonString)({ confirm, ack: state?.ack, val: state?.val })}`);
                    await this.handlePostConfirm(confirm, state, returnText, el, userToSend, parse_mode, setStateIdsToListenTo, key);
                }
            }
        }
    }
    async handlePreConfirm(confirm, state, returnText, el, userToSend, parse_mode) {
        if ((0, utils_1.isTruthy)(confirm) && !state?.ack && returnText?.includes('{confirmSet:')) {
            const { substring } = (0, string_1.decomposeText)(returnText, '{confirmSet:', '}');
            const splitSubstring = substring.split(':');
            let text = '';
            if ((0, utils_1.isDefined)(state.val)) {
                text = splitSubstring[2]?.includes('noValue')
                    ? splitSubstring[1]
                    : (0, exchangeValue_1.exchangePlaceholderWithValue)(splitSubstring[1], state.val.toString());
            }
            this.appContext.adapter.log.debug(`Return-text: ${text}`);
            if (text === '') {
                this.appContext.adapter.log.error('The return text cannot be empty, please check.');
            }
            await (0, telegram_1.sendToTelegram)({
                instance: el.instance,
                textToSend: text,
                parse_mode: parse_mode,
                userToSend,
                appContext: this.appContext,
            });
            return true;
        }
        return false;
    }
    async handlePostConfirm(confirm, state, returnText, el, userToSend, parse_mode, setStateIdsToListenTo, key) {
        if (!(0, utils_1.isFalsy)(confirm) && state?.ack) {
            let textToSend = returnText;
            if (textToSend?.includes('{confirmSet:')) {
                textToSend = (0, string_1.decomposeText)(textToSend, '{confirmSet:', '}').textExcludeSubstring;
            }
            if (textToSend?.includes('{setDynamicValue')) {
                const { textExcludeSubstring, substringExcludeSearch } = (0, string_1.decomposeText)(textToSend, '{setDynamicValue:', '}');
                const splitSubstring = substringExcludeSearch.split(':');
                const confirmText = splitSubstring[2];
                textToSend = `${textExcludeSubstring} ${confirmText}`;
            }
            const { textToSend: changedText, error, newValue, } = (0, exchangeValue_1.exchangeValue)(this.appContext, textToSend ?? '', state.val?.toString());
            if (!error) {
                textToSend = changedText;
            }
            this.appContext.adapter.log.debug(`Value to send: ${newValue}`);
            await (0, telegram_1.sendToTelegram)({
                instance: el.instance,
                userToSend,
                textToSend,
                parse_mode,
                appContext: this.appContext,
            });
            setStateIdsToListenTo.splice(key, 1);
        }
    }
}
exports.SetStateListenerHandler = SetStateListenerHandler;
//# sourceMappingURL=setStateListenerHandler.js.map
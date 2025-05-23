'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.adapter = void 0;
/*
 * Created with @iobroker/create-adapter v2.3.0
 */
// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = __importStar(require("@iobroker/adapter-core"));
const action_js_1 = require("./app/action.js");
const subscribeStates_js_1 = require("./app/subscribeStates.js");
const telegram_js_1 = require("./app/telegram.js");
const createState_js_1 = require("./app/createState.js");
const messageIds_js_1 = require("./app/messageIds.js");
const adapterStartMenuSend_js_1 = require("./app/adapterStartMenuSend.js");
const processData_js_1 = require("./app/processData.js");
const shoppingList_js_1 = require("./app/shoppingList.js");
const logging_js_1 = require("./app/logging.js");
const connection_js_1 = require("./app/connection.js");
const string_1 = require("./lib/string");
const utils_1 = require("./lib/utils");
const appUtils_1 = require("./lib/appUtils");
const configVariables_1 = require("./app/configVariables");
const setStateIdsToListenTo_1 = require("./app/setStateIdsToListenTo");
const timeoutKey = '0';
class TelegramMenu extends utils.Adapter {
    static instance;
    /**
     * @param [options] - Adapter options
     */
    constructor(options = {}) {
        super({
            ...options,
            name: 'telegram-menu',
        });
        this.on('ready', this.onReady.bind(this));
        this.on('unload', this.onUnload.bind(this));
        TelegramMenu.instance = this;
    }
    async onReady() {
        exports.adapter = this;
        await this.setState('info.connection', false, true);
        await (0, createState_js_1.createState)(this);
        const { requestMessageID, directoryPicture, telegramParams, telegramID, menusWithUsers, infoConnectionOfTelegram, listOfMenus, isUserActiveCheckbox, checkboxNoEntryFound, textNoEntryFound, botSendMessageID, sendMenuAfterRestart, token, dataObject, checkboxes, } = (0, configVariables_1.getConfigVariables)(this.config);
        const { telegramInstance } = telegramParams;
        const menuData = {};
        const startSides = (0, appUtils_1.getStartSides)(menusWithUsers, dataObject);
        try {
            await this.getForeignObject(infoConnectionOfTelegram, async (err, obj) => {
                if (err || !obj) {
                    this.log.error(`The State ${infoConnectionOfTelegram} was not found! ${err}`);
                    return;
                }
                if (!(await (0, connection_js_1.checkIsTelegramActive)(infoConnectionOfTelegram))) {
                    return;
                }
                const { nav, action } = dataObject;
                this.log.info('Telegram was found');
                for (const name in nav) {
                    const splittedNavigation = (0, appUtils_1.splitNavigation)(nav[name]);
                    const newStructure = (0, appUtils_1.getNewStructure)(splittedNavigation);
                    const generatedActions = (0, action_js_1.generateActions)({ action: action[name], userObject: newStructure });
                    menuData[name] = newStructure;
                    if (generatedActions) {
                        menuData[name] = generatedActions?.obj;
                        const subscribeForeignStateIds = generatedActions?.ids;
                        if (subscribeForeignStateIds?.length) {
                            await (0, subscribeStates_js_1._subscribeForeignStates)(subscribeForeignStateIds);
                        }
                    }
                    else {
                        exports.adapter.log.debug('No Actions generated!');
                    }
                    // Subscribe Events
                    if (dataObject.action[name]?.events) {
                        for (const event of dataObject.action[name].events) {
                            await (0, subscribeStates_js_1._subscribeForeignStates)(event.ID);
                        }
                    }
                    exports.adapter.log.debug(`Menu: ${name}`);
                    exports.adapter.log.debug(`Array Buttons: ${(0, string_1.jsonString)(splittedNavigation)}`);
                    exports.adapter.log.debug(`Gen. Actions: ${(0, string_1.jsonString)(menuData[name])}`);
                }
                exports.adapter.log.debug(`Checkbox: ${(0, string_1.jsonString)(checkboxes)}`);
                exports.adapter.log.debug(`MenuList: ${(0, string_1.jsonString)(listOfMenus)}`);
                if (sendMenuAfterRestart) {
                    await (0, adapterStartMenuSend_js_1.adapterStartMenuSend)(listOfMenus, startSides, isUserActiveCheckbox, menusWithUsers, menuData, telegramParams);
                }
                this.on('stateChange', async (id, state) => {
                    const setStateIdsToListenTo = (0, setStateIdsToListenTo_1.getStateIdsToListenTo)();
                    const isTelegramInstanceActive = await this.checkInfoConnection(id, infoConnectionOfTelegram);
                    if (!isTelegramInstanceActive) {
                        return;
                    }
                    const { userToSend, error } = await this.getChatIDAndUserToSend(telegramParams);
                    if (error) {
                        return;
                    }
                    if (this.isAddToShoppingList(id, userToSend)) {
                        await (0, shoppingList_js_1.deleteMessageAndSendNewShoppingList)(telegramParams, userToSend);
                        return;
                    }
                    if (!state || !(0, utils_1.isDefined)(state.val)) {
                        return;
                    }
                    if ((0, string_1.isString)(state.val) && state.val.includes('sList:')) {
                        await (0, shoppingList_js_1.shoppingListSubscribeStateAndDeleteItem)(state.val, telegramParams);
                        return;
                    }
                    if (await (0, action_js_1.checkEvent)(dataObject, id, state, menuData, telegramParams, menusWithUsers)) {
                        return;
                    }
                    if (this.isMessageID(id, botSendMessageID, requestMessageID)) {
                        await (0, messageIds_js_1.saveMessageIds)(state, telegramInstance);
                    }
                    else if (this.isMenuToSend(state, id, telegramID, userToSend)) {
                        const value = state.val.toString();
                        const calledValue = value.slice(value.indexOf(']') + 1, value.length);
                        const menus = (0, appUtils_1.getListOfMenusIncludingUser)(menusWithUsers, userToSend);
                        const dataFound = await (0, processData_js_1.checkEveryMenuForData)({
                            menuData,
                            calledValue,
                            userToSend,
                            telegramParams,
                            menus,
                            isUserActiveCheckbox,
                            token,
                            directoryPicture,
                            timeoutKey,
                        });
                        this.log.debug(`Groups with searched User: ${(0, string_1.jsonString)(menus)}`);
                        if (!dataFound && checkboxNoEntryFound) {
                            exports.adapter.log.debug('No Entry found');
                            await (0, telegram_js_1.sendToTelegram)({
                                userToSend,
                                textToSend: textNoEntryFound,
                                telegramParams,
                            });
                        }
                        return;
                    }
                    if (state && setStateIdsToListenTo?.find(element => element.id == id)) {
                        exports.adapter.log.debug(`State, which is listen to was changed: ${id}`);
                        exports.adapter.log.debug(`State: ${(0, string_1.jsonString)(state)}`);
                        for (const el of setStateIdsToListenTo) {
                            const { id: elId, userToSend, confirm, returnText, parse_mode } = el;
                            const key = setStateIdsToListenTo.indexOf(el);
                            if (elId == id) {
                                exports.adapter.log.debug(`Send Value: ${(0, string_1.jsonString)(el)}`);
                                exports.adapter.log.debug(`State: ${(0, string_1.jsonString)(state)}`);
                                if ((0, utils_1.isTruthy)(confirm) && !state?.ack && returnText.includes('{confirmSet:')) {
                                    const { substring } = (0, string_1.decomposeText)(returnText, '{confirmSet:', '}');
                                    const splitSubstring = substring.split(':');
                                    exports.adapter.log.debug(`Substring: ${(0, string_1.jsonString)(splitSubstring)}`);
                                    let text = '';
                                    if ((0, utils_1.isDefined)(state.val)) {
                                        text = splitSubstring[2]?.includes('noValue')
                                            ? splitSubstring[1]
                                            : (0, appUtils_1.exchangePlaceholderWithValue)(splitSubstring[1], state.val.toString());
                                    }
                                    exports.adapter.log.debug(`Return-text: ${text}`);
                                    if (text === '') {
                                        exports.adapter.log.error('The return text cannot be empty, please check.');
                                    }
                                    await (0, telegram_js_1.sendToTelegram)({
                                        textToSend: text,
                                        parse_mode: parse_mode,
                                        userToSend,
                                        telegramParams,
                                    });
                                    continue;
                                }
                                exports.adapter.log.debug(`Data: ${(0, string_1.jsonString)({ confirm, ack: state?.ack, val: state?.val })}`);
                                if (!(0, utils_1.isFalsy)(confirm) && state?.ack) {
                                    let textToSend = returnText;
                                    if (textToSend.includes('{confirmSet:')) {
                                        const { textExcludeSubstring } = (0, string_1.decomposeText)(textToSend, '{confirmSet:', '}');
                                        textToSend = textExcludeSubstring;
                                    }
                                    let value = '';
                                    let valueChange = null;
                                    const { newValue, textToSend: changedText, error, } = (0, string_1.getValueToExchange)(exports.adapter, textToSend, state.val?.toString());
                                    if (!error) {
                                        valueChange = newValue;
                                        textToSend = changedText;
                                    }
                                    if (textToSend?.toString().includes('{novalue}')) {
                                        value = '';
                                        textToSend = textToSend.replace('{novalue}', '');
                                    }
                                    else if ((0, utils_1.isDefined)(state?.val)) {
                                        value = state.val?.toString();
                                    }
                                    if ((0, utils_1.isDefined)(valueChange)) {
                                        value = valueChange;
                                    }
                                    exports.adapter.log.debug(`Value to send: ${value}`);
                                    textToSend = (0, appUtils_1.exchangePlaceholderWithValue)(textToSend, value);
                                    await (0, telegram_js_1.sendToTelegram)({
                                        userToSend,
                                        textToSend,
                                        parse_mode: parse_mode,
                                        telegramParams,
                                    });
                                    setStateIdsToListenTo.splice(key, 1);
                                }
                            }
                        }
                    }
                });
            });
        }
        catch (e) {
            (0, logging_js_1.errorLogger)('Error onReady', e, exports.adapter);
        }
        await this.subscribeForeignStatesAsync(botSendMessageID);
        await this.subscribeForeignStatesAsync(requestMessageID);
        await this.subscribeForeignStatesAsync(`${telegramInstance}.communicate.requestChatId`);
        await this.subscribeForeignStatesAsync(telegramID);
        await this.subscribeForeignStatesAsync(`${telegramInstance}.info.connection`);
    }
    isMessageID(id, botSendMessageID, requestMessageID) {
        return id == botSendMessageID || id == requestMessageID;
    }
    isAddToShoppingList(id, userToSend) {
        return !!(id.includes('alexa-shoppinglist') && !id.includes('add_position') && userToSend);
    }
    isMenuToSend(state, id, telegramID, userToSend) {
        return !!(typeof state?.val === 'string' && state.val != '' && id == telegramID && state?.ack && userToSend);
    }
    async checkInfoConnection(id, infoConnectionOfTelegram) {
        if (id === infoConnectionOfTelegram) {
            if (!(await (0, connection_js_1.checkIsTelegramActive)(infoConnectionOfTelegram))) {
                this.log.debug('Telegram is not active');
                return false;
            }
            return true;
        }
        return true;
    }
    async getChatIDAndUserToSend(telegramParams) {
        const { telegramInstance, userListWithChatID } = telegramParams;
        const chatIDState = await this.getForeignStateAsync(`${telegramInstance}.communicate.requestChatId`);
        if (!chatIDState?.val) {
            exports.adapter.log.debug('ChatID not found');
            return { chatID: '', userToSend: '', error: true, errorMessage: 'ChatId not found' };
        }
        const userToSend = (0, action_js_1.getUserToSendFromUserListWithChatID)(userListWithChatID, chatIDState.val.toString());
        if (!userToSend) {
            this.log.debug('User to send not found');
            return { chatID: chatIDState.val.toString(), userToSend: '', error: true, errorMessage: 'User not found' };
        }
        return { chatID: chatIDState.val.toString(), userToSend, error: false };
    }
    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     *
     * @param callback - Is called when adapter has closed all connections and released all resources
     */
    onUnload(callback) {
        const timeouts = (0, processData_js_1.getTimeouts)();
        try {
            // Here you must clear all timeouts or intervals that may still be active
            timeouts.forEach(({ timeout }) => {
                exports.adapter.clearTimeout(timeout);
            });
            callback();
        }
        catch (e) {
            (0, logging_js_1.errorLogger)(e, 'Error onUnload', exports.adapter);
            callback();
        }
    }
    onMessage(obj) {
        if (typeof obj === 'object' && obj.message) {
            if (obj.command === 'send') {
                // e.g. send email or pushover or whatever
                this.log.info('send command');
                // Send response in callback if required
                if (obj.callback) {
                    this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
                }
            }
        }
    }
}
exports.default = TelegramMenu;
if (require.main !== module) {
    // Export the constructor in compact mode
    /**
     * @param [options] - Adapter options
     */
    module.exports = (options) => new TelegramMenu(options);
}
else {
    // otherwise start the instance directly
    (() => new TelegramMenu())();
}
//# sourceMappingURL=main.js.map
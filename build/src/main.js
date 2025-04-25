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
const timeoutKey = '0';
let subscribeForeignStateIds;
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
        let instanceTelegram = this.config.instance;
        if (!instanceTelegram || instanceTelegram.length == 0) {
            instanceTelegram = 'telegram.0';
        }
        const telegramID = `${instanceTelegram}.communicate.request`;
        const botSendMessageID = `${instanceTelegram}.communicate.botSendMessageId`;
        const requestMessageID = `${instanceTelegram}.communicate.requestMessageId`;
        const infoConnectionOfTelegram = `${instanceTelegram}.info.connection`;
        const checkboxes = this.config.checkbox;
        const one_time_keyboard = checkboxes.oneTiKey;
        const resize_keyboard = checkboxes.resKey;
        const checkboxNoEntryFound = checkboxes.checkboxNoValueFound;
        const sendMenuAfterRestart = checkboxes.sendMenuAfterRestart;
        let listOfMenus = [];
        if (this.config.usersInGroup) {
            listOfMenus = Object.keys(this.config.usersInGroup);
        }
        const token = this.config.tokenGrafana;
        const directoryPicture = this.config.directory;
        const isUserActiveCheckbox = this.config.userActiveCheckbox;
        const menusWithUsers = this.config.usersInGroup;
        const textNoEntryFound = this.config.textNoEntry;
        const userListWithChatID = this.config.userListWithChatID;
        const dataObject = this.config.data;
        const menuData = {};
        const startSides = (0, appUtils_1.getStartSides)(menusWithUsers, dataObject);
        try {
            await this.getForeignObject(infoConnectionOfTelegram, async (err, obj) => {
                if (err || obj == null) {
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
                    const generatedActions = (0, action_js_1.generateActions)(action[name], newStructure);
                    menuData[name] = newStructure;
                    if (generatedActions) {
                        menuData[name] = generatedActions?.obj;
                        subscribeForeignStateIds = generatedActions?.ids;
                    }
                    else {
                        exports.adapter.log.debug('No Actions generated!');
                    }
                    if (subscribeForeignStateIds && subscribeForeignStateIds?.length > 0) {
                        await (0, subscribeStates_js_1._subscribeForeignStatesAsync)(subscribeForeignStateIds);
                    }
                    else {
                        exports.adapter.log.debug('Nothing to Subscribe!');
                    }
                    // Subscribe Events
                    if (dataObject.action[name] && dataObject.action[name].events) {
                        for (const event of dataObject.action[name].events) {
                            await (0, subscribeStates_js_1._subscribeForeignStatesAsync)([event.ID]);
                        }
                    }
                    exports.adapter.log.debug(`Menu: ${name}`);
                    exports.adapter.log.debug(`Array Buttons: ${(0, string_1.jsonString)(splittedNavigation)}`);
                    exports.adapter.log.debug(`Gen. Actions: ${(0, string_1.jsonString)(menuData[name])}`);
                }
                console.log(JSON.stringify(menuData));
                exports.adapter.log.debug(`Checkbox: ${(0, string_1.jsonString)(checkboxes)}`);
                exports.adapter.log.debug(`MenuList: ${(0, string_1.jsonString)(listOfMenus)}`);
                if (sendMenuAfterRestart) {
                    await (0, adapterStartMenuSend_js_1.adapterStartMenuSend)(listOfMenus, startSides, isUserActiveCheckbox, menusWithUsers, menuData, userListWithChatID, instanceTelegram, resize_keyboard, one_time_keyboard);
                }
                this.on('stateChange', async (id, state) => {
                    const setStateIdsToListenTo = (0, processData_js_1.getStateIdsToListenTo)();
                    const isActive = await this.checkInfoConnection(id, infoConnectionOfTelegram);
                    if (!isActive) {
                        return;
                    }
                    const obj = await this.getChatIDAndUserToSend(instanceTelegram, userListWithChatID);
                    if (!obj) {
                        return;
                    }
                    const { userToSend } = obj;
                    if ((0, string_1.isString)(state?.val) && state.val.includes('sList:')) {
                        await (0, shoppingList_js_1.shoppingListSubscribeStateAndDeleteItem)(state.val, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard);
                        return;
                    }
                    if (this.isAddToShoppingList(id, userToSend)) {
                        await (0, shoppingList_js_1.deleteMessageAndSendNewShoppingList)(instanceTelegram, userListWithChatID, userToSend);
                        return;
                    }
                    if (state &&
                        (await (0, action_js_1.checkEvent)(dataObject, id, state, menuData, userListWithChatID, instanceTelegram, resize_keyboard, one_time_keyboard, menusWithUsers))) {
                        return;
                    }
                    if (this.isMessageID(id, botSendMessageID, requestMessageID) && state) {
                        await (0, messageIds_js_1.saveMessageIds)(state, instanceTelegram);
                    }
                    else if (this.isMenuToSend(state, id, telegramID, userToSend)) {
                        let value = state?.val;
                        if (!value || !userToSend) {
                            return;
                        }
                        value = value.toString();
                        const calledValue = value.slice(value.indexOf(']') + 1, value.length);
                        const menus = (0, appUtils_1.getListOfMenusIncludingUser)(menusWithUsers, userToSend);
                        const dataFound = await (0, processData_js_1.checkEveryMenuForData)({
                            menuData,
                            calledValue,
                            userToSend,
                            telegramInstance: instanceTelegram,
                            resize_keyboard,
                            one_time_keyboard,
                            userListWithChatID,
                            menus,
                            isUserActiveCheckbox,
                            token,
                            directoryPicture,
                            timeoutKey,
                        });
                        this.log.debug(`Groups with searched User: ${(0, string_1.jsonString)(menus)}`);
                        this.log.debug(`Data found: ${dataFound}`);
                        if (!dataFound && checkboxNoEntryFound && userToSend) {
                            exports.adapter.log.debug('No Entry found');
                            await (0, telegram_js_1.sendToTelegram)({
                                userToSend,
                                textToSend: textNoEntryFound,
                                telegramInstance: instanceTelegram,
                                resize_keyboard,
                                one_time_keyboard,
                                userListWithChatID,
                            });
                        }
                        return;
                    }
                    if (state &&
                        setStateIdsToListenTo &&
                        setStateIdsToListenTo.find((element) => element.id == id)) {
                        exports.adapter.log.debug(`State, which is listen to was changed: ${id}`);
                        exports.adapter.log.debug(`State: ${(0, string_1.jsonString)(state)}`);
                        setStateIdsToListenTo.forEach((element, key) => {
                            const telegramParams = {
                                telegramInstance: instanceTelegram,
                                one_time_keyboard,
                                resize_keyboard,
                                userToSend: element.userToSend,
                            };
                            if (element.id == id) {
                                exports.adapter.log.debug(`Send Value: ${(0, string_1.jsonString)(element)}`);
                                exports.adapter.log.debug(`State: ${(0, string_1.jsonString)(state)}`);
                                if (!(0, utils_1.isFalsy)(element.confirm) &&
                                    !state?.ack &&
                                    element.returnText.includes('{confirmSet:')) {
                                    const substring = (0, string_1.decomposeText)(element.returnText, '{confirmSet:', '}').substring.split(':');
                                    exports.adapter.log.debug(`Substring: ${(0, string_1.jsonString)(substring)}`);
                                    let text = '';
                                    if ((0, utils_1.isDefined)(state.val)) {
                                        text =
                                            substring[2] && substring[2].includes('noValue')
                                                ? substring[1]
                                                : (0, action_js_1.exchangePlaceholderWithValue)(substring[1], state.val.toString());
                                    }
                                    exports.adapter.log.debug(`Return-text: ${text}`);
                                    if (text === '') {
                                        exports.adapter.log.error('The return text cannot be empty, please check.');
                                    }
                                    (0, telegram_js_1.sendToTelegram)({
                                        textToSend: text,
                                        userListWithChatID,
                                        parse_mode: element.parse_mode,
                                        ...telegramParams,
                                    }).catch((e) => {
                                        (0, logging_js_1.errorLogger)('Error SendToTelegram', e, exports.adapter);
                                    });
                                    return;
                                }
                                exports.adapter.log.debug(`Data: ${(0, string_1.jsonString)({ confirm: element.confirm, ack: state?.ack, val: state?.val })}`);
                                if (!(0, utils_1.isFalsy)(element.confirm) && state?.ack) {
                                    let textToSend = element.returnText;
                                    if (textToSend.includes('{confirmSet:')) {
                                        const substring = (0, string_1.decomposeText)(textToSend, '{confirmSet:', '}').substring;
                                        textToSend = textToSend.replace(substring, '');
                                    }
                                    let value = '';
                                    let valueChange = null;
                                    const { newValue, textToSend: changedText, error, } = (0, string_1.getValueToExchange)(exports.adapter, textToSend, state.val?.toString() || '');
                                    if (!error) {
                                        valueChange = newValue;
                                        textToSend = changedText;
                                    }
                                    if (textToSend?.toString().includes('{novalue}')) {
                                        value = '';
                                        textToSend = textToSend.replace('{novalue}', '');
                                    }
                                    else if ((0, utils_1.isDefined)(state?.val)) {
                                        value = state.val?.toString() || '';
                                    }
                                    if ((0, utils_1.isDefined)(valueChange)) {
                                        value = valueChange;
                                    }
                                    exports.adapter.log.debug(`Value to send: ${value}`);
                                    textToSend = (0, action_js_1.exchangePlaceholderWithValue)(textToSend, value);
                                    (0, telegram_js_1.sendToTelegram)({
                                        userToSend: element.userToSend,
                                        textToSend: textToSend,
                                        telegramInstance: instanceTelegram,
                                        resize_keyboard: resize_keyboard,
                                        one_time_keyboard: one_time_keyboard,
                                        userListWithChatID: userListWithChatID,
                                        parse_mode: element.parse_mode,
                                    }).catch((e) => {
                                        (0, logging_js_1.errorLogger)('Error sendToTelegram', e, exports.adapter);
                                    });
                                    setStateIdsToListenTo.splice(key, 1);
                                }
                            }
                        });
                    }
                });
            });
        }
        catch (e) {
            (0, logging_js_1.errorLogger)('Error onReady', e, exports.adapter);
        }
        await this.subscribeForeignStatesAsync(botSendMessageID);
        await this.subscribeForeignStatesAsync(requestMessageID);
        await this.subscribeForeignStatesAsync(`${instanceTelegram}.communicate.requestChatId`);
        await this.subscribeForeignStatesAsync(telegramID);
        await this.subscribeForeignStatesAsync(`${instanceTelegram}.info.connection`);
    }
    isMessageID(id, botSendMessageID, requestMessageID) {
        return id == botSendMessageID || id == requestMessageID;
    }
    isAddToShoppingList(id, userToSend) {
        return !!(id.includes('alexa-shoppinglist') && !id.includes('add_position') && userToSend);
    }
    isMenuToSend(state, id, telegramID, userToSend) {
        return !!(state &&
            typeof state.val === 'string' &&
            state.val != '' &&
            id == telegramID &&
            state?.ack &&
            userToSend);
    }
    async checkInfoConnection(id, infoConnectionOfTelegram) {
        if (id === infoConnectionOfTelegram) {
            const isActive = await (0, connection_js_1.checkIsTelegramActive)(infoConnectionOfTelegram);
            if (!isActive) {
                this.log.debug('Telegram is not active');
                return false;
            }
            return true;
        }
        return true;
    }
    async getChatIDAndUserToSend(instanceTelegram, userListWithChatID) {
        const chatID = await this.getForeignStateAsync(`${instanceTelegram}.communicate.requestChatId`);
        if (!chatID?.val) {
            exports.adapter.log.debug('ChatID not found');
            return;
        }
        const userToSend = (0, action_js_1.getUserToSendFromUserListWithChatID)(userListWithChatID, chatID.val.toString());
        if (!userToSend) {
            this.log.debug('User to send not found');
            return;
        }
        return { chatID: chatID.val.toString(), userToSend };
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
            timeouts.forEach(element => {
                exports.adapter.clearTimeout(element.timeout);
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
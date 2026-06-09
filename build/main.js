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
exports.createTelegramMenu = void 0;
/*
 * Created with @iobroker/create-adapter v2.3.0
 */
// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = __importStar(require("@iobroker/adapter-core"));
const action_1 = require("./app/action");
const subscribeStates_1 = require("./app/subscribeStates");
const telegram_1 = require("./app/telegram");
const createState_1 = require("./app/createState");
const messageIds_1 = require("./app/messageIds");
const adapterStartMenuSend_1 = require("./app/adapterStartMenuSend");
const processData_1 = require("./app/processData");
const shoppingList_1 = require("./app/shoppingList");
const logging_1 = require("./app/logging");
const connection_1 = require("./app/connection");
const string_1 = require("./lib/string");
const utils_1 = require("./lib/utils");
const appUtils_1 = require("./lib/appUtils");
const configVariables_1 = require("./app/configVariables");
const setStateIdsToListenTo_1 = require("./app/setStateIdsToListenTo");
const exchangeValue_1 = require("./lib/exchangeValue");
const events_1 = require("./app/events");
const deprecated_1 = require("./app/deprecated");
const jsonTable_1 = require("./app/jsonTable");
class TelegramMenu extends utils.Adapter {
    static instance;
    menuData = {};
    configVariables;
    timeoutKey = '0';
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
        await this.setState('info.connection', false, true);
        await (0, createState_1.createState)(this);
        this.configVariables = (0, configVariables_1.getConfigVariables)(this.configVariables, this);
        const { telegramBotSendMessageID, telegramRequestID, telegramRequestMessageID } = configVariables_1.getIds;
        const startSides = (0, appUtils_1.getStartSides)(this.configVariables.menusWithUsers, this.configVariables.dataObject);
        try {
            if (!(await this.checkTelegramConnections())) {
                return;
            }
            await this.buildMenuData();
            await this.sendStartupMenus(startSides);
            let menus = [];
            this.on('stateChange', async (id, state) => {
                const setStateIdsToListenTo = (0, setStateIdsToListenTo_1.getStateIdsToListenTo)();
                const instance = await this.checkInfoConnection(id, this.configVariables.telegramParams);
                const { isEvent, eventUserList } = (0, events_1.getInstancesFromEventsById)(this.configVariables.dataObject.action, id, this.configVariables.menusWithUsers);
                if (isEvent && state) {
                    for (const user of eventUserList) {
                        await (0, events_1.handleEvent)(this, user, this.configVariables.dataObject, id, state, this.menuData, this.configVariables.telegramParams);
                    }
                }
                if (!(0, utils_1.isDefined)(state?.val)) {
                    return;
                }
                if ((0, string_1.isString)(state.val) && state.val?.includes('sList:')) {
                    const requestId = await (0, shoppingList_1.shoppingListSubscribeStateAndDeleteItem)(state.val, this.configVariables.telegramParams);
                    if (requestId) {
                        jsonTable_1.lastRequestJsonButtonHistory.addRequestId(requestId);
                    }
                    return;
                }
                if (this.isAddToShoppingList(id)) {
                    const requestIds = jsonTable_1.lastRequestJsonButtonHistory.getRequestIds();
                    for (const requestId of requestIds) {
                        const result = jsonTable_1.lastRequestJsonButtonHistory.getLast(requestId);
                        if (!result?.instance || !result?.user) {
                            continue;
                        }
                        await (0, shoppingList_1.deleteMessageAndSendNewShoppingList)(result.instance, this.configVariables.telegramParams, result.user);
                        jsonTable_1.lastRequestJsonButtonHistory.resetId(requestId);
                    }
                    return;
                }
                if (instance) {
                    const { userToSend, error } = await this.getChatIDAndUserToSend(this.configVariables.telegramParams, instance);
                    if (error) {
                        return;
                    }
                    if (this.isMessageID(id, telegramBotSendMessageID(instance), telegramRequestMessageID(instance))) {
                        await (0, messageIds_1.saveMessageIds)(this, state, instance);
                    }
                    else if (this.isMenuToSend(state, id, telegramRequestID(instance), userToSend.name)) {
                        const value = state.val.toString();
                        const calledValue = value.slice(value.indexOf(']') + 1, value.length);
                        menus = (0, appUtils_1.getListOfMenusIncludingUser)(this.configVariables.menusWithUsers, userToSend.name);
                        const dataFound = await (0, processData_1.checkEveryMenuForData)({
                            instance,
                            menuData: this.menuData,
                            navToGoTo: calledValue,
                            userToSend: userToSend.name,
                            telegramParams: this.configVariables.telegramParams,
                            menus,
                            isUserActiveCheckbox: this.configVariables.isUserActiveCheckbox,
                            token: this.configVariables.token,
                            directoryPicture: this.configVariables.directoryPicture,
                            timeoutKey: this.timeoutKey,
                        });
                        this.log.debug(`Groups with searched User: ${(0, string_1.jsonString)(menus)}`);
                        if (!dataFound && this.configVariables.checkboxNoEntryFound) {
                            this.log.debug('No Entry found');
                            await (0, telegram_1.sendToTelegram)({
                                instance: instance,
                                userToSend: userToSend.name,
                                textToSend: this.configVariables.textNoEntryFound,
                                telegramParams: this.configVariables.telegramParams,
                            });
                        }
                        return;
                    }
                }
                if (state && setStateIdsToListenTo?.find(element => element.id == id)) {
                    this.log.debug(`Subscribed state changed: { id : ${id} , state : ${(0, string_1.jsonString)(state)} }`);
                    for (const el of setStateIdsToListenTo) {
                        const { id: elId, userToSend, confirm, returnText, parse_mode } = el;
                        const key = setStateIdsToListenTo.indexOf(el);
                        if (elId == id) {
                            this.log.debug(`Send Value: ${(0, string_1.jsonString)(el)}`);
                            this.log.debug(`State: ${(0, string_1.jsonString)(state)}`);
                            if ((0, utils_1.isTruthy)(confirm) && !state?.ack && returnText?.includes('{confirmSet:')) {
                                const { substring } = (0, string_1.decomposeText)(returnText, '{confirmSet:', '}');
                                const splitSubstring = substring.split(':');
                                let text = '';
                                if ((0, utils_1.isDefined)(state.val)) {
                                    text = splitSubstring[2]?.includes('noValue')
                                        ? splitSubstring[1]
                                        : (0, exchangeValue_1.exchangePlaceholderWithValue)(splitSubstring[1], state.val.toString());
                                }
                                this.log.debug(`Return-text: ${text}`);
                                if (text === '') {
                                    this.log.error('The return text cannot be empty, please check.');
                                }
                                await (0, telegram_1.sendToTelegram)({
                                    instance: el.instance,
                                    textToSend: text,
                                    parse_mode: parse_mode,
                                    userToSend,
                                    telegramParams: this.configVariables.telegramParams,
                                });
                                continue;
                            }
                            this.log.debug(`Data: ${(0, string_1.jsonString)({ confirm, ack: state?.ack, val: state?.val })}`);
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
                                const { textToSend: changedText, error, newValue, } = (0, exchangeValue_1.exchangeValue)(this, textToSend ?? '', state.val?.toString());
                                if (!error) {
                                    textToSend = changedText;
                                }
                                this.log.debug(`Value to send: ${newValue}`);
                                await (0, telegram_1.sendToTelegram)({
                                    instance: el.instance,
                                    userToSend,
                                    textToSend,
                                    parse_mode,
                                    telegramParams: this.configVariables.telegramParams,
                                });
                                setStateIdsToListenTo.splice(key, 1);
                            }
                        }
                    }
                }
            });
        }
        catch (e) {
            (0, logging_1.errorLogger)('Error onReady', e, this);
        }
        await this.subscribeToStates();
    }
    async buildMenuData() {
        const { nav, action } = this.configVariables.dataObject;
        for (const name in nav) {
            const splittedNavigation = (0, appUtils_1.splitNavigation)(nav[name]);
            const newStructure = (0, appUtils_1.getNewStructure)(splittedNavigation);
            const generatedActions = (0, action_1.generateActions)({
                adapter: this,
                action: action?.[name],
                userObject: newStructure,
            });
            (0, deprecated_1.findDeprecatedAndLog)(this, generatedActions);
            this.menuData[name] = newStructure;
            if (generatedActions) {
                this.menuData[name] = generatedActions?.obj;
                const subscribeForeignStateIds = generatedActions?.ids;
                if (subscribeForeignStateIds?.length) {
                    await (0, subscribeStates_1._subscribeForeignStates)(this, subscribeForeignStateIds);
                }
            }
            else {
                this.log.debug('No Actions generated!');
            }
            // Subscribe Events
            const events = this.configVariables.dataObject.action?.[name]?.events;
            if (events) {
                for (const event of events) {
                    await (0, subscribeStates_1._subscribeForeignStates)(this, event.ID);
                }
            }
            this.log.debug(`Menu: ${name}`);
            this.log.debug(`Array Buttons: ${(0, string_1.jsonString)(splittedNavigation)}`);
            this.log.debug(`Gen. Actions: ${(0, string_1.jsonString)(this.menuData[name])}`);
        }
        this.log.debug(`Checkbox: ${(0, string_1.jsonString)(this.configVariables.checkboxes)}`);
        this.log.debug(`MenuList: ${(0, string_1.jsonString)(this.configVariables.listOfMenus)}`);
    }
    async sendStartupMenus(startSides) {
        if (this.configVariables.sendMenuAfterRestart) {
            await (0, adapterStartMenuSend_1.adapterStartMenuSend)(this.configVariables.listOfMenus, startSides, this.configVariables.isUserActiveCheckbox, this.configVariables.menusWithUsers, this.menuData, this.configVariables.telegramParams);
        }
    }
    async subscribeToStates() {
        const { telegramBotSendMessageID, telegramRequestID, telegramRequestMessageID, telegramRequestChatID, telegramInfoConnectionID, } = configVariables_1.getIds;
        for (const instance of this.configVariables.telegramParams.telegramInstanceList) {
            const instanceName = instance?.name;
            if (!instance?.active || !instanceName) {
                continue;
            }
            this.log.debug(`Subscribe to instance: ${instanceName}`);
            await this.subscribeForeignStatesAsync(telegramBotSendMessageID(instanceName));
            await this.subscribeForeignStatesAsync(telegramRequestMessageID(instanceName));
            await this.subscribeForeignStatesAsync(telegramRequestChatID(instanceName));
            await this.subscribeForeignStatesAsync(telegramRequestID(instanceName));
            await this.subscribeForeignStatesAsync(telegramInfoConnectionID(instanceName));
        }
    }
    async checkTelegramConnections() {
        if (await (0, connection_1.areAllCheckTelegramInstancesActive)(this.configVariables.telegramParams)) {
            this.log.info('Telegram was found');
            return true;
        }
        this.log.error('Not all Telegram instances are active. Please check your configuration.');
        return false;
    }
    isMessageID(id, botSendMessageID, requestMessageID) {
        return id == botSendMessageID || id == requestMessageID;
    }
    isAddToShoppingList(id) {
        return id.includes('alexa-shoppinglist') && !id.includes('add_position');
    }
    isMenuToSend(state, id, telegramID, userToSend) {
        return !!(typeof state?.val === 'string' && state.val != '' && id == telegramID && state?.ack && userToSend);
    }
    async checkInfoConnection(id, telegramParams) {
        try {
            const { telegramInfoConnectionID } = configVariables_1.getIds;
            const { instance } = (0, appUtils_1.getInstanceById)(id);
            const instanceObj = telegramParams.telegramInstanceList?.find(item => item?.name === instance);
            if (!instance) {
                this.log.warn('No Telegram instance found.');
                return null;
            }
            const iterationId = telegramInfoConnectionID(instance);
            if (instanceObj?.active) {
                const active = await this.isTelegramInstanceActive(iterationId);
                if (active) {
                    return instance;
                }
            }
            return null;
        }
        catch (e) {
            (0, logging_1.errorLogger)('Error checkInfoConnection', e, this);
            return null;
        }
    }
    async isTelegramInstanceActive(id) {
        if (!(await this.getForeignStateAsync(id))) {
            this.log.debug('Telegram is not active');
            return false;
        }
        return true;
    }
    async getChatIDAndUserToSend(telegramParams, telegramInstance) {
        const { userListWithChatID } = telegramParams;
        const chatIDState = await this.getForeignStateAsync(`${telegramInstance}.communicate.requestChatId`);
        if (!chatIDState?.val) {
            this.log.debug('ChatID not found');
            return { chatID: '', userToSend: {}, error: true, errorMessage: 'ChatId not found' };
        }
        const userToSend = (0, action_1.getUserToSendFromUserListWithChatID)(userListWithChatID, chatIDState.val.toString());
        if (!userToSend) {
            this.log.debug('User to send not found');
            return {
                chatID: chatIDState.val.toString(),
                userToSend: {},
                error: true,
                errorMessage: 'User not found',
            };
        }
        return { chatID: chatIDState.val.toString(), userToSend, error: false };
    }
    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     *
     * @param callback - Is called when adapter has closed all connections and released all resources
     */
    onUnload(callback) {
        const timeouts = (0, processData_1.getTimeouts)();
        try {
            // Here you must clear all timeouts or intervals that may still be active
            timeouts.forEach(({ timeout }) => {
                this.clearTimeout(timeout);
            });
            callback();
        }
        catch (e) {
            (0, logging_1.errorLogger)(e, 'Error onUnload', this);
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
const createTelegramMenu = (options) => new TelegramMenu(options);
exports.createTelegramMenu = createTelegramMenu;
if (require.main === module) {
    (() => new TelegramMenu())();
}
//# sourceMappingURL=main.js.map
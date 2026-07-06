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
const logging_1 = require("./app/logging");
const connection_1 = require("./app/connection");
const string_1 = require("./lib/string");
const utils_1 = require("./lib/utils");
const appUtils_1 = require("./lib/appUtils");
const events_1 = require("./app/events");
const deprecated_1 = require("./app/deprecated");
const jsonTable_1 = require("./app/jsonTable");
const processData_1 = require("./app/processData");
const appContext_1 = require("./app/appContext");
const shoppingListManager_1 = require("./app/shoppingListManager");
const setStateListenerHandler_1 = require("./app/setStateListenerHandler");
class TelegramMenu extends utils.Adapter {
    static instance;
    menuData = {};
    appContext;
    setstateListenerHandler;
    timeoutKey = '0';
    menus = [];
    menuProcessor = undefined;
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
        this.appContext = new appContext_1.AppContext(this);
        this.setstateListenerHandler = new setStateListenerHandler_1.SetStateListenerHandler(this.appContext);
        try {
            await this.setState('info.connection', false, true);
            await (0, createState_1.createState)(this);
            const startSides = (0, appUtils_1.getStartSides)(this.appContext.menusWithUsers, this.appContext.dataObject);
            if (!(await this.checkTelegramConnections())) {
                return;
            }
            await this.buildMenuData();
            await this.sendStartupMenus(startSides);
            this.on('stateChange', async (id, state) => {
                const setStateIdsToListenTo = this.appContext.stateIdRegistry.getIds();
                const instance = await this.checkInfoConnection(id, this.appContext);
                const { isEvent, eventUserList } = (0, events_1.getInstancesFromEventsById)(this.appContext.dataObject.action, id, this.appContext.menusWithUsers);
                await this.handleEventChange(isEvent, state, eventUserList, id);
                if (!(0, utils_1.isDefined)(state?.val)) {
                    return;
                }
                if (await this.handleShoppingListChange(state)) {
                    return;
                }
                if (await this.handleAddToShoppingList(id)) {
                    return;
                }
                await this.handleMenuStateChange(instance, id, state);
                await this.setstateListenerHandler.handleSetStateListener(state, setStateIdsToListenTo, id);
            });
        }
        catch (e) {
            (0, logging_1.errorLogger)('Error onReady', e, this);
        }
        await this.subscribeToStates();
    }
    async handleEventChange(isEvent, state, eventUserList, id) {
        if (!isEvent || !state) {
            return;
        }
        for (const user of eventUserList) {
            await (0, events_1.handleEvent)(user, this.appContext.dataObject, id, state, this.menuData, this.appContext);
        }
    }
    async handleShoppingListChange(state) {
        if ((0, string_1.isString)(state.val) && state.val?.includes('sList:')) {
            const requestId = await shoppingListManager_1.shoppingListManager.subscribeStateAndDeleteItem(this.appContext, state.val);
            if (requestId) {
                jsonTable_1.lastRequestJsonButtonHistory.addRequestId(requestId);
            }
            return true;
        }
        return false;
    }
    async handleAddToShoppingList(id) {
        if (!this.isAddToShoppingList(id)) {
            return false;
        }
        const requestIds = jsonTable_1.lastRequestJsonButtonHistory.getRequestIds();
        for (const requestId of requestIds) {
            const result = jsonTable_1.lastRequestJsonButtonHistory.getLast(requestId);
            if (!result?.instance || !result?.user) {
                continue;
            }
            await shoppingListManager_1.shoppingListManager.deleteMessageAndSendNewShoppingList(result.instance, this.appContext, result.user);
            jsonTable_1.lastRequestJsonButtonHistory.resetId(requestId);
        }
        return true;
    }
    async handleMenuStateChange(instance, id, state) {
        if (!instance) {
            return;
        }
        const { userToSend, error } = await this.getChatIDAndUserToSend(this.appContext, instance);
        if (error) {
            return;
        }
        if (this.isMessageID(id, appContext_1.AppContext.telegramBotSendMessageID(instance), appContext_1.AppContext.telegramRequestMessageID(instance))) {
            await (0, messageIds_1.saveMessageIds)(this, state, instance);
        }
        else if (this.isMenuToSend(state, id, appContext_1.AppContext.telegramRequestID(instance), userToSend.name) && state.val) {
            const value = state.val.toString();
            const calledValue = value.slice(value.indexOf(']') + 1, value.length);
            this.menus = (0, appUtils_1.getListOfMenusIncludingUser)(this.appContext.menusWithUsers, userToSend.name);
            this.menuProcessor = new processData_1.MenuProcessor(this.appContext, this.menuData, calledValue, this.menus, this.timeoutKey, userToSend.name, instance);
            const dataFound = await this.menuProcessor.checkEveryMenuForData();
            this.log.debug(`Groups with searched User: ${(0, string_1.jsonString)(this.menus)}`);
            if (!dataFound && this.appContext.checkboxNoEntryFound) {
                this.log.debug('No Entry found');
                await (0, telegram_1.sendToTelegram)({
                    instance: instance,
                    userToSend: userToSend.name,
                    textToSend: this.appContext.textNoEntryFound,
                    appContext: this.appContext,
                });
            }
            return;
        }
    }
    async buildMenuData() {
        const { nav, action } = this.appContext.dataObject;
        for (const name in nav) {
            const splittedNavigation = (0, appUtils_1.splitNavigation)(nav[name]);
            const newStructure = (0, appUtils_1.getNewStructure)(splittedNavigation);
            const generatedActions = (0, action_1.generateActions)({
                action: action?.[name],
                userObject: newStructure,
            });
            (0, deprecated_1.findDeprecatedAndLog)(this, generatedActions);
            this.menuData[name] = newStructure;
            if (generatedActions) {
                this.menuData[name] = generatedActions?.obj;
                const subscribeForeignStateIds = generatedActions?.ids;
                if (subscribeForeignStateIds?.length) {
                    await (0, subscribeStates_1._subscribeForeignStates)(this.appContext, subscribeForeignStateIds);
                }
            }
            else {
                this.log.debug('No Actions generated!');
            }
            // Subscribe Events
            const events = action?.[name]?.events;
            if (events) {
                for (const event of events) {
                    await (0, subscribeStates_1._subscribeForeignStates)(this.appContext, event.ID);
                }
            }
            this.log.debug(`Menu "${name}" built: ${splittedNavigation.length} buttons, actions: ${(0, string_1.jsonString)(this.menuData[name])}`);
        }
        this.log.debug(`MenuList: ${(0, string_1.jsonString)(this.appContext.listOfMenus)}`);
    }
    async sendStartupMenus(startSides) {
        if (this.appContext.sendMenuAfterRestart) {
            await (0, adapterStartMenuSend_1.adapterStartMenuSend)(startSides, this.menuData, this.appContext);
        }
    }
    async subscribeToStates() {
        for (const instance of this.appContext.telegramInstanceList) {
            const instanceName = instance?.name;
            if (!instance?.active || !instanceName) {
                continue;
            }
            this.log.debug(`Subscribe to instance: ${instanceName}`);
            await this.subscribeForeignStatesAsync(appContext_1.AppContext.telegramBotSendMessageID(instanceName));
            await this.subscribeForeignStatesAsync(appContext_1.AppContext.telegramRequestMessageID(instanceName));
            await this.subscribeForeignStatesAsync(appContext_1.AppContext.telegramRequestChatID(instanceName));
            await this.subscribeForeignStatesAsync(appContext_1.AppContext.telegramRequestID(instanceName));
            await this.subscribeForeignStatesAsync(appContext_1.AppContext.telegramInfoConnectionID(instanceName));
        }
    }
    async checkTelegramConnections() {
        if (await (0, connection_1.areAllCheckTelegramInstancesActive)(this.appContext)) {
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
    async checkInfoConnection(id, appContext) {
        const { instance } = (0, appUtils_1.getInstanceById)(id);
        const instanceObj = appContext.telegramInstanceList?.find(item => item?.name === instance);
        if (!instance) {
            this.log.warn('No Telegram instance found.');
            return null;
        }
        const iterationId = appContext_1.AppContext.telegramInfoConnectionID(instance);
        if (instanceObj?.active) {
            const active = await this.isTelegramInstanceActive(iterationId);
            if (active) {
                return instance;
            }
        }
        return null;
    }
    async isTelegramInstanceActive(id) {
        if (!(await this.getForeignStateAsync(id))) {
            this.log.debug('Telegram is not active');
            return false;
        }
        return true;
    }
    async getChatIDAndUserToSend(appContext, telegramInstance) {
        const chatIDState = await this.getForeignStateAsync(`${telegramInstance}.communicate.requestChatId`);
        if (!chatIDState?.val) {
            this.log.debug('ChatID not found');
            return { chatID: '', userToSend: {}, error: true, errorMessage: 'ChatId not found' };
        }
        const userToSend = (0, action_1.getUserToSendFromUserListWithChatID)(appContext.userListWithChatID, chatIDState.val.toString());
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
        const timeouts = this.menuProcessor?.getTimeouts();
        try {
            // Here you must clear all timeouts or intervals that may still be active
            timeouts?.forEach(({ timeout }) => {
                this.clearTimeout(timeout);
            });
            callback();
        }
        catch (e) {
            (0, logging_1.errorLogger)('Error onUnload', e, this);
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
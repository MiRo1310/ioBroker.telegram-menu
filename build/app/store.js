"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Store = void 0;
const backMenu_1 = require("../app/backMenu");
const stateIdRegistry_1 = require("../app/stateIdRegistry");
class Store {
    adapter;
    checkboxNoEntryFound;
    sendMenuAfterRestart;
    resize_keyboard;
    one_time_keyboard;
    telegramInstanceList;
    userListWithChatID;
    isUserActiveCheckbox;
    dataObject;
    menusWithUsers;
    listOfMenus;
    token;
    directoryPicture;
    textNoEntryFound;
    backMenuRegistry;
    stateIdRegistry;
    constructor(adapter) {
        this.adapter = adapter;
        const c = adapter.config;
        this.telegramInstanceList = c.instanceList ?? [];
        this.resize_keyboard = c.checkbox.resKey;
        this.one_time_keyboard = c.checkbox.oneTiKey;
        this.userListWithChatID = c.userListWithChatID;
        this.dataObject = c.data;
        this.checkboxNoEntryFound = c.checkbox.checkboxNoValueFound;
        this.sendMenuAfterRestart = c.checkbox.sendMenuAfterRestart;
        this.listOfMenus = c.usersInGroup ? Object.keys(c.usersInGroup) : [];
        this.token = c.tokenGrafana;
        this.directoryPicture = c.directory ?? '/opt/iobroker/media/';
        this.isUserActiveCheckbox = c.userActiveCheckbox;
        this.menusWithUsers = c.usersInGroup;
        this.textNoEntryFound = c.textNoEntry ?? 'Entry not found';
        this.backMenuRegistry = new backMenu_1.BackMenuRegistry(this);
        this.stateIdRegistry = new stateIdRegistry_1.StateIdRegistry(this);
    }
    telegramRequestID = (instance) => `${instance}.communicate.request`;
    telegramBotSendMessageID = (instance) => `${instance}.communicate.botSendMessageId`;
    telegramRequestMessageID = (instance) => `${instance}.communicate.requestMessageId`;
    telegramInfoConnectionID = (instance) => `${instance}.info.connection`;
    telegramRequestChatID = (instance) => `${instance}.communicate.requestChatId`;
}
exports.Store = Store;
//# sourceMappingURL=store.js.map
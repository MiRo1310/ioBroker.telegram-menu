"use strict";
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Created with @iobroker/create-adapter v2.3.0
 */
// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
require("module-alias/register");
const utils = __importStar(require("@iobroker/adapter-core"));
const action_1 = require("./lib/backend/action");
const subscribeStates_1 = require("./lib/backend/subscribeStates");
const telegram_1 = require("./lib/backend/telegram");
const utilities_1 = require("./lib/backend/utilities");
const createState_1 = require("./lib/backend/createState");
const messageIds_1 = require("./lib/backend/messageIds");
const adapterStartMenuSend_1 = require("./lib/backend/adapterStartMenuSend");
const processData_1 = require("./lib/backend/processData");
const shoppingList_1 = require("./lib/backend/shoppingList");
const action_2 = require("./lib/backend/action");
const logging_1 = require("./lib/backend/logging");
const connection_1 = require("./lib/backend/connection");
const timeoutKey = "0";
let subscribeForeignStateIds;
class TelegramMenu extends utils.Adapter {
    static instance;
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    constructor(options = {}) {
        super({
            ...options,
            name: "telegram-menu",
        });
        this.on("ready", this.onReady.bind(this));
        this.on("unload", this.onUnload.bind(this));
        TelegramMenu.instance = this;
    }
    static getInstance() {
        return TelegramMenu.instance;
    }
    async onReady() {
        this.setState("info.connection", false, true);
        (0, createState_1.createState)(this);
        let instanceTelegram = this.config.instance;
        if (!instanceTelegram || instanceTelegram.length == 0) {
            instanceTelegram = "telegram.0";
        }
        const telegramID = `${instanceTelegram}.communicate.request`;
        const botSendMessageID = `${instanceTelegram}.communicate.botSendMessageId`;
        const requestMessageID = `${instanceTelegram}.communicate.requestMessageId`;
        const infoConnectionOfTelegram = `${instanceTelegram}.info.connection`;
        const checkboxes = this.config.checkbox;
        const one_time_keyboard = checkboxes["oneTiKey"];
        const resize_keyboard = checkboxes["resKey"];
        const checkboxNoEntryFound = checkboxes["checkboxNoValueFound"];
        const sendMenuAfterRestart = checkboxes["sendMenuAfterRestart"];
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
        const startSides = {};
        const menuData = {
            data: {},
        };
        Object.keys(menusWithUsers).forEach((element) => {
            startSides[element] = dataObject.nav[element][0]["call"];
        });
        (0, logging_1.info)([{ text: "StartSides", val: startSides }]);
        this.getForeignObject(infoConnectionOfTelegram, async (err, obj) => {
            try {
                if (err || obj == null) {
                    (0, logging_1.error)([{ val: err }, { text: `The State ${infoConnectionOfTelegram} was not found!` }]);
                    return;
                }
                let isTelegramActive = await (0, connection_1.checkIsTelegramActive)(infoConnectionOfTelegram);
                const nav = dataObject["nav"];
                const action = dataObject["action"];
                (0, logging_1.info)([{ text: "Telegram was found" }]);
                (0, logging_1.debug)([
                    { text: "Groups With Users:", val: menusWithUsers },
                    { text: "Navigation:", val: nav },
                    { text: "Action:", val: action },
                ]);
                for (const name in nav) {
                    const value = await (0, action_1.editArrayButtons)(nav[name], this);
                    const newObjectStructure = await (0, action_1.generateNewObjectStructure)(value);
                    if (newObjectStructure) {
                        menuData.data[name] = newObjectStructure;
                    }
                    const generatedActions = (0, action_1.generateActions)(action[name], menuData.data[name]);
                    if (generatedActions) {
                        menuData.data[name] = generatedActions?.obj;
                        subscribeForeignStateIds = generatedActions?.ids;
                    }
                    else {
                        (0, logging_1.debug)([{ text: "No Actions generated!" }]);
                    }
                    (0, logging_1.debug)([
                        { text: "New Structure:", val: menuData.data[name] },
                        { text: "SubscribeForeignStates:", val: subscribeForeignStateIds },
                    ]);
                    if (subscribeForeignStateIds && subscribeForeignStateIds?.length > 0) {
                        (0, subscribeStates_1._subscribeForeignStatesAsync)(subscribeForeignStateIds);
                    }
                    else {
                        (0, logging_1.debug)([{ text: "Nothing to Subscribe!" }]);
                    }
                    // Subscribe Events
                    if (dataObject["action"][name] && dataObject["action"][name].events) {
                        dataObject["action"][name].events.forEach((event) => {
                            (0, subscribeStates_1._subscribeForeignStatesAsync)([event.ID]);
                        });
                    }
                    (0, logging_1.debug)([
                        { text: "Menu: ", val: name },
                        { text: "Array Buttons: ", val: value },
                        { text: "Gen. Actions: ", val: menuData.data[name] },
                    ]);
                }
                (0, logging_1.debug)([
                    { text: "Checkbox", val: checkboxes },
                    { text: "MenuList", val: listOfMenus },
                ]);
                if (sendMenuAfterRestart) {
                    (0, adapterStartMenuSend_1.adapterStartMenuSend)(listOfMenus, startSides, isUserActiveCheckbox, menusWithUsers, menuData, userListWithChatID, instanceTelegram, resize_keyboard, one_time_keyboard);
                }
                this.on("stateChange", async (id, state) => {
                    let userToSend = null;
                    const setStateIdsToListenTo = (0, processData_1.getStateIdsToListenTo)();
                    if (id === infoConnectionOfTelegram) {
                        isTelegramActive = await (0, connection_1.checkIsTelegramActive)(infoConnectionOfTelegram);
                        if (!isTelegramActive) {
                            return;
                        }
                    }
                    if (id == `${instanceTelegram}.communicate.requestChatId` || !userToSend) {
                        const chatID = await this.getForeignStateAsync(`${instanceTelegram}.communicate.requestChatId`);
                        userToSend = (0, action_1.getUserToSendFromUserListWithChatID)(userListWithChatID, chatID);
                        chatID ? (0, logging_1.debug)([{ text: "ChatID found" }]) : (0, logging_1.debug)([{ text: "ChatID not found" }]);
                    }
                    if (state && typeof state.val == "string" && state.val.includes("sList:")) {
                        (0, shoppingList_1.shoppingListSubscribeStateAndDeleteItem)(state.val, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard);
                        return;
                    }
                    if (id.includes("alexa-shoppinglist") && !id.includes("add_position") && userToSend) {
                        await (0, shoppingList_1.deleteMessageAndSendNewShoppingList)(instanceTelegram, userListWithChatID, userToSend);
                        return;
                    }
                    if (state &&
                        (0, action_2.checkEvent)(dataObject, id, state, menuData, userListWithChatID, instanceTelegram, resize_keyboard, one_time_keyboard, menusWithUsers)) {
                        return;
                    }
                    if ((id == botSendMessageID || id == requestMessageID) && state) {
                        await (0, messageIds_1.saveMessageIds)(state, instanceTelegram);
                    }
                    else if (state && typeof state.val === "string" && state.val != "" && id == telegramID && state?.ack && userToSend) {
                        const value = state.val;
                        const calledValue = value.slice(value.indexOf("]") + 1, value.length);
                        const menus = (0, action_1.getMenusWithUserToSend)(menusWithUsers, userToSend);
                        const dataFound = await (0, processData_1.checkEveryMenuForData)({
                            menuData,
                            calledValue,
                            userToSend,
                            instanceTelegram,
                            resize_keyboard,
                            one_time_keyboard,
                            userListWithChatID,
                            menus,
                            isUserActiveCheckbox,
                            token,
                            directoryPicture,
                            timeoutKey,
                        });
                        (0, logging_1.debug)([
                            { text: "Groups with searched User:", val: menus },
                            { text: "Data found:", val: dataFound },
                        ]);
                        if (!dataFound && checkboxNoEntryFound && userToSend) {
                            (0, logging_1.debug)([{ text: "No Entry found" }]);
                            (0, telegram_1.sendToTelegram)(userToSend, textNoEntryFound, undefined, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, "");
                        }
                    }
                    else if (state && setStateIdsToListenTo && setStateIdsToListenTo.find((element) => element.id == id)) {
                        (0, logging_1.debug)([{ text: "State, which is listen to was changed:", val: id }]);
                        setStateIdsToListenTo.forEach((element, key) => {
                            if (element.id == id) {
                                (0, logging_1.debug)([{ text: "Send Value:", val: element }]);
                                if (element.confirm != "false" && !state?.ack && element.returnText.includes("{confirmSet:")) {
                                    const substring = (0, utilities_1.decomposeText)(element.returnText, "{confirmSet:", "}").substring.split(":");
                                    let text = "";
                                    if (state.val) {
                                        text =
                                            substring[2] && substring[2].includes("noValue")
                                                ? substring[1]
                                                : (0, action_2.exchangePlaceholderWithValue)(substring[1], state.val);
                                    }
                                    (0, telegram_1.sendToTelegram)(element.userToSend, text, undefined, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, element.parse_mode);
                                }
                                else if (element.confirm != "false" && state?.ack) {
                                    (0, logging_1.debug)([{ text: "User:", val: element.userToSend }]);
                                    let textToSend = element.returnText;
                                    if (textToSend.includes("{confirmSet:")) {
                                        const substring = (0, utilities_1.decomposeText)(textToSend, "{confirmSet:", "}").substring;
                                        textToSend = textToSend.replace(substring, "");
                                    }
                                    // Wenn eine Rückgabe des Value an den User nicht gewünscht ist soll value durch einen leeren String ersetzt werden
                                    let value = "";
                                    // Change set value in another Value, like true => on, false => off
                                    let valueChange = "";
                                    const resultChange = (0, utilities_1.changeValue)(textToSend, state.val);
                                    if (resultChange) {
                                        valueChange = resultChange["val"];
                                        textToSend = resultChange["textToSend"];
                                    }
                                    if (textToSend?.toString().includes("{novalue}")) {
                                        value = "";
                                        textToSend = textToSend.replace("{novalue}", "");
                                    }
                                    else if (state.val || state.val == false) {
                                        value = state.val?.toString();
                                    }
                                    valueChange ? (value = valueChange) : value;
                                    textToSend = (0, action_2.exchangePlaceholderWithValue)(textToSend, value);
                                    (0, telegram_1.sendToTelegram)(element.userToSend, textToSend, undefined, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, element.parse_mode);
                                    setStateIdsToListenTo.splice(key, 1);
                                }
                            }
                        });
                    }
                });
            }
            catch (e) {
                (0, logging_1.error)([{ text: "Error onReady" }, { val: e.message }, { text: "Error", val: e.stack }]);
            }
        });
        this.subscribeForeignStatesAsync(botSendMessageID);
        this.subscribeForeignStatesAsync(requestMessageID);
        this.subscribeForeignStatesAsync(`${instanceTelegram}.communicate.requestChatId`);
        this.subscribeForeignStatesAsync(telegramID);
        this.subscribeForeignStatesAsync(`${instanceTelegram}.info.connection`);
    }
    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        const timeouts = (0, processData_1.getTimeouts)();
        try {
            // Here you must clear all timeouts or intervals that may still be active
            timeouts.forEach((element) => {
                clearTimeout(element.timeout);
            });
            callback();
        }
        catch (e) {
            callback();
        }
    }
    onMessage(obj) {
        if (typeof obj === "object" && obj.message) {
            if (obj.command === "send") {
                // e.g. send email or pushover or whatever
                this.log.info("send command");
                // Send response in callback if required
                if (obj.callback) {
                    this.sendTo(obj.from, obj.command, "Message received", obj.callback);
                }
            }
        }
    }
}
exports.default = TelegramMenu;
if (require.main !== module) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new TelegramMenu(options);
}
else {
    // otherwise start the instance directly
    new TelegramMenu();
}
//# sourceMappingURL=main.js.map
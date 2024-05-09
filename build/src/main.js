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
const utils = __importStar(require("@iobroker/adapter-core"));
// const utils = require("@iobroker/adapter-core");
const { generateActions, generateNewObjectStructure, editArrayButtons } = require("./lib/backend/action");
const { _subscribeForeignStatesAsync } = require("./lib/backend/subscribeStates");
const { sendToTelegram } = require("./lib/backend/telegram");
const { decomposeText, changeValue } = require("./lib/backend/utilities");
const { createState } = require("./lib/backend/createState");
const { saveMessageIds } = require("./lib/backend/messageIds");
const { adapterStartMenuSend } = require("./lib/backend/adapterStartMenuSend");
const { getStateIdsToListenTo, checkEveryMenuForData, getTimeouts } = require("./lib/backend/processData");
const { shoppingListSubscribeStateAndDeleteItem, deleteMessageAndSendNewShoppingList } = require("./lib/backend/shoppingList");
const { insertValueInPosition, checkEvent } = require("./lib/backend/action");
const util = require("util");
const timeoutKey = 0;
let subscribeForeignStateIds;
class TelegramMenu extends utils.Adapter {
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    constructor(options = {}) {
        super({
            ...options,
            name: "telegram-menu",
        });
        this.on("ready", this.onReady.bind(this));
        // this.on("message", this.onMessage.bind(this));
        this.on("unload", this.onUnload.bind(this));
    }
    async onReady() {
        this.setState("info.connection", false, true);
        createState(this);
        let instanceTelegram = this.config.instance;
        if (!instanceTelegram || instanceTelegram.length == 0)
            instanceTelegram = "telegram.0";
        const telegramID = `${instanceTelegram}.communicate.request`;
        const botSendMessageID = `${instanceTelegram}.communicate.botSendMessageId`;
        const requestMessageID = `${instanceTelegram}.communicate.requestMessageId`;
        const dataPoint = `${instanceTelegram}.info.connection`;
        this.log.debug("DataPoint: " + JSON.stringify(dataPoint));
        let isTelegramActive, telegramInfoConnection;
        const checkboxes = this.config.checkbox;
        const one_time_keyboard = checkboxes["oneTiKey"];
        const resize_keyboard = checkboxes["resKey"];
        const checkboxNoEntryFound = checkboxes["checkboxNoValueFound"];
        const sendMenuAfterRestart = checkboxes["sendMenuAfterRestart"];
        let listOfMenus = [];
        if (this.config.usersInGroup) {
            listOfMenus = Object.keys(this.config.usersInGroup);
        }
        ;
        const token = this.config.tokenGrafana;
        const directoryPicture = this.config.directory;
        const isUserActiveCheckbox = this.config.userActiveCheckbox;
        const menusWithUsers = this.config.usersInGroup;
        const textNoEntryFound = this.config.textNoEntry;
        const userListWithChatID = this.config.userListWithChatID;
        const menuData = {
            data: {},
        };
        const dataObject = this.config.data;
        const startSides = {};
        Object.keys(menusWithUsers).forEach((element) => {
            startSides[element] = dataObject.nav[element][0]["call"];
        });
        this.log.debug("StartSides " + JSON.stringify(startSides));
        const _this = this;
        this.getForeignObject(dataPoint, async (err, obj) => {
            try {
                if (err || obj == null) {
                    this.log.error(JSON.stringify(err));
                    this.log.error(`The State ${dataPoint} was not found!`);
                }
                else {
                    try {
                        telegramInfoConnection = await this.getForeignStateAsync(dataPoint);
                    }
                    catch (e) {
                        this.log.error("Error getForeignState: " + JSON.stringify(e.message));
                        this.log.error(JSON.stringify(e.stack));
                    }
                    if (telegramInfoConnection?.val === true || telegramInfoConnection?.val === false) {
                        isTelegramActive = telegramInfoConnection?.val;
                    }
                    if (!isTelegramActive) {
                        this.log.info("Telegram was found, but is not running. Please start!");
                    }
                    if (isTelegramActive) {
                        this.log.info("Telegram was found");
                        this.setState("info.connection", true, true);
                        const nav = dataObject["nav"];
                        const action = dataObject["action"];
                        this.log.debug("Groups With Users: " + JSON.stringify(menusWithUsers));
                        this.log.debug("Navigation " + JSON.stringify(nav));
                        this.log.debug("Action " + JSON.stringify(action));
                        try {
                            for (const name in nav) {
                                const value = await editArrayButtons(nav[name], this);
                                if (value) {
                                    menuData.data[name] = await generateNewObjectStructure(_this, value);
                                }
                                this.log.debug("New Structure: " + JSON.stringify(menuData.data[name]));
                                const generatedActions = generateActions(_this, action[name], menuData.data[name]);
                                menuData.data[name] = generatedActions?.obj;
                                subscribeForeignStateIds = generatedActions?.ids;
                                this.log.debug("SubscribeForeignStates: " + JSON.stringify(subscribeForeignStateIds));
                                if (subscribeForeignStateIds && subscribeForeignStateIds?.length > 0) {
                                    _subscribeForeignStatesAsync(subscribeForeignStateIds, _this);
                                }
                                else
                                    this.log.debug("Nothing to Subscribe!");
                                // Subscribe Events							
                                if (dataObject["action"][name] && dataObject["action"][name].events)
                                    dataObject["action"][name].events.forEach((event) => {
                                        _subscribeForeignStatesAsync([event.ID], _this);
                                    });
                                this.log.debug("Menu: " + JSON.stringify(name));
                                this.log.debug("Array Buttons: " + JSON.stringify(value));
                                this.log.debug("Gen. Actions: " + JSON.stringify(menuData.data[name]));
                            }
                            console.log(util.inspect(menuData, false, null, true /* enable colors */));
                        }
                        catch (err) {
                            this.log.error("Error generateNav: " + JSON.stringify(err.message));
                            this.log.error(JSON.stringify(err.stack));
                        }
                        this.log.debug("Checkbox " + JSON.stringify(checkboxes));
                        try {
                            this.log.debug("MenuList: " + JSON.stringify(listOfMenus));
                            //ANCHOR - First Start
                            if (sendMenuAfterRestart) {
                                adapterStartMenuSend(_this, listOfMenus, startSides, isUserActiveCheckbox, menusWithUsers, menuData, userListWithChatID, instanceTelegram, resize_keyboard, one_time_keyboard);
                            }
                        }
                        catch (error) {
                            this.log.error("Error read UserList" + JSON.stringify(error.message));
                            this.log.error(JSON.stringify(error.stack));
                        }
                    }
                    let userToSend;
                    this.on("stateChange", async (id, state) => {
                        const setStateIdsToListenTo = getStateIdsToListenTo();
                        try {
                            if (isTelegramActive) {
                                if (id == `${instanceTelegram}.communicate.requestChatId` || !userToSend) {
                                    const chatID = await this.getForeignStateAsync(`${instanceTelegram}.communicate.requestChatId`);
                                    if (chatID) {
                                        this.log.debug(" ID: " + id);
                                        this.log.debug("ChatID to use: " + JSON.stringify(chatID.val));
                                        userListWithChatID.forEach((element) => {
                                            this.log.debug("User and ChatID: " + JSON.stringify(element));
                                            if (element.chatID == chatID.val)
                                                userToSend = element.name;
                                            this.log.debug("User " + JSON.stringify(userToSend));
                                        });
                                    }
                                    else {
                                        this.log.debug("ChatID not found");
                                    }
                                }
                                // Send to ShoppingList
                                if (state && typeof state.val == "string" && state.val.includes("sList:")) {
                                    shoppingListSubscribeStateAndDeleteItem(_this, state.val, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard);
                                    return;
                                }
                                if (id.includes("alexa-shoppinglist") && !id.includes("add_position")) {
                                    deleteMessageAndSendNewShoppingList(_this, instanceTelegram, userListWithChatID, userToSend);
                                    return;
                                }
                                //ANCHOR - Check Event
                                if (checkEvent(dataObject, id, state, menuData, _this, userListWithChatID, instanceTelegram, resize_keyboard, one_time_keyboard, menusWithUsers))
                                    return;
                                if (id == botSendMessageID || id == requestMessageID) {
                                    saveMessageIds(_this, state, instanceTelegram);
                                }
                                else if (state && typeof state.val === "string" && state.val != "" && id == telegramID && state?.ack) {
                                    const value = state.val;
                                    const calledValue = value.slice(value.indexOf("]") + 1, value.length);
                                    this.log.debug(JSON.stringify({
                                        Value: value,
                                        User: userToSend,
                                        Todo: calledValue,
                                        groups: menusWithUsers,
                                    }));
                                    const menus = [];
                                    for (const key in menusWithUsers) {
                                        this.log.debug("Groups " + JSON.stringify(key));
                                        if (menusWithUsers[key].includes(userToSend)) {
                                            menus.push(key);
                                        }
                                    }
                                    this.log.debug("Groups with searched User " + JSON.stringify(menus));
                                    const dataFound = await checkEveryMenuForData(_this, menuData, calledValue, userToSend, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, menus, isUserActiveCheckbox, token, directoryPicture, timeoutKey);
                                    this.log.debug("Data found: " + JSON.stringify(dataFound));
                                    if (!dataFound && checkboxNoEntryFound) {
                                        sendToTelegram(this, userToSend, textNoEntryFound, undefined, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, "");
                                    }
                                    // Auf SetState reagieren und Wert schicken
                                }
                                else if (state && setStateIdsToListenTo && setStateIdsToListenTo.find((element) => element.id == id)) {
                                    this.log.debug("State, which is listen to was changed " + JSON.stringify(id));
                                    setStateIdsToListenTo.forEach((element, key) => {
                                        if (element.id == id) {
                                            this.log.debug("Send Value " + JSON.stringify(element));
                                            if (element.confirm != "false" && !state?.ack && element.returnText.includes("{confirmSet:")) {
                                                const substring = decomposeText(element.returnText, "{confirmSet:", "}").substring.split(":");
                                                const text = substring[2] && substring[2].includes("noValue") ? substring[1] : insertValueInPosition(substring[1], state.val);
                                                sendToTelegram(this, element.userToSend, text, undefined, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, element.parse_mode);
                                            }
                                            else if (element.confirm != "false" && state?.ack) {
                                                this.log.debug("User " + JSON.stringify(element.userToSend));
                                                let textToSend = "";
                                                textToSend = element.returnText;
                                                if (textToSend.includes("{confirmSet:")) {
                                                    const substring = decomposeText(textToSend, "{confirmSet:", "}").substring;
                                                    textToSend = textToSend.replace(substring, "");
                                                }
                                                // Wenn eine Rückgabe des Value an den User nicht gewünscht ist soll value durch einen leeren String ersetzt werden
                                                let value = "";
                                                // Change set value in another Value, like true => on, false => off
                                                let valueChange = "";
                                                const resultChange = changeValue(textToSend, state.val, _this);
                                                if (resultChange) {
                                                    valueChange = resultChange["val"];
                                                    textToSend = resultChange["textToSend"];
                                                }
                                                if (textToSend?.toString().includes("{novalue}")) {
                                                    value = "";
                                                    textToSend = textToSend.replace("{novalue}", "");
                                                }
                                                else if (state.val || state.val == false)
                                                    value = state.val?.toString();
                                                valueChange ? (value = valueChange) : value;
                                                textToSend = insertValueInPosition(textToSend, value);
                                                this.log.debug("Send Set to Telegram");
                                                this.log.debug("Parse Mode " + JSON.stringify(element.parse_mode));
                                                sendToTelegram(this, element.userToSend, textToSend, undefined, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, element.parse_mode);
                                                // Die Elemente auf die Reagiert wurde entfernen
                                                setStateIdsToListenTo.splice(key, 1);
                                            }
                                        }
                                    });
                                }
                            }
                            if (state && id == `${instanceTelegram}.info.connection`) {
                                if (!state.val) {
                                    isTelegramActive = false;
                                    this.setState("info.connection", false, true);
                                }
                                else {
                                    this.setState("info.connection", true, true);
                                    isTelegramActive = true;
                                }
                            }
                        }
                        catch (e) {
                            this.log.error("Error StateChange " + JSON.stringify(e.message));
                            this.log.error(JSON.stringify(e.stack));
                        }
                    });
                }
            }
            catch (e) {
                this.log.error("Error onReady: " + JSON.stringify(e.message));
                this.log.error(JSON.stringify(e.stack));
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
        const timeouts = getTimeouts();
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
                if (obj.callback)
                    this.sendTo(obj.from, obj.command, "Message received", obj.callback);
            }
        }
    }
}
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
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var main_exports = {};
__export(main_exports, {
  _this: () => _this,
  adapter: () => adapter,
  default: () => TelegramMenu
});
module.exports = __toCommonJS(main_exports);
var utils = __toESM(require("@iobroker/adapter-core"));
var import_action = require("./app/action.js");
var import_subscribeStates = require("./app/subscribeStates.js");
var import_telegram = require("./app/telegram.js");
var import_utilities = require("./lib/utilities.js");
var import_createState = require("./app/createState.js");
var import_messageIds = require("./app/messageIds.js");
var import_adapterStartMenuSend = require("./app/adapterStartMenuSend.js");
var import_processData = require("./app/processData.js");
var import_shoppingList = require("./app/shoppingList.js");
var import_logging = require("./app/logging.js");
var import_connection = require("./app/connection.js");
var import_global = require("./app/global");
var import_string = require("./lib/string");
const timeoutKey = "0";
let subscribeForeignStateIds;
let _this;
class TelegramMenu extends utils.Adapter {
  static instance;
  /**
   * @param [options] - Adapter options
   */
  constructor(options = {}) {
    super({
      ...options,
      name: "telegram-menu"
    });
    this.on("ready", this.onReady.bind(this));
    this.on("unload", this.onUnload.bind(this));
    TelegramMenu.instance = this;
  }
  static getInstance() {
    return TelegramMenu.instance;
  }
  async onReady() {
    _this = this;
    await this.setState("info.connection", false, true);
    await (0, import_createState.createState)(this);
    let instanceTelegram = this.config.instance;
    if (!instanceTelegram || instanceTelegram.length == 0) {
      instanceTelegram = "telegram.0";
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
    const startSides = {};
    const menuData = {
      data: {}
    };
    Object.keys(menusWithUsers).forEach((element) => {
      startSides[element] = dataObject.nav[element][0].call;
    });
    await this.getForeignObject(infoConnectionOfTelegram, async (err, obj) => {
      try {
        if (err || obj == null) {
          this.log.error(`The State ${infoConnectionOfTelegram} was not found! ${err}`);
          return;
        }
        const isTelegramActive = await (0, import_connection.checkIsTelegramActive)(infoConnectionOfTelegram);
        if (!isTelegramActive) {
          return;
        }
        const { nav, action } = dataObject;
        this.log.info("Telegram was found");
        for (const name in nav) {
          const value = (0, import_action.editArrayButtons)(nav[name], this);
          const newObjectStructure = (0, import_action.generateNewObjectStructure)(value);
          if (newObjectStructure) {
            menuData.data[name] = newObjectStructure;
          }
          const generatedActions = (0, import_action.generateActions)(
            action[name],
            menuData.data[name]
          );
          if (generatedActions) {
            menuData.data[name] = generatedActions == null ? void 0 : generatedActions.obj;
            subscribeForeignStateIds = generatedActions == null ? void 0 : generatedActions.ids;
          } else {
            _this.log.debug("No Actions generated!");
          }
          if (subscribeForeignStateIds && (subscribeForeignStateIds == null ? void 0 : subscribeForeignStateIds.length) > 0) {
            await (0, import_subscribeStates._subscribeForeignStatesAsync)(subscribeForeignStateIds);
          } else {
            _this.log.debug("Nothing to Subscribe!");
          }
          if (dataObject.action[name] && dataObject.action[name].events) {
            for (const event of dataObject.action[name].events) {
              await (0, import_subscribeStates._subscribeForeignStatesAsync)([event.ID]);
            }
          }
          _this.log.debug(`Menu: ${name}`);
          _this.log.debug(`Array Buttons: ${(0, import_string.jsonString)(value)}`);
          _this.log.debug(`Gen. Actions: ${(0, import_string.jsonString)(menuData.data[name])}`);
        }
        _this.log.debug(`Checkbox: ${(0, import_string.jsonString)(checkboxes)}`);
        _this.log.debug(`MenuList: ${(0, import_string.jsonString)(listOfMenus)}`);
        if (sendMenuAfterRestart) {
          await (0, import_adapterStartMenuSend.adapterStartMenuSend)(
            listOfMenus,
            startSides,
            isUserActiveCheckbox,
            menusWithUsers,
            menuData,
            userListWithChatID,
            instanceTelegram,
            resize_keyboard,
            one_time_keyboard
          );
        }
        this.on("stateChange", async (id, state) => {
          const setStateIdsToListenTo = (0, import_processData.getStateIdsToListenTo)();
          const isActive = await this.checkInfoConnection(id, infoConnectionOfTelegram);
          if (!isActive) {
            return;
          }
          const obj2 = await this.getChatIDAndUserToSend(instanceTelegram, userListWithChatID);
          if (!obj2) {
            return;
          }
          const { userToSend } = obj2;
          if ((0, import_global.isString)(state == null ? void 0 : state.val) && state.val.includes("sList:")) {
            await (0, import_shoppingList.shoppingListSubscribeStateAndDeleteItem)(
              state.val,
              instanceTelegram,
              userListWithChatID,
              resize_keyboard,
              one_time_keyboard
            );
            return;
          }
          if (this.isAddToShoppingList(id, userToSend)) {
            await (0, import_shoppingList.deleteMessageAndSendNewShoppingList)(instanceTelegram, userListWithChatID, userToSend);
            return;
          }
          if (state && await (0, import_action.checkEvent)(
            dataObject,
            id,
            state,
            menuData,
            userListWithChatID,
            instanceTelegram,
            resize_keyboard,
            one_time_keyboard,
            menusWithUsers
          )) {
            return;
          }
          if (this.isMessageID(id, botSendMessageID, requestMessageID) && state) {
            await (0, import_messageIds.saveMessageIds)(state, instanceTelegram);
          } else if (this.isMenuToSend(state, id, telegramID, userToSend)) {
            let value = state == null ? void 0 : state.val;
            if (!value || !userToSend) {
              return;
            }
            value = value.toString();
            const calledValue = value.slice(value.indexOf("]") + 1, value.length);
            const menus = (0, import_action.getMenusWithUserToSend)(menusWithUsers, userToSend);
            const dataFound = await (0, import_processData.checkEveryMenuForData)({
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
              timeoutKey
            });
            this.log.debug(`Groups with searched User: ${(0, import_string.jsonString)(menus)}`);
            this.log.debug(`Data found: ${dataFound}`);
            if (!dataFound && checkboxNoEntryFound && userToSend) {
              _this.log.debug("No Entry found");
              await (0, import_telegram.sendToTelegram)({
                user: userToSend,
                textToSend: textNoEntryFound,
                instance: instanceTelegram,
                resize_keyboard,
                one_time_keyboard,
                userListWithChatID,
                parse_mode: "false"
              });
            }
            return;
          }
          if (state && setStateIdsToListenTo && setStateIdsToListenTo.find((element) => element.id == id)) {
            _this.log.debug(`State, which is listen to was changed: ${id}`);
            _this.log.debug(`State: ${(0, import_string.jsonString)(state)}`);
            setStateIdsToListenTo.forEach((element, key) => {
              var _a, _b;
              if (element.id == id) {
                _this.log.debug(`Send Value: ${(0, import_string.jsonString)(element)}`);
                _this.log.debug(`State: ${(0, import_string.jsonString)(state)}`);
                if (!(0, import_global.isFalsy)(element.confirm) && !(state == null ? void 0 : state.ack) && element.returnText.includes("{confirmSet:")) {
                  const substring = (0, import_utilities.decomposeText)(
                    element.returnText,
                    "{confirmSet:",
                    "}"
                  ).substring.split(":");
                  _this.log.debug(`Substring: ${(0, import_string.jsonString)(substring)}`);
                  let text = "";
                  if ((0, import_global.isDefined)(state.val)) {
                    text = substring[2] && substring[2].includes("noValue") ? substring[1] : (0, import_action.exchangePlaceholderWithValue)(substring[1], state.val.toString());
                  }
                  _this.log.debug(`Return-text: ${text}`);
                  if (text === "") {
                    (0, import_logging.errorLogger)([{ text: "The return text cannot be empty, please check." }]);
                  }
                  (0, import_telegram.sendToTelegram)({
                    user: element.userToSend,
                    textToSend: text,
                    instance: instanceTelegram,
                    resize_keyboard,
                    one_time_keyboard,
                    userListWithChatID,
                    parse_mode: element.parse_mode
                  }).catch((e) => {
                    (0, import_logging.errorLogger)([
                      { text: "Error SendToTelegram" },
                      { val: e.message },
                      { text: "Error", val: e.stack }
                    ]);
                  });
                  return;
                }
                _this.log.debug(
                  `Data: ${(0, import_string.jsonString)({ confirm: element.confirm, ack: state == null ? void 0 : state.ack, val: state == null ? void 0 : state.val })}`
                );
                if (!(0, import_global.isFalsy)(element.confirm) && (state == null ? void 0 : state.ack)) {
                  let textToSend = element.returnText;
                  if (textToSend.includes("{confirmSet:")) {
                    const substring = (0, import_utilities.decomposeText)(textToSend, "{confirmSet:", "}").substring;
                    textToSend = textToSend.replace(substring, "");
                  }
                  let value = "";
                  let valueChange = null;
                  const {
                    val,
                    textToSend: changedText,
                    error
                  } = (0, import_utilities.changeValue)(textToSend, ((_a = state.val) == null ? void 0 : _a.toString()) || "");
                  if (!error) {
                    valueChange = val;
                    textToSend = changedText;
                  }
                  if (textToSend == null ? void 0 : textToSend.toString().includes("{novalue}")) {
                    value = "";
                    textToSend = textToSend.replace("{novalue}", "");
                  } else if ((0, import_global.isDefined)(state == null ? void 0 : state.val)) {
                    value = ((_b = state.val) == null ? void 0 : _b.toString()) || "";
                  }
                  if (valueChange) {
                    value = valueChange;
                  }
                  _this.log.debug(`Value to send: ${value}`);
                  textToSend = (0, import_action.exchangePlaceholderWithValue)(textToSend, value);
                  (0, import_telegram.sendToTelegram)({
                    user: element.userToSend,
                    textToSend,
                    keyboard: void 0,
                    instance: instanceTelegram,
                    resize_keyboard,
                    one_time_keyboard,
                    userListWithChatID,
                    parse_mode: element.parse_mode
                  }).catch((e) => {
                    (0, import_logging.errorLogger)(e, "Error sendToTelegram");
                  });
                  setStateIdsToListenTo.splice(key, 1);
                }
              }
            });
          }
        });
      } catch (e) {
        (0, import_logging.errorLogger)(e, "Error onReady");
      }
    });
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
    return !!(id.includes("alexa-shoppinglist") && !id.includes("add_position") && userToSend);
  }
  isMenuToSend(state, id, telegramID, userToSend) {
    return !!(state && typeof state.val === "string" && state.val != "" && id == telegramID && (state == null ? void 0 : state.ack) && userToSend);
  }
  async checkInfoConnection(id, infoConnectionOfTelegram) {
    if (id === infoConnectionOfTelegram) {
      const isActive = await (0, import_connection.checkIsTelegramActive)(infoConnectionOfTelegram);
      if (!isActive) {
        this.log.debug("Telegram is not active");
        return false;
      }
      return true;
    }
    return true;
  }
  async getChatIDAndUserToSend(instanceTelegram, userListWithChatID) {
    const chatID = await this.getForeignStateAsync(`${instanceTelegram}.communicate.requestChatId`);
    if (!(chatID == null ? void 0 : chatID.val)) {
      _this.log.debug("ChatID not found");
      return;
    }
    const userToSend = (0, import_action.getUserToSendFromUserListWithChatID)(userListWithChatID, chatID.val.toString());
    if (!userToSend) {
      this.log.debug("User to send not found");
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
    const timeouts = (0, import_processData.getTimeouts)();
    try {
      timeouts.forEach((element) => {
        _this.clearTimeout(element.timeout);
      });
      callback();
    } catch (e) {
      (0, import_logging.errorLogger)(e, "Error onUnload");
      callback();
    }
  }
  onMessage(obj) {
    if (typeof obj === "object" && obj.message) {
      if (obj.command === "send") {
        this.log.info("send command");
        if (obj.callback) {
          this.sendTo(obj.from, obj.command, "Message received", obj.callback);
        }
      }
    }
  }
}
let adapter;
if (require.main !== module) {
  adapter = (options) => new TelegramMenu(options);
} else {
  new TelegramMenu();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  _this,
  adapter
});
//# sourceMappingURL=main.js.map

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
  adapter: () => adapter,
  default: () => TelegramMenu
});
module.exports = __toCommonJS(main_exports);
var utils = __toESM(require("@iobroker/adapter-core"));
var import_action = require("./app/action.js");
var import_subscribeStates = require("./app/subscribeStates.js");
var import_telegram = require("./app/telegram.js");
var import_createState = require("./app/createState.js");
var import_messageIds = require("./app/messageIds.js");
var import_adapterStartMenuSend = require("./app/adapterStartMenuSend.js");
var import_processData = require("./app/processData.js");
var import_shoppingList = require("./app/shoppingList.js");
var import_logging = require("./app/logging.js");
var import_connection = require("./app/connection.js");
var import_string = require("./lib/string");
var import_utils = require("./lib/utils");
var import_appUtils = require("./lib/appUtils");
const timeoutKey = "0";
let subscribeForeignStateIds;
let adapter;
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
  async onReady() {
    adapter = this;
    await this.setState("info.connection", false, true);
    await (0, import_createState.createState)(this);
    let telegramInstance = this.config.instance;
    if (!telegramInstance || telegramInstance.length == 0) {
      telegramInstance = "telegram.0";
    }
    const telegramID = `${telegramInstance}.communicate.request`;
    const botSendMessageID = `${telegramInstance}.communicate.botSendMessageId`;
    const requestMessageID = `${telegramInstance}.communicate.requestMessageId`;
    const infoConnectionOfTelegram = `${telegramInstance}.info.connection`;
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
    const startSides = (0, import_appUtils.getStartSides)(menusWithUsers, dataObject);
    try {
      await this.getForeignObject(infoConnectionOfTelegram, async (err, obj) => {
        if (err || obj == null) {
          this.log.error(`The State ${infoConnectionOfTelegram} was not found! ${err}`);
          return;
        }
        if (!await (0, import_connection.checkIsTelegramActive)(infoConnectionOfTelegram)) {
          return;
        }
        const { nav, action } = dataObject;
        this.log.info("Telegram was found");
        for (const name in nav) {
          const splittedNavigation = (0, import_appUtils.splitNavigation)(nav[name]);
          const newStructure = (0, import_appUtils.getNewStructure)(splittedNavigation);
          const generatedActions = (0, import_action.generateActions)(action[name], newStructure);
          menuData[name] = newStructure;
          if (generatedActions) {
            menuData[name] = generatedActions == null ? void 0 : generatedActions.obj;
            subscribeForeignStateIds = generatedActions == null ? void 0 : generatedActions.ids;
          } else {
            adapter.log.debug("No Actions generated!");
          }
          if (subscribeForeignStateIds && (subscribeForeignStateIds == null ? void 0 : subscribeForeignStateIds.length) > 0) {
            await (0, import_subscribeStates._subscribeForeignStatesAsync)(subscribeForeignStateIds);
          } else {
            adapter.log.debug("Nothing to Subscribe!");
          }
          if (dataObject.action[name] && dataObject.action[name].events) {
            for (const event of dataObject.action[name].events) {
              await (0, import_subscribeStates._subscribeForeignStatesAsync)([event.ID]);
            }
          }
          adapter.log.debug(`Menu: ${name}`);
          adapter.log.debug(`Array Buttons: ${(0, import_string.jsonString)(splittedNavigation)}`);
          adapter.log.debug(`Gen. Actions: ${(0, import_string.jsonString)(menuData[name])}`);
        }
        console.log(JSON.stringify(menuData));
        adapter.log.debug(`Checkbox: ${(0, import_string.jsonString)(checkboxes)}`);
        adapter.log.debug(`MenuList: ${(0, import_string.jsonString)(listOfMenus)}`);
        if (sendMenuAfterRestart) {
          await (0, import_adapterStartMenuSend.adapterStartMenuSend)(
            listOfMenus,
            startSides,
            isUserActiveCheckbox,
            menusWithUsers,
            menuData,
            userListWithChatID,
            telegramInstance,
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
          const obj2 = await this.getChatIDAndUserToSend(telegramInstance, userListWithChatID);
          if (!obj2) {
            return;
          }
          const { userToSend } = obj2;
          if ((0, import_string.isString)(state == null ? void 0 : state.val) && state.val.includes("sList:")) {
            await (0, import_shoppingList.shoppingListSubscribeStateAndDeleteItem)(
              state.val,
              telegramInstance,
              userListWithChatID,
              resize_keyboard,
              one_time_keyboard
            );
            return;
          }
          if (this.isAddToShoppingList(id, userToSend)) {
            await (0, import_shoppingList.deleteMessageAndSendNewShoppingList)(telegramInstance, userListWithChatID, userToSend);
            return;
          }
          if (state && await (0, import_action.checkEvent)(
            dataObject,
            id,
            state,
            menuData,
            userListWithChatID,
            telegramInstance,
            resize_keyboard,
            one_time_keyboard,
            menusWithUsers
          )) {
            return;
          }
          if (this.isMessageID(id, botSendMessageID, requestMessageID) && state) {
            await (0, import_messageIds.saveMessageIds)(state, telegramInstance);
          } else if (this.isMenuToSend(state, id, telegramID, userToSend)) {
            let value = state == null ? void 0 : state.val;
            if (!value || !userToSend) {
              return;
            }
            value = value.toString();
            const calledValue = value.slice(value.indexOf("]") + 1, value.length);
            const menus = (0, import_appUtils.getListOfMenusIncludingUser)(menusWithUsers, userToSend);
            const dataFound = await (0, import_processData.checkEveryMenuForData)({
              menuData,
              calledValue,
              userToSend,
              telegramInstance,
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
            if (!dataFound && checkboxNoEntryFound && userToSend) {
              adapter.log.debug("No Entry found");
              await (0, import_telegram.sendToTelegram)({
                userToSend,
                textToSend: textNoEntryFound,
                telegramInstance,
                resize_keyboard,
                one_time_keyboard,
                userListWithChatID
              });
            }
            return;
          }
          if (state && (setStateIdsToListenTo == null ? void 0 : setStateIdsToListenTo.find((element) => element.id == id))) {
            adapter.log.debug(`State, which is listen to was changed: ${id}`);
            adapter.log.debug(`State: ${(0, import_string.jsonString)(state)}`);
            setStateIdsToListenTo.forEach((element, key) => {
              var _a, _b, _c;
              const telegramParams = {
                telegramInstance,
                one_time_keyboard,
                resize_keyboard,
                userToSend: element.userToSend
              };
              if (element.id == id) {
                adapter.log.debug(`Send Value: ${(0, import_string.jsonString)(element)}`);
                adapter.log.debug(`State: ${(0, import_string.jsonString)(state)}`);
                if (!(0, import_utils.isFalsy)(element.confirm) && !(state == null ? void 0 : state.ack) && element.returnText.includes("{confirmSet:")) {
                  const substring = (0, import_string.decomposeText)(
                    element.returnText,
                    "{confirmSet:",
                    "}"
                  ).substring.split(":");
                  adapter.log.debug(`Substring: ${(0, import_string.jsonString)(substring)}`);
                  let text = "";
                  if ((0, import_utils.isDefined)(state.val)) {
                    text = ((_a = substring[2]) == null ? void 0 : _a.includes("noValue")) ? substring[1] : (0, import_appUtils.exchangePlaceholderWithValue)(substring[1], state.val.toString());
                  }
                  adapter.log.debug(`Return-text: ${text}`);
                  if (text === "") {
                    adapter.log.error("The return text cannot be empty, please check.");
                  }
                  (0, import_telegram.sendToTelegram)({
                    textToSend: text,
                    userListWithChatID,
                    parse_mode: element.parse_mode,
                    ...telegramParams
                  }).catch((e) => {
                    (0, import_logging.errorLogger)("Error SendToTelegram", e, adapter);
                  });
                  return;
                }
                adapter.log.debug(
                  `Data: ${(0, import_string.jsonString)({ confirm: element.confirm, ack: state == null ? void 0 : state.ack, val: state == null ? void 0 : state.val })}`
                );
                if (!(0, import_utils.isFalsy)(element.confirm) && (state == null ? void 0 : state.ack)) {
                  let textToSend = element.returnText;
                  if (textToSend.includes("{confirmSet:")) {
                    const substring = (0, import_string.decomposeText)(textToSend, "{confirmSet:", "}").substring;
                    textToSend = textToSend.replace(substring, "");
                  }
                  let value = "";
                  let valueChange = null;
                  const {
                    newValue,
                    textToSend: changedText,
                    error
                  } = (0, import_string.getValueToExchange)(adapter, textToSend, ((_b = state.val) == null ? void 0 : _b.toString()) || "");
                  if (!error) {
                    valueChange = newValue;
                    textToSend = changedText;
                  }
                  if (textToSend == null ? void 0 : textToSend.toString().includes("{novalue}")) {
                    value = "";
                    textToSend = textToSend.replace("{novalue}", "");
                  } else if ((0, import_utils.isDefined)(state == null ? void 0 : state.val)) {
                    value = ((_c = state.val) == null ? void 0 : _c.toString()) || "";
                  }
                  if ((0, import_utils.isDefined)(valueChange)) {
                    value = valueChange;
                  }
                  adapter.log.debug(`Value to send: ${value}`);
                  textToSend = (0, import_appUtils.exchangePlaceholderWithValue)(textToSend, value);
                  (0, import_telegram.sendToTelegram)({
                    userToSend: element.userToSend,
                    textToSend,
                    telegramInstance,
                    resize_keyboard,
                    one_time_keyboard,
                    userListWithChatID,
                    parse_mode: element.parse_mode
                  }).catch((e) => {
                    (0, import_logging.errorLogger)("Error sendToTelegram", e, adapter);
                  });
                  setStateIdsToListenTo.splice(key, 1);
                }
              }
            });
          }
        });
      });
    } catch (e) {
      (0, import_logging.errorLogger)("Error onReady", e, adapter);
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
      adapter.log.debug("ChatID not found");
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
        adapter.clearTimeout(element.timeout);
      });
      callback();
    } catch (e) {
      (0, import_logging.errorLogger)(e, "Error onUnload", adapter);
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
if (require.main !== module) {
  module.exports = (options) => new TelegramMenu(options);
} else {
  (() => new TelegramMenu())();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  adapter
});
//# sourceMappingURL=main.js.map

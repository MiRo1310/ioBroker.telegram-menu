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
var import_configVariables = require("./app/configVariables");
var import_setStateIdsToListenTo = require("./app/setStateIdsToListenTo");
var import_exchangeValue = require("./lib/exchangeValue");
const timeoutKey = "0";
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
    var _a, _b;
    adapter = this;
    await this.setState("info.connection", false, true);
    await (0, import_createState.createState)(this);
    const {
      directoryPicture,
      telegramParams,
      menusWithUsers,
      listOfMenus,
      isUserActiveCheckbox,
      checkboxNoEntryFound,
      textNoEntryFound,
      sendMenuAfterRestart,
      token,
      dataObject,
      checkboxes
    } = (0, import_configVariables.getConfigVariables)(this.config);
    const {
      telegramBotSendMessageID,
      telegramRequestID,
      telegramRequestMessageID,
      telegramRequestChatID,
      telegramInfoConnectionID
    } = import_configVariables.getIds;
    const menuData = {};
    const startSides = (0, import_appUtils.getStartSides)(menusWithUsers, dataObject);
    try {
      if (!await (0, import_connection.areAllCheckTelegramInstancesActive)(telegramParams)) {
        this.log.error("Not all Telegram instances are active. Please check your configuration.");
        return;
      }
      const { nav, action } = dataObject;
      this.log.info("Telegram was found");
      for (const name in nav) {
        const splittedNavigation = (0, import_appUtils.splitNavigation)(nav[name]);
        const newStructure = (0, import_appUtils.getNewStructure)(splittedNavigation);
        const generatedActions = (0, import_action.generateActions)({ action: action == null ? void 0 : action[name], userObject: newStructure });
        menuData[name] = newStructure;
        if (generatedActions) {
          menuData[name] = generatedActions == null ? void 0 : generatedActions.obj;
          const subscribeForeignStateIds = generatedActions == null ? void 0 : generatedActions.ids;
          if (subscribeForeignStateIds == null ? void 0 : subscribeForeignStateIds.length) {
            await (0, import_subscribeStates._subscribeForeignStates)(subscribeForeignStateIds);
          }
        } else {
          adapter.log.debug("No Actions generated!");
        }
        if ((_b = (_a = dataObject.action) == null ? void 0 : _a[name]) == null ? void 0 : _b.events) {
          for (const event of dataObject.action[name].events) {
            await (0, import_subscribeStates._subscribeForeignStates)(event.ID);
          }
        }
        adapter.log.debug(`Menu: ${name}`);
        adapter.log.debug(`Array Buttons: ${(0, import_string.jsonString)(splittedNavigation)}`);
        adapter.log.debug(`Gen. Actions: ${(0, import_string.jsonString)(menuData[name])}`);
      }
      adapter.log.debug(`Checkbox: ${(0, import_string.jsonString)(checkboxes)}`);
      adapter.log.debug(`MenuList: ${(0, import_string.jsonString)(listOfMenus)}`);
      if (sendMenuAfterRestart) {
        await (0, import_adapterStartMenuSend.adapterStartMenuSend)(
          listOfMenus,
          startSides,
          isUserActiveCheckbox,
          menusWithUsers,
          menuData,
          telegramParams
        );
      }
      let menus = [];
      this.on("stateChange", async (id, state) => {
        var _a2, _b2, _c;
        const setStateIdsToListenTo = (0, import_setStateIdsToListenTo.getStateIdsToListenTo)();
        const instance = await this.checkInfoConnection(id, telegramParams);
        if (!instance) {
          return;
        }
        const { userToSend, error } = await this.getChatIDAndUserToSend(telegramParams, instance);
        if (error) {
          return;
        }
        if (this.isAddToShoppingList(id, userToSend.name)) {
          await (0, import_shoppingList.deleteMessageAndSendNewShoppingList)(instance, telegramParams, userToSend.name);
          return;
        }
        if (!state || !(0, import_utils.isDefined)(state.val)) {
          return;
        }
        if ((0, import_string.isString)(state.val) && ((_a2 = state.val) == null ? void 0 : _a2.includes("sList:"))) {
          await (0, import_shoppingList.shoppingListSubscribeStateAndDeleteItem)(instance, state.val, telegramParams);
          return;
        }
        if (await (0, import_action.checkEvent)(instance, dataObject, id, state, menuData, telegramParams, menusWithUsers)) {
          return;
        }
        if (this.isMessageID(id, telegramBotSendMessageID(instance), telegramRequestMessageID(instance))) {
          await (0, import_messageIds.saveMessageIds)(state, instance);
        } else if (this.isMenuToSend(state, id, telegramRequestID(instance), userToSend.name)) {
          const value = state.val.toString();
          const calledValue = value.slice(value.indexOf("]") + 1, value.length);
          menus = (0, import_appUtils.getListOfMenusIncludingUser)(menusWithUsers, userToSend.name);
          const dataFound = await (0, import_processData.checkEveryMenuForData)({
            instance,
            menuData,
            navToGoTo: calledValue,
            userToSend: userToSend.name,
            telegramParams,
            menus,
            isUserActiveCheckbox,
            token,
            directoryPicture,
            timeoutKey
          });
          this.log.debug(`Groups with searched User: ${(0, import_string.jsonString)(menus)}`);
          if (!dataFound && checkboxNoEntryFound) {
            adapter.log.debug("No Entry found");
            await (0, import_telegram.sendToTelegram)({
              instance,
              userToSend: userToSend.name,
              textToSend: textNoEntryFound,
              telegramParams
            });
          }
          return;
        }
        if (state && (setStateIdsToListenTo == null ? void 0 : setStateIdsToListenTo.find((element) => element.id == id))) {
          adapter.log.debug(`Subscribed state changed: { id : ${id} , state : ${(0, import_string.jsonString)(state)} }`);
          for (const el of setStateIdsToListenTo) {
            const { id: elId, userToSend: userToSend2, confirm, returnText, parse_mode } = el;
            const key = setStateIdsToListenTo.indexOf(el);
            if (elId == id) {
              adapter.log.debug(`Send Value: ${(0, import_string.jsonString)(el)}`);
              adapter.log.debug(`State: ${(0, import_string.jsonString)(state)}`);
              if ((0, import_utils.isTruthy)(confirm) && !(state == null ? void 0 : state.ack) && (returnText == null ? void 0 : returnText.includes("{confirmSet:"))) {
                const { substring } = (0, import_string.decomposeText)(returnText, "{confirmSet:", "}");
                const splitSubstring = substring.split(":");
                let text = "";
                if ((0, import_utils.isDefined)(state.val)) {
                  text = ((_b2 = splitSubstring[2]) == null ? void 0 : _b2.includes("noValue")) ? splitSubstring[1] : (0, import_exchangeValue.exchangePlaceholderWithValue)(splitSubstring[1], state.val.toString());
                }
                adapter.log.debug(`Return-text: ${text}`);
                if (text === "") {
                  adapter.log.error("The return text cannot be empty, please check.");
                }
                await (0, import_telegram.sendToTelegram)({
                  instance,
                  textToSend: text,
                  parse_mode,
                  userToSend: userToSend2,
                  telegramParams
                });
                continue;
              }
              adapter.log.debug(`Data: ${(0, import_string.jsonString)({ confirm, ack: state == null ? void 0 : state.ack, val: state == null ? void 0 : state.val })}`);
              if (!(0, import_utils.isFalsy)(confirm) && (state == null ? void 0 : state.ack)) {
                let textToSend = returnText;
                if (textToSend == null ? void 0 : textToSend.includes("{confirmSet:")) {
                  textToSend = (0, import_string.decomposeText)(textToSend, "{confirmSet:", "}").textExcludeSubstring;
                }
                if (textToSend == null ? void 0 : textToSend.includes("{setDynamicValue")) {
                  const { textExcludeSubstring, substringExcludeSearch } = (0, import_string.decomposeText)(
                    textToSend,
                    "{setDynamicValue:",
                    "}"
                  );
                  const splitSubstring = substringExcludeSearch.split(":");
                  const confirmText = splitSubstring[2];
                  textToSend = `${textExcludeSubstring} ${confirmText}`;
                }
                const {
                  textToSend: changedText,
                  error: error2,
                  newValue
                } = (0, import_exchangeValue.exchangeValue)(adapter, textToSend != null ? textToSend : "", (_c = state.val) == null ? void 0 : _c.toString());
                if (!error2) {
                  textToSend = changedText;
                }
                adapter.log.debug(`Value to send: ${newValue}`);
                await (0, import_telegram.sendToTelegram)({
                  instance,
                  userToSend: userToSend2,
                  textToSend,
                  parse_mode,
                  telegramParams
                });
                setStateIdsToListenTo.splice(key, 1);
              }
            }
          }
        }
      });
    } catch (e) {
      (0, import_logging.errorLogger)("Error onReady", e, adapter);
    }
    for (const instance of telegramParams.telegramInstanceList) {
      const instanceName = instance.name;
      if (!instance.active || !instanceName) {
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
  isMessageID(id, botSendMessageID, requestMessageID) {
    return id == botSendMessageID || id == requestMessageID;
  }
  isAddToShoppingList(id, userToSend) {
    return !!(id.includes("alexa-shoppinglist") && !id.includes("add_position") && userToSend);
  }
  isMenuToSend(state, id, telegramID, userToSend) {
    return !!(typeof (state == null ? void 0 : state.val) === "string" && state.val != "" && id == telegramID && (state == null ? void 0 : state.ack) && userToSend);
  }
  async checkInfoConnection(id, telegramParams) {
    try {
      const { telegramInfoConnectionID } = import_configVariables.getIds;
      const { instance } = (0, import_appUtils.getInstanceById)(id);
      const instanceObj = telegramParams.telegramInstanceList.find((item) => item.name === instance);
      const iterationId = telegramInfoConnectionID(instance);
      if (instanceObj == null ? void 0 : instanceObj.active) {
        const active = await this.isTelegramInstanceActive(iterationId);
        if (active) {
          return instance;
        }
      }
      return null;
    } catch (e) {
      (0, import_logging.errorLogger)("Error checkInfoConnection", e, adapter);
      return null;
    }
  }
  async isTelegramInstanceActive(id) {
    if (!await adapter.getForeignStateAsync(id)) {
      this.log.debug("Telegram is not active");
      return false;
    }
    return true;
  }
  async getChatIDAndUserToSend(telegramParams, telegramInstance) {
    const { userListWithChatID } = telegramParams;
    const chatIDState = await this.getForeignStateAsync(`${telegramInstance}.communicate.requestChatId`);
    if (!(chatIDState == null ? void 0 : chatIDState.val)) {
      adapter.log.debug("ChatID not found");
      return { chatID: "", userToSend: {}, error: true, errorMessage: "ChatId not found" };
    }
    const userToSend = (0, import_action.getUserToSendFromUserListWithChatID)(userListWithChatID, chatIDState.val.toString());
    if (!userToSend) {
      this.log.debug("User to send not found");
      return {
        chatID: chatIDState.val.toString(),
        userToSend: {},
        error: true,
        errorMessage: "User not found"
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
    const timeouts = (0, import_processData.getTimeouts)();
    try {
      timeouts.forEach(({ timeout }) => {
        adapter.clearTimeout(timeout);
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

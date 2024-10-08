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
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var main_exports = {};
__export(main_exports, {
  default: () => TelegramMenu
});
module.exports = __toCommonJS(main_exports);
var utils = __toESM(require("@iobroker/adapter-core"));
var import_action = require("./lib/action");
var import_subscribeStates = require("./lib/subscribeStates");
var import_telegram = require("./lib/telegram");
var import_utilities = require("./lib/utilities");
var import_createState = require("./lib/createState");
var import_messageIds = require("./lib/messageIds");
var import_adapterStartMenuSend = require("./lib/adapterStartMenuSend");
var import_processData = require("./lib/processData");
var import_shoppingList = require("./lib/shoppingList");
var import_action2 = require("./lib/action");
var import_logging = require("./lib/logging");
var import_connection = require("./lib/connection");
require("module-alias/register");
const timeoutKey = "0";
let subscribeForeignStateIds;
class TelegramMenu extends utils.Adapter {
  static instance;
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
    this.setState("info.connection", false, true);
    (0, import_createState.createState)(this);
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
      data: {}
    };
    Object.keys(menusWithUsers).forEach((element) => {
      startSides[element] = dataObject.nav[element][0]["call"];
    });
    this.getForeignObject(infoConnectionOfTelegram, async (err, obj) => {
      try {
        if (err || obj == null) {
          this.log.error(`The State ${infoConnectionOfTelegram} was not found! ` + err);
          return;
        }
        let isTelegramActive = await (0, import_connection.checkIsTelegramActive)(infoConnectionOfTelegram);
        const nav = dataObject["nav"];
        const action = dataObject["action"];
        this.log.info("Telegram was found");
        for (const name in nav) {
          const value = await (0, import_action.editArrayButtons)(nav[name], this);
          const newObjectStructure = await (0, import_action.generateNewObjectStructure)(value);
          if (newObjectStructure) {
            menuData.data[name] = newObjectStructure;
          }
          const generatedActions = (0, import_action.generateActions)(action[name], menuData.data[name]);
          if (generatedActions) {
            menuData.data[name] = generatedActions == null ? void 0 : generatedActions.obj;
            subscribeForeignStateIds = generatedActions == null ? void 0 : generatedActions.ids;
          } else {
            (0, import_logging.debug)([{ text: "No Actions generated!" }]);
          }
          if (subscribeForeignStateIds && (subscribeForeignStateIds == null ? void 0 : subscribeForeignStateIds.length) > 0) {
            (0, import_subscribeStates._subscribeForeignStatesAsync)(subscribeForeignStateIds);
          } else {
            (0, import_logging.debug)([{ text: "Nothing to Subscribe!" }]);
          }
          if (dataObject["action"][name] && dataObject["action"][name].events) {
            dataObject["action"][name].events.forEach((event) => {
              (0, import_subscribeStates._subscribeForeignStatesAsync)([event.ID]);
            });
          }
          (0, import_logging.debug)([
            { text: "Menu: ", val: name },
            { text: "Array Buttons: ", val: value },
            { text: "Gen. Actions: ", val: menuData.data[name] }
          ]);
        }
        (0, import_logging.debug)([
          { text: "Checkbox", val: checkboxes },
          { text: "MenuList", val: listOfMenus }
        ]);
        if (sendMenuAfterRestart) {
          (0, import_adapterStartMenuSend.adapterStartMenuSend)(
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
          let userToSend = null;
          const setStateIdsToListenTo = (0, import_processData.getStateIdsToListenTo)();
          if (id === infoConnectionOfTelegram) {
            isTelegramActive = await (0, import_connection.checkIsTelegramActive)(infoConnectionOfTelegram);
            if (!isTelegramActive) {
              return;
            }
          }
          if (id == `${instanceTelegram}.communicate.requestChatId` || !userToSend) {
            const chatID = await this.getForeignStateAsync(`${instanceTelegram}.communicate.requestChatId`);
            userToSend = (0, import_action.getUserToSendFromUserListWithChatID)(userListWithChatID, chatID);
            chatID ? (0, import_logging.debug)([{ text: "ChatID found" }]) : (0, import_logging.debug)([{ text: "ChatID not found" }]);
          }
          if (state && typeof state.val == "string" && state.val.includes("sList:")) {
            (0, import_shoppingList.shoppingListSubscribeStateAndDeleteItem)(state.val, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard);
            return;
          }
          if (id.includes("alexa-shoppinglist") && !id.includes("add_position") && userToSend) {
            await (0, import_shoppingList.deleteMessageAndSendNewShoppingList)(instanceTelegram, userListWithChatID, userToSend);
            return;
          }
          if (state && (0, import_action2.checkEvent)(
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
          if ((id == botSendMessageID || id == requestMessageID) && state) {
            await (0, import_messageIds.saveMessageIds)(state, instanceTelegram);
          } else if (state && typeof state.val === "string" && state.val != "" && id == telegramID && (state == null ? void 0 : state.ack) && userToSend) {
            const value = state.val;
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
            (0, import_logging.debug)([
              { text: "Groups with searched User:", val: menus },
              { text: "Data found:", val: dataFound }
            ]);
            if (!dataFound && checkboxNoEntryFound && userToSend) {
              (0, import_logging.debug)([{ text: "No Entry found" }]);
              (0, import_telegram.sendToTelegram)(
                userToSend,
                textNoEntryFound,
                void 0,
                instanceTelegram,
                resize_keyboard,
                one_time_keyboard,
                userListWithChatID,
                ""
              );
            }
          } else if (state && setStateIdsToListenTo && setStateIdsToListenTo.find((element) => element.id == id)) {
            (0, import_logging.debug)([{ text: "State, which is listen to was changed:", val: id }]);
            setStateIdsToListenTo.forEach((element, key) => {
              var _a;
              if (element.id == id) {
                (0, import_logging.debug)([{ text: "Send Value:", val: element }]);
                if (element.confirm != "false" && !(state == null ? void 0 : state.ack) && element.returnText.includes("{confirmSet:")) {
                  const substring = (0, import_utilities.decomposeText)(element.returnText, "{confirmSet:", "}").substring.split(":");
                  let text = "";
                  if (state.val) {
                    text = substring[2] && substring[2].includes("noValue") ? substring[1] : (0, import_action2.exchangePlaceholderWithValue)(substring[1], state.val);
                  }
                  (0, import_telegram.sendToTelegram)(
                    element.userToSend,
                    text,
                    void 0,
                    instanceTelegram,
                    resize_keyboard,
                    one_time_keyboard,
                    userListWithChatID,
                    element.parse_mode
                  );
                } else if (element.confirm != "false" && (state == null ? void 0 : state.ack)) {
                  (0, import_logging.debug)([{ text: "User:", val: element.userToSend }]);
                  let textToSend = element.returnText;
                  if (textToSend.includes("{confirmSet:")) {
                    const substring = (0, import_utilities.decomposeText)(textToSend, "{confirmSet:", "}").substring;
                    textToSend = textToSend.replace(substring, "");
                  }
                  let value = "";
                  let valueChange = "";
                  const resultChange = (0, import_utilities.changeValue)(textToSend, state.val);
                  if (resultChange) {
                    valueChange = resultChange["val"];
                    textToSend = resultChange["textToSend"];
                  }
                  if (textToSend == null ? void 0 : textToSend.toString().includes("{novalue}")) {
                    value = "";
                    textToSend = textToSend.replace("{novalue}", "");
                  } else if (state.val || state.val == false) {
                    value = (_a = state.val) == null ? void 0 : _a.toString();
                  }
                  valueChange ? value = valueChange : value;
                  textToSend = (0, import_action2.exchangePlaceholderWithValue)(textToSend, value);
                  (0, import_telegram.sendToTelegram)(
                    element.userToSend,
                    textToSend,
                    void 0,
                    instanceTelegram,
                    resize_keyboard,
                    one_time_keyboard,
                    userListWithChatID,
                    element.parse_mode
                  );
                  setStateIdsToListenTo.splice(key, 1);
                }
              }
            });
          }
        });
      } catch (e) {
        (0, import_logging.error)([{ text: "Error onReady" }, { val: e.message }, { text: "Error", val: e.stack }]);
      }
    });
    this.subscribeForeignStatesAsync(botSendMessageID);
    this.subscribeForeignStatesAsync(requestMessageID);
    this.subscribeForeignStatesAsync(`${instanceTelegram}.communicate.requestChatId`);
    this.subscribeForeignStatesAsync(telegramID);
    this.subscribeForeignStatesAsync(`${instanceTelegram}.info.connection`);
  }
  onUnload(callback) {
    const timeouts = (0, import_processData.getTimeouts)();
    try {
      timeouts.forEach((element) => {
        clearTimeout(element.timeout);
      });
      callback();
    } catch (e) {
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
  new TelegramMenu();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
//# sourceMappingURL=main.js.map

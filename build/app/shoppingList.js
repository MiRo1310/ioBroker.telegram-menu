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
var shoppingList_exports = {};
__export(shoppingList_exports, {
  deleteMessageAndSendNewShoppingList: () => deleteMessageAndSendNewShoppingList,
  shoppingListSubscribeStateAndDeleteItem: () => shoppingListSubscribeStateAndDeleteItem
});
module.exports = __toCommonJS(shoppingList_exports);
var import_messageIds = require("./messageIds.js");
var import_jsonTable = require("./jsonTable.js");
var import_telegram = require("./telegram.js");
var import_subscribeStates = require("./subscribeStates.js");
var import_logging = require("./logging.js");
var import_main = __toESM(require("../main.js"));
const objData = {};
let isSubscribed = false;
async function shoppingListSubscribeStateAndDeleteItem(val, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard) {
  const _this = import_main.default.getInstance();
  try {
    let array, user, idList, instance, idItem, res;
    if (val != null) {
      array = val.split(":");
      user = array[0].replace("[", "").replace("]sList", "");
      idList = array[1];
      instance = array[2];
      idItem = array[3];
      res = await _this.getForeignObjectAsync(`alexa2.${instance}.Lists.SHOPPING_LIST.items.${idItem}`);
      if (res) {
        objData[user] = { idList };
        (0, import_logging.debug)([{ text: "alexa-shoppinglist.", val: idList }]);
        if (!isSubscribed) {
          await (0, import_subscribeStates._subscribeAndUnSubscribeForeignStatesAsync)({ id: `alexa-shoppinglist.${idList}` });
          isSubscribed = true;
        }
        await _this.setForeignStateAsync(
          `alexa2.${instance}.Lists.SHOPPING_LIST.items.${idItem}.#delete`,
          true,
          false
        );
        return;
      }
      await (0, import_telegram.sendToTelegram)({
        user,
        textToSend: "Cannot delete the Item",
        keyboard: void 0,
        instance: instanceTelegram,
        resize_keyboard,
        one_time_keyboard,
        userListWithChatID,
        parse_mode: "true"
      });
      (0, import_logging.debug)([{ text: "Cannot delete the Item" }]);
      return;
    }
  } catch (e) {
    (0, import_logging.errorLogger)("Error shoppingList:", e);
  }
}
async function deleteMessageAndSendNewShoppingList(instanceTelegram, userListWithChatID, userToSend) {
  const _this = import_main.default.getInstance();
  try {
    const user = userToSend;
    const idList = objData[user].idList;
    await (0, import_subscribeStates._subscribeAndUnSubscribeForeignStatesAsync)({ id: `alexa-shoppinglist.${idList}` });
    await (0, import_messageIds.deleteMessageIds)(user, userListWithChatID, instanceTelegram, "last");
    const result = await _this.getForeignStateAsync(`alexa-shoppinglist.${idList}`);
    if (result && result.val) {
      (0, import_logging.debug)([{ text: "Result from Shoppinglist:", val: result }]);
      const newId = `alexa-shoppinglist.${idList}`;
      const resultJson = (0, import_jsonTable.createKeyboardFromJson)(result.val, null, newId, user);
      if (resultJson && resultJson.text && resultJson.keyboard) {
        (0, import_telegram.sendToTelegramSubmenu)(
          user,
          resultJson.text,
          resultJson.keyboard,
          instanceTelegram,
          userListWithChatID,
          "true"
        );
      }
    }
  } catch (e) {
    (0, import_logging.errorLogger)("Error deleteMessageAndSendNewShoppingList:", e);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  deleteMessageAndSendNewShoppingList,
  shoppingListSubscribeStateAndDeleteItem
});
//# sourceMappingURL=shoppingList.js.map

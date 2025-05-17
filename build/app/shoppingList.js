"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var import_main = require("../main.js");
var import_string = require("../lib/string");
var import_setstate = require("./setstate");
var import_json = require("../lib/json");
var import_utils = require("../lib/utils");
const objData = {};
let isSubscribed = false;
async function shoppingListSubscribeStateAndDeleteItem(val, telegramParams) {
  try {
    let array, user, idList, instance, idItem, res;
    if ((0, import_utils.isDefined)(val)) {
      array = val.split(":");
      user = array[0].replace("[", "").replace("]sList", "");
      idList = array[1];
      instance = array[2];
      idItem = array[3];
      res = await import_main.adapter.getForeignObjectAsync(`alexa2.${instance}.Lists.SHOPPING_LIST.items.${idItem}`);
      if (res) {
        objData[user] = { idList };
        import_main.adapter.log.debug(`Alexa-shoppinglist : ${idList}`);
        if (!isSubscribed) {
          await (0, import_subscribeStates._subscribeForeignStates)(`alexa-shoppinglist.${idList}`);
          isSubscribed = true;
        }
        await (0, import_setstate.setstateIobroker)({
          id: `alexa2.${instance}.Lists.SHOPPING_LIST.items.${idItem}.#delete`,
          value: true,
          ack: false
        });
        return;
      }
      await (0, import_telegram.sendToTelegram)({
        userToSend: user,
        textToSend: "Cannot delete the Item",
        telegramParams,
        parse_mode: true
      });
      import_main.adapter.log.debug("Cannot delete the Item");
    }
  } catch (e) {
    (0, import_logging.errorLogger)("Error shoppingList:", e, import_main.adapter);
  }
}
async function deleteMessageAndSendNewShoppingList(telegramParams, userToSend) {
  try {
    const user = userToSend;
    const idList = objData[user].idList;
    await (0, import_subscribeStates._subscribeForeignStates)(`alexa-shoppinglist.${idList}`);
    await (0, import_messageIds.deleteMessageIds)(user, telegramParams, "last");
    const result = await import_main.adapter.getForeignStateAsync(`alexa-shoppinglist.${idList}`);
    if (result == null ? void 0 : result.val) {
      import_main.adapter.log.debug(`Result from Shoppinglist : ${(0, import_string.jsonString)(result)}`);
      const newId = `alexa-shoppinglist.${idList}`;
      const resultJson = (0, import_jsonTable.createKeyboardFromJson)((0, import_json.toJson)(result.val), null, newId, user);
      if ((resultJson == null ? void 0 : resultJson.text) && (resultJson == null ? void 0 : resultJson.keyboard)) {
        (0, import_telegram.sendToTelegramSubmenu)(user, resultJson.text, resultJson.keyboard, telegramParams, true);
      }
    }
  } catch (e) {
    (0, import_logging.errorLogger)("Error deleteMessageAndSendNewShoppingList", e, import_main.adapter);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  deleteMessageAndSendNewShoppingList,
  shoppingListSubscribeStateAndDeleteItem
});
//# sourceMappingURL=shoppingList.js.map

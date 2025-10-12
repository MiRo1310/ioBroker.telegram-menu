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
var dynamicValue_exports = {};
__export(dynamicValue_exports, {
  getDynamicValue: () => getDynamicValue,
  removeUserFromDynamicValue: () => removeUserFromDynamicValue,
  setDynamicValue: () => setDynamicValue
});
module.exports = __toCommonJS(dynamicValue_exports);
var import_string = require("@b/lib/string");
var import_telegram = require("@b/app/telegram");
const dynamicValueObj = {};
const setDynamicValue = async (instance, returnText, ack, id, userToSend, telegramParams, parse_mode, confirm) => {
  const { substringExcludeSearch } = (0, import_string.decomposeText)(returnText, "{setDynamicValue:", "}");
  let array = substringExcludeSearch.split(":");
  array = isBraceDeleteEntry(array);
  const text = array[0];
  if (text) {
    await (0, import_telegram.sendToTelegram)({
      instance,
      userToSend,
      textToSend: text,
      telegramParams,
      parse_mode
    });
  }
  dynamicValueObj[userToSend] = {
    id,
    ack,
    returnText: text,
    userToSend,
    parse_mode,
    confirm,
    telegramParams,
    valueType: array[1],
    navToGoTo: array[3]
  };
  if (array[2] && array[2] != "") {
    return { confirmText: array[2], id: array[3] !== "" ? array[3] : void 0 };
  }
  return { confirmText: "", id: void 0 };
};
const getDynamicValue = (userToSend) => {
  var _a;
  return (_a = dynamicValueObj[userToSend]) != null ? _a : null;
};
const removeUserFromDynamicValue = (userToSend) => {
  if (dynamicValueObj[userToSend]) {
    delete dynamicValueObj[userToSend];
    return true;
  }
  return false;
};
function isBraceDeleteEntry(array) {
  if (array[4] === "}") {
    return array.slice(0, 4);
  }
  return array;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getDynamicValue,
  removeUserFromDynamicValue,
  setDynamicValue
});
//# sourceMappingURL=dynamicValue.js.map

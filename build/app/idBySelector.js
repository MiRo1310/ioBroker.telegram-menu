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
var idBySelector_exports = {};
__export(idBySelector_exports, {
  idBySelector: () => idBySelector
});
module.exports = __toCommonJS(idBySelector_exports);
var import_config = require("../config/config");
var import_exchangeValue = require("../lib/exchangeValue");
var import_string = require("../lib/string");
var import_telegram = require("./telegram");
var import_logging = require("./logging");
const idBySelector = async ({
  instance,
  adapter,
  selector,
  text,
  userToSend,
  newline,
  telegramParams
}) => {
  let text2Send = "";
  try {
    const functions = selector.replace(import_config.config.functionSelektor, "");
    let enums = [];
    const result = await adapter.getEnumsAsync();
    const enumsFunctions = result == null ? void 0 : result["enum.functions"][`enum.functions.${functions}`];
    if (!enumsFunctions) {
      return;
    }
    enums = enumsFunctions.common.members;
    if (!enums) {
      return;
    }
    const promises = enums.map(async (id) => {
      var _a;
      const value = await adapter.getForeignStateAsync(id);
      let newText = text;
      if (text.includes("{common.name}")) {
        const result2 = await adapter.getForeignObjectAsync(id);
        newText = newText.replace("{common.name}", getCommonName({ name: result2 == null ? void 0 : result2.common.name, adapter }));
      }
      if (text.includes("{folder.name}")) {
        const result2 = await adapter.getForeignObjectAsync(removeLastPartOfId(id));
        newText = newText.replace("{folder.name}", getCommonName({ name: result2 == null ? void 0 : result2.common.name, adapter }));
      }
      const { textToSend } = (0, import_exchangeValue.exchangeValue)(adapter, newText, (_a = value == null ? void 0 : value.val) != null ? _a : "");
      text2Send += textToSend;
      text2Send += (0, import_string.getNewline)(newline);
      adapter.log.debug(`Text to send:  ${JSON.stringify(text2Send)}`);
    });
    Promise.all(promises).then(async () => {
      await (0, import_telegram.sendToTelegram)({
        instance,
        userToSend,
        textToSend: text2Send,
        telegramParams
      });
    }).catch((e) => {
      (0, import_logging.errorLogger)("Error Promise", e, adapter);
    });
  } catch (error) {
    (0, import_logging.errorLogger)("Error idBySelector", error, adapter);
  }
};
function getCommonName({ name, adapter }) {
  var _a, _b;
  const language = (_a = adapter.language) != null ? _a : "en";
  if (!name) {
    return "";
  }
  if (typeof name === "string") {
    return name;
  }
  if (language) {
    return (_b = name[language]) != null ? _b : "";
  }
  return "";
}
function removeLastPartOfId(id) {
  const parts = id.split(".");
  parts.pop();
  return parts.join(".");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  idBySelector
});
//# sourceMappingURL=idBySelector.js.map

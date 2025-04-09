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
var getstate_exports = {};
__export(getstate_exports, {
  getState: () => getState
});
module.exports = __toCommonJS(getstate_exports);
var import_telegram = require("./telegram");
var import_action = require("./action");
var import_jsonTable = require("./jsonTable");
var import_utilities = require("../lib/utilities");
var import_global = require("./global");
var import_logging = require("./logging");
var import_main = __toESM(require("../main"));
var import_time = require("../lib/time");
function getState(part, userToSend, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID) {
  var _a, _b;
  const _this = import_main.default.getInstance();
  let text = "";
  let i = 1;
  const parse_mode = ((_a = part.getData) == null ? void 0 : _a[0].parse_mode) || "false";
  (_b = part.getData) == null ? void 0 : _b.forEach(async (element) => {
    try {
      (0, import_logging.debug)([{ text: "Get Value ID:", val: element.id }]);
      const specifiedSelektor = "functions=";
      const id = element.id;
      let textToSend = "";
      if (id.indexOf(specifiedSelektor) != -1) {
        await (0, import_action.idBySelector)(
          _this,
          id,
          element.text,
          userToSend,
          element.newline,
          telegramInstance,
          one_time_keyboard,
          resize_keyboard,
          userListWithChatID
        );
        return;
      }
      if (element.text.includes("binding:")) {
        (0, import_logging.debug)([{ text: "Binding" }]);
        await (0, import_action.bindingFunc)(
          element.text,
          userToSend,
          telegramInstance,
          one_time_keyboard,
          resize_keyboard,
          userListWithChatID,
          parse_mode
        );
        return;
      }
      await _this.getForeignStateAsync(id).then(async (value) => {
        var _a2, _b2, _c;
        if (!(0, import_global.isDefined)(value)) {
          (0, import_logging.errorLogger)([{ text: "The state is empty!" }]);
          return;
        }
        const valueForJson = (_b2 = (_a2 = value.val) == null ? void 0 : _a2.toString()) != null ? _b2 : "";
        (0, import_logging.debug)([{ text: "State:", val: value }]);
        let val = valueForJson.replace(/\\/g, "").replace(/"/g, "");
        let newline = "";
        if (element.newline === "true") {
          newline = "\n";
        }
        if (element.text) {
          textToSend = element.text.toString();
          if (element.text.includes("{time.lc") || element.text.includes("{time.ts")) {
            textToSend = await (0, import_utilities.processTimeIdLc)(element.text, id) || "";
            val = "";
          }
          if (textToSend.includes("{time}")) {
            textToSend = (0, import_time.processTimeValue)(textToSend, value);
            val = "";
          }
          if (textToSend.includes("math:")) {
            const result = (0, import_action.calcValue)(_this, textToSend, val);
            if (result) {
              textToSend = result.textToSend;
              val = result.val;
              _this.log.debug(`TextToSend: ${textToSend} val: ${val}`);
            }
          }
          if (textToSend.includes("round:")) {
            const result = (0, import_action.roundValue)(val, textToSend);
            if (result) {
              _this.log.debug(
                `The Value was rounded ${JSON.stringify(val)} to ${JSON.stringify(result.val)}`
              );
              val = result.val;
              textToSend = result.textToSend;
            }
          }
          if (textToSend.includes("{json")) {
            if ((0, import_global.decomposeText)(textToSend, "{json", "}").substring.includes("TextTable")) {
              const result = (0, import_jsonTable.createTextTableFromJson)(valueForJson, textToSend);
              if (result) {
                await (0, import_telegram.sendToTelegram)({
                  user: userToSend,
                  textToSend: result,
                  keyboard: void 0,
                  instance: telegramInstance,
                  resize_keyboard: one_time_keyboard,
                  one_time_keyboard: resize_keyboard,
                  userListWithChatID,
                  parse_mode
                });
                return;
              }
              _this.log.debug("Cannot create a Text-Table");
            } else {
              const result = (0, import_jsonTable.createKeyboardFromJson)(valueForJson, textToSend, element.id, userToSend);
              if (valueForJson && valueForJson.length > 0) {
                if (result && result.text && result.keyboard) {
                  (0, import_telegram.sendToTelegramSubmenu)(
                    userToSend,
                    result.text,
                    result.keyboard,
                    telegramInstance,
                    userListWithChatID,
                    parse_mode
                  );
                }
                return;
              }
              await (0, import_telegram.sendToTelegram)({
                user: userToSend,
                textToSend: "The state is empty!",
                keyboard: void 0,
                instance: telegramInstance,
                resize_keyboard: one_time_keyboard,
                one_time_keyboard: resize_keyboard,
                userListWithChatID,
                parse_mode
              });
              _this.log.debug("The state is empty!");
              return;
            }
          }
          const { val: _val, textToSend: _text, error } = (0, import_utilities.changeValue)(textToSend, val);
          val = _val;
          textToSend = _text;
          if (!error) {
            (0, import_logging.debug)([{ text: "Value Changed to:", val: textToSend }]);
          } else {
            (0, import_logging.debug)([{ text: "No Change" }]);
          }
          if (textToSend.indexOf("&&") != -1) {
            text += `${textToSend.replace("&&", val.toString())}${newline}`;
          } else {
            text += `${textToSend} ${val}${newline}`;
          }
        } else {
          text += `${val} ${newline}`;
        }
        (0, import_logging.debug)([{ text: "Text:", val: text }]);
        if (i == ((_c = part.getData) == null ? void 0 : _c.length)) {
          if (userToSend) {
            await (0, import_telegram.sendToTelegram)({
              user: userToSend,
              textToSend: text,
              keyboard: void 0,
              instance: telegramInstance,
              resize_keyboard: one_time_keyboard,
              one_time_keyboard: resize_keyboard,
              userListWithChatID,
              parse_mode
            });
          }
        }
        i++;
      });
    } catch (error) {
      error({
        array: [
          { text: "Error GetData:", val: error.message },
          { text: "Stack:", val: error.stack }
        ]
      });
    }
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getState
});
//# sourceMappingURL=getstate.js.map

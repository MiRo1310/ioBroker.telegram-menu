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
var getstate_exports = {};
__export(getstate_exports, {
  getState: () => getState
});
module.exports = __toCommonJS(getstate_exports);
var import_telegram = require("./telegram");
var import_action = require("./action");
var import_jsonTable = require("./jsonTable");
var import_utilities = require("../lib/utilities");
var import_utils = require("../lib/utils");
var import_main = require("../main");
var import_time = require("../lib/time");
var import_string = require("../lib/string");
var import_appUtils = require("../lib/appUtils");
function getState(part, userToSend, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID) {
  var _a, _b;
  let text = "";
  let i = 1;
  const parse_mode = (_a = part.getData) == null ? void 0 : _a[0].parse_mode;
  (_b = part.getData) == null ? void 0 : _b.forEach(async (element) => {
    try {
      import_main.adapter.log.debug(`Get Value ID: ${element.id}`);
      const specifiedSelektor = "functions=";
      const id = element.id;
      let textToSend = "";
      if (id.indexOf(specifiedSelektor) != -1) {
        await (0, import_action.idBySelector)({
          selector: id,
          text: element.text,
          userToSend,
          newline: element.newline,
          telegramInstance,
          one_time_keyboard,
          resize_keyboard,
          userListWithChatID
        });
        return;
      }
      if (element.text.includes("binding:")) {
        import_main.adapter.log.debug("Binding");
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
      await import_main.adapter.getForeignStateAsync(id).then(async (state) => {
        var _a2, _b2, _c;
        if (!(0, import_utils.isDefined)(state)) {
          import_main.adapter.log.error("The state is empty!");
          return;
        }
        const valueForJson = (_b2 = (_a2 = state.val) == null ? void 0 : _a2.toString()) != null ? _b2 : "";
        import_main.adapter.log.debug(`State: ${(0, import_string.jsonString)(state)}`);
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
            textToSend = (0, import_time.integrateTimeIntoText)(textToSend, state.val);
            val = "";
          }
          if (textToSend.includes("math:")) {
            const result = (0, import_appUtils.calcValue)(textToSend, val, import_main.adapter);
            if (result) {
              textToSend = result.textToSend;
              val = result.val;
              import_main.adapter.log.debug(`TextToSend: ${textToSend} val: ${val}`);
            }
          }
          if (textToSend.includes("round:")) {
            const result = (0, import_appUtils.roundValue)(String(val), textToSend);
            if (result) {
              import_main.adapter.log.debug(
                `The Value was rounded ${JSON.stringify(val)} to ${JSON.stringify(result.val)}`
              );
              val = result.val;
              textToSend = result.textToSend;
            }
          }
          if (textToSend.includes("{json")) {
            if ((0, import_string.decomposeText)(textToSend, "{json", "}").substring.includes("TextTable")) {
              const result = (0, import_jsonTable.createTextTableFromJson)(valueForJson, textToSend);
              if (result) {
                await (0, import_telegram.sendToTelegram)({
                  userToSend,
                  textToSend: result,
                  instanceTelegram: telegramInstance,
                  resize_keyboard,
                  one_time_keyboard,
                  userListWithChatID,
                  parse_mode
                });
                return;
              }
              import_main.adapter.log.debug("Cannot create a Text-Table");
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
                userToSend,
                textToSend: "The state is empty!",
                instanceTelegram: telegramInstance,
                resize_keyboard,
                one_time_keyboard,
                userListWithChatID,
                parse_mode
              });
              import_main.adapter.log.debug("The state is empty!");
              return;
            }
          }
          const { newValue: _val, textToSend: _text, error } = (0, import_string.getValueToExchange)(import_main.adapter, textToSend, val);
          val = _val;
          textToSend = _text;
          if (!error) {
            import_main.adapter.log.debug(`Value Changed to: ${textToSend}`);
          } else {
            import_main.adapter.log.debug(`No Change`);
          }
          if (textToSend.indexOf("&&") != -1) {
            text += `${textToSend.replace("&&", val.toString())}${newline}`;
          } else {
            text += `${textToSend} ${val}${newline}`;
          }
        } else {
          text += `${val} ${newline}`;
        }
        import_main.adapter.log.debug(`Text: ${text}`);
        if (i == ((_c = part.getData) == null ? void 0 : _c.length)) {
          if (userToSend) {
            await (0, import_telegram.sendToTelegram)({
              userToSend,
              textToSend: text,
              instanceTelegram: telegramInstance,
              resize_keyboard,
              one_time_keyboard,
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

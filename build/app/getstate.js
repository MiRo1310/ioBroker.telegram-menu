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
var import_config = require("../config/config");
var import_logging = require("./logging");
async function getState(part, userToSend, telegramParams) {
  var _a;
  try {
    const parse_mode = (_a = part.getData) == null ? void 0 : _a[0].parse_mode;
    const valueArrayForCorrectOrder = [];
    const promises = (part.getData || []).map(async ({ newline, text, id }, index) => {
      var _a2;
      import_main.adapter.log.debug(`Get Value ID: ${id}`);
      if (id.includes(import_config.config.functionSelektor)) {
        await (0, import_action.idBySelector)({
          selector: id,
          text,
          userToSend,
          newline,
          telegramParams
        });
        return;
      }
      if (text.includes(import_config.config.binding.start)) {
        await (0, import_action.bindingFunc)(text, userToSend, telegramParams, parse_mode);
        return;
      }
      const state = await import_main.adapter.getForeignStateAsync(id);
      if (!(0, import_utils.isDefined)(state)) {
        import_main.adapter.log.error("The state is empty!");
        valueArrayForCorrectOrder[index] = "N/A";
        return Promise.resolve();
      }
      const stateValue = (0, import_string.cleanUpString)((_a2 = state.val) == null ? void 0 : _a2.toString());
      let modifiedStateVal = stateValue;
      let modifiedTextToSend = text;
      if (text.includes(import_config.config.timestamp.ts) || text.includes(import_config.config.timestamp.lc)) {
        modifiedTextToSend = await (0, import_utilities.processTimeIdLc)(text, id);
        modifiedStateVal = "";
      }
      if (modifiedTextToSend.includes(import_config.config.time)) {
        modifiedTextToSend = (0, import_time.integrateTimeIntoText)(modifiedTextToSend, stateValue);
        modifiedStateVal = "";
      }
      if (modifiedTextToSend.includes(import_config.config.math.start)) {
        const { textToSend, calculated, error: error2 } = (0, import_appUtils.calcValue)(modifiedTextToSend, modifiedStateVal, import_main.adapter);
        if (!error2) {
          modifiedTextToSend = textToSend;
          modifiedStateVal = calculated;
          import_main.adapter.log.debug(`TextToSend: ${modifiedTextToSend} val: ${modifiedStateVal}`);
        }
      }
      if (modifiedTextToSend.includes(import_config.config.round.start)) {
        const { error: error2, text: text2, roundedValue } = (0, import_appUtils.roundValue)(String(modifiedStateVal), modifiedTextToSend);
        if (!error2) {
          import_main.adapter.log.debug(`Rounded from ${(0, import_string.jsonString)(modifiedStateVal)} to ${(0, import_string.jsonString)(roundedValue)}`);
          modifiedStateVal = roundedValue;
          modifiedTextToSend = text2;
        }
      }
      if (modifiedTextToSend.includes(import_config.config.json.start)) {
        const { substring } = (0, import_string.decomposeText)(modifiedTextToSend, import_config.config.json.start, import_config.config.json.end);
        if (substring.includes(import_config.config.json.textTable)) {
          const result = (0, import_jsonTable.createTextTableFromJson)(stateValue, modifiedTextToSend);
          if (result) {
            await (0, import_telegram.sendToTelegram)({
              userToSend,
              textToSend: result,
              telegramParams,
              parse_mode
            });
            return;
          }
          import_main.adapter.log.debug("Cannot create a Text-Table");
        } else {
          const result = (0, import_jsonTable.createKeyboardFromJson)(stateValue, modifiedTextToSend, id, userToSend);
          if (stateValue && stateValue.length > 0) {
            if (result && result.text && result.keyboard) {
              (0, import_telegram.sendToTelegramSubmenu)(userToSend, result.text, result.keyboard, telegramParams, parse_mode);
            }
            return;
          }
          await (0, import_telegram.sendToTelegram)({
            userToSend,
            textToSend: "The state is empty!",
            telegramParams,
            parse_mode
          });
          import_main.adapter.log.debug("The state is empty!");
          return;
        }
      }
      const {
        newValue: _val,
        textToSend: _text,
        error
      } = (0, import_string.getValueToExchange)(import_main.adapter, modifiedTextToSend, modifiedStateVal);
      modifiedStateVal = String(_val);
      modifiedTextToSend = _text;
      import_main.adapter.log.debug(!error ? `Value Changed to: ${modifiedTextToSend}` : `No Change`);
      const isNewline = (0, import_string.getNewline)(newline);
      valueArrayForCorrectOrder[index] = modifiedTextToSend.includes(import_config.config.rowSplitter) ? `${modifiedTextToSend.replace(import_config.config.rowSplitter, modifiedStateVal.toString())}${isNewline}` : `${modifiedTextToSend} ${modifiedStateVal} ${isNewline}`;
    });
    await Promise.all(promises);
    await (0, import_telegram.sendToTelegram)({
      userToSend,
      textToSend: valueArrayForCorrectOrder.join(""),
      telegramParams,
      parse_mode
    });
  } catch (error) {
    (0, import_logging.errorLogger)("Error GetData:", error, import_main.adapter);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getState
});
//# sourceMappingURL=getstate.js.map

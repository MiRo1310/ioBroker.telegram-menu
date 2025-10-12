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
var import_config = require("@b/config/config");
var import_parseMode = require("@b/app/parseMode");
var import_idBySelector = require("@b/app/idBySelector");
var import_action = require("@b/app/action");
var import_utils = require("@b/lib/utils");
var import_string = require("@b/lib/string");
var import_utilities = require("@b/lib/utilities");
var import_time = require("@b/lib/time");
var import_appUtils = require("@b/lib/appUtils");
var import_jsonTable = require("@b/app/jsonTable");
var import_telegram = require("@b/app/telegram");
var import_exchangeValue = require("@b/lib/exchangeValue");
var import_logging = require("@b/app/logging");
async function getState(instance, part, userToSend, telegramParams) {
  const adapter = telegramParams.adapter;
  try {
    const parse_mode = (0, import_parseMode.isParseModeFirstElement)(part);
    const valueArrayForCorrectOrder = [];
    const promises = (part.getData || []).map(async ({ newline, text, id }, index) => {
      var _a;
      adapter.log.debug(`Get Value ID: ${id}`);
      if (id.includes(import_config.config.functionSelektor)) {
        await (0, import_idBySelector.idBySelector)({
          instance,
          adapter,
          selector: id,
          text,
          userToSend,
          newline,
          telegramParams
        });
        return;
      }
      if (text.includes(import_config.config.binding.start)) {
        await (0, import_action.bindingFunc)(adapter, instance, text, userToSend, telegramParams, parse_mode);
        return;
      }
      const state = await adapter.getForeignStateAsync(id);
      if (!(0, import_utils.isDefined)(state)) {
        adapter.log.error("The state is empty!");
        valueArrayForCorrectOrder[index] = "N/A";
        return Promise.resolve();
      }
      const stateValue = (0, import_string.cleanUpString)((_a = state.val) == null ? void 0 : _a.toString());
      let modifiedStateVal = stateValue;
      let modifiedTextToSend = text;
      if (text.includes(import_config.config.timestamp.ts) || text.includes(import_config.config.timestamp.lc)) {
        modifiedTextToSend = await (0, import_utilities.setTimeValue)(adapter, text, id);
        modifiedStateVal = "";
      }
      if (modifiedTextToSend.includes(import_config.config.time)) {
        modifiedTextToSend = (0, import_time.integrateTimeIntoText)(modifiedTextToSend, stateValue);
        modifiedStateVal = "";
      }
      if (modifiedTextToSend.includes(import_config.config.math.start)) {
        const { textToSend, calculated, error: error2 } = (0, import_appUtils.calcValue)(modifiedTextToSend, modifiedStateVal, adapter);
        if (!error2) {
          modifiedTextToSend = textToSend;
          modifiedStateVal = calculated;
          adapter.log.debug(`textToSend : ${modifiedTextToSend} val : ${modifiedStateVal}`);
        }
      }
      if (modifiedTextToSend.includes(import_config.config.round.start)) {
        const { error: error2, text: text2, roundedValue } = (0, import_appUtils.roundValue)(String(modifiedStateVal), modifiedTextToSend);
        if (!error2) {
          adapter.log.debug(`Rounded from ${(0, import_string.jsonString)(modifiedStateVal)} to ${(0, import_string.jsonString)(roundedValue)}`);
          modifiedStateVal = roundedValue;
          modifiedTextToSend = text2;
        }
      }
      if (modifiedTextToSend.includes(import_config.config.json.start)) {
        const { substring } = (0, import_string.decomposeText)(modifiedTextToSend, import_config.config.json.start, import_config.config.json.end);
        if (substring.includes(import_config.config.json.textTable)) {
          const result = (0, import_jsonTable.createTextTableFromJson)(adapter, stateValue, modifiedTextToSend);
          if (result) {
            await (0, import_telegram.sendToTelegram)({
              instance,
              userToSend,
              textToSend: result,
              telegramParams,
              parse_mode
            });
            return;
          }
          adapter.log.debug("Cannot create a Text-Table");
        } else {
          const result = (0, import_jsonTable.createKeyboardFromJson)(adapter, stateValue, modifiedTextToSend, id, userToSend);
          if (stateValue && stateValue.length > 0) {
            if ((result == null ? void 0 : result.text) && (result == null ? void 0 : result.keyboard)) {
              (0, import_telegram.sendToTelegramSubmenu)(
                instance,
                userToSend,
                result.text,
                result.keyboard,
                telegramParams,
                parse_mode
              );
            }
            return;
          }
          await (0, import_telegram.sendToTelegram)({
            instance,
            userToSend,
            textToSend: "The state is empty!",
            telegramParams,
            parse_mode
          });
          adapter.log.debug("The state is empty!");
          return;
        }
      }
      const { textToSend: _text, error } = (0, import_exchangeValue.exchangeValue)(adapter, modifiedTextToSend, modifiedStateVal);
      const isNewline = (0, import_string.getNewline)(newline);
      modifiedTextToSend = `${_text} ${isNewline}`;
      adapter.log.debug(!error ? `Value Changed to: ${modifiedTextToSend}` : `No Change`);
      valueArrayForCorrectOrder[index] = modifiedTextToSend;
    });
    await Promise.all(promises);
    if (valueArrayForCorrectOrder.length) {
      await (0, import_telegram.sendToTelegram)({
        instance,
        userToSend,
        textToSend: valueArrayForCorrectOrder.join(""),
        telegramParams,
        parse_mode
      });
    }
  } catch (error) {
    (0, import_logging.errorLogger)("Error GetData:", error, adapter);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getState
});
//# sourceMappingURL=getstate.js.map

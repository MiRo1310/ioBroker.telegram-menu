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
var math_exports = {};
__export(math_exports, {
  calcValue: () => calcValue,
  evaluate: () => evaluate
});
module.exports = __toCommonJS(math_exports);
var import_logging = require("../app/logging");
var import_string = require("./string");
var import_config = require("../config/config");
var import_main = require("../main");
function evaluate(val, adapter) {
  var _a;
  try {
    return { val: (_a = eval(val.join(" "))) != null ? _a : "", error: false };
  } catch (e) {
    (0, import_logging.errorLogger)("Error Eval:", e, adapter);
    return { val: "", error: true };
  }
}
function calcValue(textToSend, val2) {
  const { substringExcludedSearch, textWithoutSubstring } = (0, import_string.decomposeText)(
    textToSend,
    import_config.config.math.start,
    import_config.config.math.end
  );
  const { val: evalVal, error } = evaluate([val2, substringExcludedSearch], import_main.adapter);
  return error ? { textToSend: textWithoutSubstring, val: val2, error } : { textToSend: textWithoutSubstring, val: evalVal, error };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  calcValue,
  evaluate
});
//# sourceMappingURL=math.js.map

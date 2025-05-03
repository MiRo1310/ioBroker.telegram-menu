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
var sentry_exports = {};
__export(sentry_exports, {
  sendToSentry: () => sendToSentry
});
module.exports = __toCommonJS(sentry_exports);
const sendToSentry = (error, adapter) => {
  if (adapter.supportsFeature && adapter.supportsFeature("PLUGINS")) {
    const sentryInstance = adapter.getPluginInstance("sentry");
    if (sentryInstance) {
      const Sentry = sentryInstance.getSentryObject();
      Sentry == null ? void 0 : Sentry.withScope(
        (scope) => {
          scope.setLevel("info");
          scope.setExtra("key", "value");
          Sentry.captureMessage("Event name", "info");
        }
      );
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  sendToSentry
});
//# sourceMappingURL=sentry.js.map

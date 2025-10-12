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
var events_exports = {};
__export(events_exports, {
  getInstances: () => getInstances,
  getInstancesFromEventsById: () => getInstancesFromEventsById
});
module.exports = __toCommonJS(events_exports);
const getInstances = (menuToGo, menusWithUsers) => {
  return menuToGo.flatMap((m) => {
    var _a;
    return (_a = menusWithUsers[m]) != null ? _a : [];
  });
};
const getInstancesFromEventsById = (action, id, menusWithUsers) => {
  const event = action && Object.keys(action).filter((a) => {
    var _a;
    return (_a = action[a]) == null ? void 0 : _a.events.filter((e) => e.ID.filter((eventId) => eventId === id));
  });
  console.log(event);
  return { isEvent: !!(event && (event == null ? void 0 : event.length)), eventInstanceList: getInstances(event != null ? event : [], menusWithUsers) };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getInstances,
  getInstancesFromEventsById
});
//# sourceMappingURL=events.js.map

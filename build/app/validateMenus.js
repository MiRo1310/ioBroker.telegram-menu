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
var validateMenus_exports = {};
__export(validateMenus_exports, {
  isCreateDynamicSwitch: () => isCreateDynamicSwitch,
  isCreateSubmenuNumber: () => isCreateSubmenuNumber,
  isCreateSubmenuPercent: () => isCreateSubmenuPercent,
  isCreateSwitch: () => isCreateSwitch,
  isDeleteMenu: () => isDeleteMenu,
  isFirstMenuValue: () => isFirstMenuValue,
  isMenuBack: () => isMenuBack,
  isSecondMenuValue: () => isSecondMenuValue,
  isSetDynamicSwitchVal: () => isSetDynamicSwitchVal,
  isSetSubmenuNumber: () => isSetSubmenuNumber,
  isSetSubmenuPercent: () => isSetSubmenuPercent,
  isSubmenuOrMenu: () => isSubmenuOrMenu
});
module.exports = __toCommonJS(validateMenus_exports);
const isMenuBack = (str) => str.includes("menu:back");
const isDeleteMenu = (str) => str.includes("delete");
const isCreateSwitch = (str) => str.includes("switch");
const isFirstMenuValue = (str) => str.includes("first");
const isSecondMenuValue = (str) => str.includes("second");
const isCreateDynamicSwitch = (str) => str.includes("dynSwitch");
const isSetDynamicSwitchVal = (str) => str.includes("dynS");
const isSubmenuOrMenu = (val) => val.startsWith("menu") || val.startsWith("submenu");
const isCreateSubmenuPercent = (menuString, cbData) => !menuString.includes("submenu") && cbData.includes("percent");
const isSetSubmenuPercent = (menuString, step) => menuString.includes(`submenu:percent${step}`);
const isSetSubmenuNumber = (menuString) => (
  // menuString.includes(`submenu:${cbData}`);
  menuString.includes(`submenu:number`)
);
function isCreateSubmenuNumber(menuString, callbackData) {
  return !menuString.includes("submenu") && callbackData.includes("number");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  isCreateDynamicSwitch,
  isCreateSubmenuNumber,
  isCreateSubmenuPercent,
  isCreateSwitch,
  isDeleteMenu,
  isFirstMenuValue,
  isMenuBack,
  isSecondMenuValue,
  isSetDynamicSwitchVal,
  isSetSubmenuNumber,
  isSetSubmenuPercent,
  isSubmenuOrMenu
});
//# sourceMappingURL=validateMenus.js.map

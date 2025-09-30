"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCreateSubmenuNumber = exports.isSetSubmenuNumber = exports.isSetSubmenuPercent = exports.isCreateSubmenuPercent = exports.isSubmenuOrMenu = exports.isSetDynamicSwitchVal = exports.isCreateDynamicSwitch = exports.isSecondMenuValue = exports.isFirstMenuValue = exports.isCreateSwitch = exports.isDeleteMenu = exports.isMenuBack = void 0;
const isMenuBack = (str) => str.includes('menu:back');
exports.isMenuBack = isMenuBack;
const isDeleteMenu = (str) => str.includes('delete');
exports.isDeleteMenu = isDeleteMenu;
const isCreateSwitch = (str) => str.includes('switch');
exports.isCreateSwitch = isCreateSwitch;
const isFirstMenuValue = (str) => str.includes('first');
exports.isFirstMenuValue = isFirstMenuValue;
const isSecondMenuValue = (str) => str.includes('second');
exports.isSecondMenuValue = isSecondMenuValue;
const isCreateDynamicSwitch = (str) => str.includes('dynSwitch');
exports.isCreateDynamicSwitch = isCreateDynamicSwitch;
const isSetDynamicSwitchVal = (str) => str.includes('dynS');
exports.isSetDynamicSwitchVal = isSetDynamicSwitchVal;
const isSubmenuOrMenu = (val) => val.startsWith('menu') || val.startsWith('submenu');
exports.isSubmenuOrMenu = isSubmenuOrMenu;
const isCreateSubmenuPercent = (menuString, cbData) => !menuString.includes('submenu') && cbData.includes('percent');
exports.isCreateSubmenuPercent = isCreateSubmenuPercent;
const isSetSubmenuPercent = (menuString, step) => menuString.includes(`submenu:percent${step}`);
exports.isSetSubmenuPercent = isSetSubmenuPercent;
const isSetSubmenuNumber = (menuString) => 
// menuString.includes(`submenu:${cbData}`);
menuString.includes(`submenu:number`);
exports.isSetSubmenuNumber = isSetSubmenuNumber;
function isCreateSubmenuNumber(menuString, callbackData) {
    return !menuString.includes('submenu') && callbackData.includes('number');
}
exports.isCreateSubmenuNumber = isCreateSubmenuNumber;
//# sourceMappingURL=validateMenus.js.map
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const btn_expand_1 = __importDefault(require("@components/btn-Input/btn-expand"));
const adapter_react_v5_1 = require("@iobroker/adapter-react-v5");
const react_1 = __importStar(require("react"));
const AppContentHeaderMenuButtons_1 = __importDefault(require("./AppContentHeaderMenuButtons"));
const AppContentHeaderMenuList_1 = __importDefault(require("./AppContentHeaderMenuList"));
class HeaderMenu extends react_1.Component {
    eventOnMouse = (event) => {
        if (!event) {
            return;
        }
        if (event.type === 'mouseenter') {
            this.props.callback.setStateApp({ showPopupMenuList: true });
        }
        if (event.type === 'mouseleave') {
            this.props.callback.setStateApp({ showPopupMenuList: false });
        }
    };
    handleClick = () => {
        this.props.callback.setStateApp({ showPopupMenuList: !this.props.data.state.showPopupMenuList });
    };
    showList() {
        return this.props.data.state.showPopupMenuList;
    }
    isActiveMenu() {
        return this.props.data.state.activeMenu != undefined;
    }
    render() {
        return (react_1.default.createElement("div", { className: "header__button_row" },
            react_1.default.createElement("div", { style: { width: 'auto', display: 'flex', flexWrap: 'nowrap' } },
                react_1.default.createElement("div", { onMouseEnter: this.eventOnMouse, onMouseLeave: this.eventOnMouse, className: "inline-block relative" },
                    react_1.default.createElement(btn_expand_1.default, { isOpen: this.showList(), callback: this.handleClick, label: this.isActiveMenu() ? this.props.data.state.activeMenu : adapter_react_v5_1.I18n.t('createMenu'), class: "btn__menu_expand button button__primary" }),
                    this.showList() && this.isActiveMenu() ? (react_1.default.createElement(AppContentHeaderMenuList_1.default, { usersInGroup: this.props.data.state.native.usersInGroup, callback: this.props.callback })) : null),
                this.props.children),
            react_1.default.createElement(AppContentHeaderMenuButtons_1.default, { callback: this.props.callback, data: this.props.data })));
    }
}
exports.default = HeaderMenu;
//# sourceMappingURL=AppContentHeaderMenu.js.map
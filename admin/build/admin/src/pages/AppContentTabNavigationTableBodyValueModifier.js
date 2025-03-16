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
const react_1 = __importStar(require("react"));
const actionUtils_1 = require("@/lib/actionUtils");
const string_1 = require("@/lib/string");
const AppContentTabNavigationTableBodyValueModifierPopup_1 = __importDefault(require("@/pages/AppContentTabNavigationTableBodyValueModifierPopup"));
class AppContentTabNavigationTableBodyValueModifier extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            menuNotFound: false,
            clickedTrigger: null,
        };
    }
    getValue() {
        const val = this.props.row[this.props.entry.name];
        if (val.includes('menu:')) {
            return [val];
        }
        return (0, string_1.splitTrimAndJoin)(val, ',', ' , ')
            .split('&&')
            .map(row => row.trim());
    }
    isValue() {
        return this.props.entry.name === 'value';
    }
    findMenuInNav = (button) => {
        const nav = this.props.data.state.native.data.nav;
        const menuKeyValue = Object.entries(nav).find(([_, value]) => value.find(element => element.call === button));
        if (!menuKeyValue) {
            return;
        }
        return menuKeyValue[0];
    };
    findMenuInAction = (button) => {
        const action = this.props.data.state.native.data.action;
        for (const menu of Object.keys(action)) {
            for (const submenu of Object.keys(action[menu])) {
                for (const element of action[menu][submenu]) {
                    if (element?.trigger?.[0] === button) {
                        return { menu, submenu };
                    }
                }
            }
        }
        return;
    };
    buttonClick = (button) => {
        const string = AppContentTabNavigationTableBodyValueModifier.getButtonTriggerValue(button);
        const menu = this.findMenuInNav(string);
        this.setState({ clickedTrigger: string });
        if (menu) {
            this.props.callback.setStateApp({ tab: 'nav', activeMenu: menu, clickedTriggerInNav: string });
            return;
        }
        const menuAction = this.findMenuInAction(string);
        if (menuAction) {
            this.props.callback.setStateApp({
                tab: 'action',
                activeMenu: menuAction.menu,
                subTab: menuAction.submenu,
                clickedTriggerInNav: string,
            });
            return;
        }
        this.setState({ menuNotFound: true });
    };
    static isMenuFunction(button) {
        return button.includes('menu:');
    }
    static getButtonTriggerValue = (buttonText) => {
        if (AppContentTabNavigationTableBodyValueModifier.isMenuFunction(buttonText)) {
            return buttonText.split(':')[2].trim();
        }
        return buttonText;
    };
    render() {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            this.state.menuNotFound ? (react_1.default.createElement(AppContentTabNavigationTableBodyValueModifierPopup_1.default, { callback: () => this.setState({ menuNotFound: false }), data: this.props.data, clickedTrigger: this.state.clickedTrigger })) : null,
            this.isValue() ? (react_1.default.createElement("div", { className: 'table__row_container' }, this.getValue().map((row, i) => row !== '' ? (react_1.default.createElement("p", { className: 'nav__row noneDraggable', key: i }, (!AppContentTabNavigationTableBodyValueModifier.isMenuFunction(row)
                ? row.split(',')
                : [row])
                .map(button => button.trim())
                .map((button, index) => (react_1.default.createElement("span", { className: `row__button cursor-pointer ${AppContentTabNavigationTableBodyValueModifier.isMenuFunction(button) ? 'row__submenu' : ''}`, key: index, onClick: () => this.buttonClick(button) },
                button,
                ' '))))) : null))) : this.props.entry.name === 'parse_mode' ? (react_1.default.createElement("span", null, (0, actionUtils_1.getElementIcon)(this.props.row[this.props.entry.name]))) : this.props.row[this.props.entry.name] !== '-' ? (react_1.default.createElement("span", null, this.props.row[this.props.entry.name])) : null));
    }
}
exports.default = AppContentTabNavigationTableBodyValueModifier;
//# sourceMappingURL=AppContentTabNavigationTableBodyValueModifier.js.map
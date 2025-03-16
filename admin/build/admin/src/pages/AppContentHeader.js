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
const material_1 = require("@mui/material");
const AppContentHeaderMenu_1 = __importDefault(require("@/pages/AppContentHeaderMenu"));
const AppContentHeaderTelegramUsers_1 = __importDefault(require("@/pages/AppContentHeaderTelegramUsers"));
const btn_expand_1 = __importDefault(require("@components/btn-Input/btn-expand"));
const adapter_react_v5_1 = require("@iobroker/adapter-react-v5");
class MainActions extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            menuOpen: false,
        };
    }
    isSettings() {
        return this.props.data.state.tab === 'settings';
    }
    render() {
        return (react_1.default.createElement(material_1.Grid2, { container: true, className: "Grid-HeaderMenu" },
            !this.isSettings() ? (react_1.default.createElement(material_1.Grid2, { container: true, size: 12 },
                react_1.default.createElement(AppContentHeaderMenu_1.default, { data: this.props.data, callback: this.props.callback },
                    react_1.default.createElement(btn_expand_1.default, { isOpen: this.state.menuOpen, callback: () => this.setState({ menuOpen: !this.state.menuOpen }), label: adapter_react_v5_1.I18n.t('telegramUser'), class: "btn__menu_expand button button__primary" })))) : null,
            react_1.default.createElement(material_1.Grid2, { size: 12, container: true }, !this.isSettings() ? (react_1.default.createElement(AppContentHeaderTelegramUsers_1.default, { data: {
                    state: this.props.data.state,
                    usersInGroup: this.props.data.state.native.usersInGroup,
                    userActiveCheckbox: this.props.data.state.native.userActiveCheckbox,
                    activeMenu: this.props.data.state.activeMenu || '',
                    menuOpen: this.state.menuOpen,
                }, callback: this.props.callback })) : null)));
    }
}
exports.default = MainActions;
//# sourceMappingURL=AppContentHeader.js.map
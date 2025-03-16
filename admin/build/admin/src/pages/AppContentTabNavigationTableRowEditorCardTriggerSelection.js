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
const select_1 = __importDefault(require("@components/btn-Input/select"));
const Button_1 = __importDefault(require("../components/Button"));
const actionUtils_1 = require("@/lib/actionUtils");
const Utils_1 = require("@/lib/Utils");
const adapter_react_v5_1 = require("@iobroker/adapter-react-v5");
class AppContentTabNavigationTableRowEditorCardTriggerSelection extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: '',
        };
    }
    addSelectedMenuToInputAsButton = () => {
        this.props.callback(this.state.selected);
        this.setState({ selected: '' });
    };
    setSelectedItem(e) {
        this.setState({ selected: e.val });
    }
    getSelectOptions = () => {
        const nav = this.props.data.state.native.data.nav;
        const users = this.props.data.state.native.usersInGroup;
        const activeMenu = this.props.data.state.activeMenu;
        const menus = (0, Utils_1.deleteDoubleEntriesInArray)((0, actionUtils_1.getMenusToSearchIn)(users[activeMenu], users));
        let options = [];
        menus.forEach(menu => {
            nav[menu].forEach(trigger => {
                options.push(trigger.call);
            });
        });
        options = options
            .map(item => item.trim())
            .filter(trigger => !['-', ''].includes(trigger))
            .sort();
        return options;
    };
    render() {
        return (react_1.default.createElement("div", { className: "flex items-center mt-2" },
            react_1.default.createElement("p", { className: "mr-2" }, adapter_react_v5_1.I18n.t('addCreatedMenus')),
            react_1.default.createElement("div", null,
                react_1.default.createElement(select_1.default, { id: 'nav-triggers', options: this.getSelectOptions(), placeholder: adapter_react_v5_1.I18n.t('choose'), selected: this.state.selected, callback: e => this.setSelectedItem(e) })),
            react_1.default.createElement(Button_1.default, { id: 'button', callback: this.addSelectedMenuToInputAsButton, className: `button__ok button ${this.state.selected === '' ? 'button__disabled' : ''}`, disabled: this.state.selected === '' }, adapter_react_v5_1.I18n.t('add'))));
    }
}
exports.default = AppContentTabNavigationTableRowEditorCardTriggerSelection;
//# sourceMappingURL=AppContentTabNavigationTableRowEditorCardTriggerSelection.js.map
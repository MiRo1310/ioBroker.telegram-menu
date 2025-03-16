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
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const adapter_react_v5_1 = require("@iobroker/adapter-react-v5");
const entries_1 = require("@/config/entries");
class AppContentNavigation extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    handleChange = (val) => {
        if (['nav', 'settings', 'description'].includes(val)) {
            this.props.callback.setStateApp({ tab: val, clickedTriggerInNav: null });
            return;
        }
        this.props.callback.setStateApp({ tab: 'action', subTab: val, clickedTriggerInNav: null });
    };
    tabs = [
        {
            label: 'navigation',
            value: 'nav',
        },
    ];
    getTabs = () => {
        entries_1.tabValues.map(tab => {
            if (this.tabs.find(t => t.value === tab.value)) {
                return;
            }
            this.tabs.push({ label: tab.label, value: tab.value });
        });
        return this.tabs;
    };
    isActive = (val) => {
        return (this.props.data.state.tab === val ||
            (this.props.data.state.subTab === val && this.props.data.state.tab === 'action'));
    };
    render() {
        return (react_1.default.createElement(material_1.Box, { sx: { borderBottom: 1, borderColor: 'divider' } },
            react_1.default.createElement("div", { className: 'flex justify-between items-start app__navigation_row' },
                react_1.default.createElement("div", { className: 'flex flex-wrap' }, this.getTabs().map(tab => (react_1.default.createElement("button", { key: tab.label, className: `button button__primary ${this.isActive(tab.value) ? 'button__active' : ''}`, onClick: () => this.handleChange(tab.value) }, adapter_react_v5_1.I18n.t(tab.label))))),
                react_1.default.createElement("div", { className: 'flex items-center ' },
                    react_1.default.createElement("button", { key: 'description', className: `button button__primary ${this.isActive('description') ? 'button__active' : ''}`, onClick: () => this.handleChange('description') }, adapter_react_v5_1.I18n.t('descriptions')),
                    react_1.default.createElement("button", { key: 'settings', className: `icon button__primary ${this.isActive('settings') ? 'button__active' : ''}`, onClick: () => this.handleChange('settings') },
                        react_1.default.createElement("i", { className: "material-icons" }, "settings"))))));
    }
}
exports.default = AppContentNavigation;
//# sourceMappingURL=AppContentNavigation.js.map
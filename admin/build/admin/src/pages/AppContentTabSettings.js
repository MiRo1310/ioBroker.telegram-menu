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
const input_1 = __importDefault(require("@components/btn-Input/input"));
const checkbox_1 = __importDefault(require("@components/btn-Input/checkbox"));
const adapter_react_v5_1 = require("@iobroker/adapter-react-v5");
const select_1 = __importDefault(require("@components/btn-Input/select"));
const material_1 = require("@mui/material");
class Settings extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '/opt/iobroker/grafana/',
            options: ['One', 'Two', 'Three'],
        };
    }
    onClickCheckbox = ({ isChecked, id }) => {
        const checkboxes = { ...this.props.data.state.native.checkbox };
        checkboxes[id] = isChecked;
        this.props.callback.updateNative('checkbox', checkboxes);
    };
    componentDidMount() {
        if (!this.props.data.state.native.checkbox.sendMenuAfterRestart) {
            const checkboxes = { ...this.props.data.state.native.checkbox };
            checkboxes.sendMenuAfterRestart = true;
            this.props.callback.updateNative('checkbox', checkboxes);
        }
    }
    render() {
        return (react_1.default.createElement("div", { className: "settings__tab" },
            react_1.default.createElement("h1", null, adapter_react_v5_1.I18n.t('settings')),
            react_1.default.createElement(material_1.Grid2, { container: true, spacing: 1 },
                react_1.default.createElement(material_1.Grid2, { size: 12 },
                    react_1.default.createElement(select_1.default, { placeholder: "placeholderInstance", options: this.props.data.state.instances || [], label: adapter_react_v5_1.I18n.t('telegramInstance'), name: "instance", selected: this.props.data.state.native.instance, id: "instance", callback: ({ id, val }) => this.props.callback.updateNative(id, val), setNative: true })),
                react_1.default.createElement(material_1.Grid2, { size: { xs: 10, sm: 10, lg: 8 } },
                    react_1.default.createElement("div", { className: 'flex items-start' },
                        react_1.default.createElement(input_1.default, { label: adapter_react_v5_1.I18n.t('textNoEntry'), placeholder: "No entry found", callback: ({ id, val }) => this.props.callback.updateNative(id, val), id: "textNoEntry", value: this.props.data.state.native.textNoEntry || adapter_react_v5_1.I18n.t('entryNotFound'), class: 'input__container--settings' }),
                        react_1.default.createElement(checkbox_1.default, { label: adapter_react_v5_1.I18n.t('active'), id: "checkboxNoValueFound", isChecked: this.props.data.state.native.checkbox.checkboxNoValueFound || false, callback: this.onClickCheckbox, index: 0 }))),
                react_1.default.createElement(material_1.Grid2, { size: { xs: 12, sm: 12, lg: 6 } },
                    react_1.default.createElement(input_1.default, { label: adapter_react_v5_1.I18n.t('Token Grafana'), placeholder: "Token Grafana", callback: ({ id, val }) => this.props.callback.updateNative(id, val), id: "tokenGrafana", value: this.props.data.state.native.tokenGrafana || '', class: 'input__container--settings' })),
                react_1.default.createElement(material_1.Grid2, { size: { xs: 12, sm: 12, lg: 6 } },
                    react_1.default.createElement(input_1.default, { label: adapter_react_v5_1.I18n.t('Directory'), placeholder: "/opt/iobroker/media/", callback: ({ id, val }) => this.props.callback.updateNative(id, val), id: "directory", value: this.props.data.state.native.directory || '/opt/iobroker/media/', class: 'input__container--settings' })),
                react_1.default.createElement(material_1.Grid2, { size: 12 },
                    react_1.default.createElement(checkbox_1.default, { label: "Resize Keyboard", id: "resKey", isChecked: this.props.data.state.native.checkbox.resKey || false, callback: this.onClickCheckbox, title: "Requests clients to resize the keyboard vertically for optimal fit (e.g., make the keyboard smaller if there are just two rows of buttons). Defaults to false, in which case the custom keyboard is always of the same height as the app's standard keyboard.", class: "title", index: 1 })),
                react_1.default.createElement(material_1.Grid2, { size: 12 },
                    react_1.default.createElement(checkbox_1.default, { label: "One Time Keyboard", id: "oneTiKey", isChecked: this.props.data.state.native.checkbox.oneTiKey || false, callback: this.onClickCheckbox, title: "oneTimeKey", class: "title", index: 2 })),
                react_1.default.createElement(material_1.Grid2, { size: 12 },
                    react_1.default.createElement(checkbox_1.default, { label: adapter_react_v5_1.I18n.t('sendMenuAfterRestart'), id: "sendMenuAfterRestart", isChecked: this.props.data.state.native.checkbox.sendMenuAfterRestart === null ||
                            this.props.data.state.native.checkbox.sendMenuAfterRestart === undefined
                            ? true
                            : this.props.data.state.native.checkbox.sendMenuAfterRestart, callback: this.onClickCheckbox, index: 3 })))));
    }
}
exports.default = Settings;
//# sourceMappingURL=AppContentTabSettings.js.map
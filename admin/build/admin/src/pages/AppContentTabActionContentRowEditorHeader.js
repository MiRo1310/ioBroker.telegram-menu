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
const actionUtils_js_1 = require("@/lib/actionUtils.js");
const Utils_js_1 = require("@/lib/Utils.js");
const Button_1 = __importDefault(require("@components/Button"));
const checkbox_1 = __importDefault(require("@components/btn-Input/checkbox"));
const select_1 = __importDefault(require("@components/btn-Input/select"));
const react_1 = __importStar(require("react"));
const adapter_react_v5_1 = require("@iobroker/adapter-react-v5");
class AppContentTabActionContentRowEditorInputAboveTable extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        const { newRow, newUnUsedTrigger } = this.props.data;
        return (react_1.default.createElement("div", { className: "editor__header" },
            react_1.default.createElement(Button_1.default, { callbackValue: true, callback: this.props.callback.openCopyModal, className: `${!this.props.data.isMinOneCheckboxChecked ? 'button__disabled' : 'button--hover'} button button__copy`, disabled: !this.props.data.isMinOneCheckboxChecked },
                react_1.default.createElement("i", { className: "material-icons translate" }, "content_copy"),
                adapter_react_v5_1.I18n.t('copy')),
            newRow.trigger ? (react_1.default.createElement("div", { className: "editor__header_trigger" },
                react_1.default.createElement(select_1.default, { width: "10%", selected: newRow.trigger[0], options: newUnUsedTrigger, id: "trigger", callback: ({ val }) => (0, actionUtils_js_1.updateTrigger)({ trigger: val }, this.props, this.setState.bind(this)), callbackValue: "event.target.value", label: "Trigger", placeholder: "Select a Trigger" }))) : null,
            newRow.parse_mode ? (react_1.default.createElement("div", { className: "editor__header_parseMode" },
                react_1.default.createElement(checkbox_1.default, { id: "parse_mode", index: 0, callback: this.props.callback.updateData, isChecked: (0, Utils_js_1.isChecked)(newRow.parse_mode[0]), obj: true, label: "Parse Mode" }))) : null));
    }
}
exports.default = AppContentTabActionContentRowEditorInputAboveTable;
//# sourceMappingURL=AppContentTabActionContentRowEditorHeader.js.map
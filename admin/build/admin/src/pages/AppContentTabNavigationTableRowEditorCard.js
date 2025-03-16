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
const input_1 = __importDefault(require("@/components/btn-Input/input"));
const btn_circle_add_1 = require("@components/btn-Input/btn-circle-add");
const adapter_react_v5_1 = require("@iobroker/adapter-react-v5");
const checkbox_1 = __importDefault(require("@/components/btn-Input/checkbox"));
const Utils_1 = require("@/lib/Utils");
const AppContentTabNavigationTableRowEditorCardTriggerSelection_1 = __importDefault(require("@/pages/AppContentTabNavigationTableRowEditorCardTriggerSelection"));
class AppContentTabNavigationTableRowEditorCard extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    addSelectedToNewRow = (e) => {
        this.props.callback.onChangeInput({ val: `${this.props.newRow.value} , ${e}`, id: 'value' });
    };
    render() {
        return (react_1.default.createElement("div", { className: "edit__container" }, this.props.entries.map((entry, i) => !(entry.name == 'value') && !(entry.name == 'text') && !entry.checkbox ? (react_1.default.createElement(input_1.default, { key: i, value: this.props.newRow[entry.name], id: entry.name, callback: this.props.callback.onChangeInput, label: adapter_react_v5_1.I18n.t(entry.headline), class: this.props.inUse ? 'inUse' : '' })) : entry.name == 'value' || entry.name == 'text' ? (react_1.default.createElement(input_1.default, { key: i, value: this.props.newRow[entry.name], id: entry.name, callback: this.props.callback.onChangeInput, label: adapter_react_v5_1.I18n.t(entry.headline) },
            react_1.default.createElement(btn_circle_add_1.BtnCircleAdd, { callback: () => this.props.openHelperText(entry.name) }),
            entry.name == 'value' ? (react_1.default.createElement(AppContentTabNavigationTableRowEditorCardTriggerSelection_1.default, { data: this.props.data, callback: this.addSelectedToNewRow })) : null)) : (react_1.default.createElement(checkbox_1.default, { key: i, id: entry.name, index: i, class: "checkbox__line", callback: this.props.callback.onChangeCheckbox, isChecked: (0, Utils_1.isChecked)(this.props.newRow[entry.name]), obj: true, label: "Parse Mode" })))));
    }
}
exports.default = AppContentTabNavigationTableRowEditorCard;
//# sourceMappingURL=AppContentTabNavigationTableRowEditorCard.js.map
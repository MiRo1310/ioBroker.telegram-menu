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
const adapter_react_v5_1 = require("@iobroker/adapter-react-v5");
class Select extends react_1.Component {
    onChangeHandler = (event) => {
        if (!event) {
            return;
        }
        this.props.callback({ id: this.props.id, val: event.target.value });
    };
    render() {
        return (react_1.default.createElement("label", { className: "Select" },
            this.props.label ? react_1.default.createElement("span", { className: "select__label" }, adapter_react_v5_1.I18n.t(this.props.label || '')) : null,
            react_1.default.createElement("select", { name: this.props.name, value: this.props.selected, onChange: this.onChangeHandler },
                react_1.default.createElement("option", { value: "", disabled: true }, adapter_react_v5_1.I18n.t(this.props.placeholder || '')),
                this.props.options.map((option, index) => {
                    return (react_1.default.createElement("option", { key: index, value: option }, option));
                }))));
    }
}
exports.default = Select;
//# sourceMappingURL=select.js.map
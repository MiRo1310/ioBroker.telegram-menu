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
const adapter_react_v5_1 = require("@iobroker/adapter-react-v5");
const react_1 = __importStar(require("react"));
class Checkbox extends react_1.Component {
    onChangeHandler = (event) => {
        this.props.callback({ isChecked: event.target.checked, id: this.props?.id, index: this.props?.index });
    };
    render() {
        return (react_1.default.createElement("label", { className: "checkbox" },
            react_1.default.createElement("input", { type: "checkbox", checked: this.props.isChecked, onChange: this.onChangeHandler, title: this.props.title ? adapter_react_v5_1.I18n.t(this.props.title) : '', className: this.props.class }),
            this.props.label ? react_1.default.createElement("span", null, this.props.label) : null));
    }
}
exports.default = Checkbox;
//# sourceMappingURL=checkbox.js.map
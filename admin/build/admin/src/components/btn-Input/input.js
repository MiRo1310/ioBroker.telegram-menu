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
class Input extends react_1.Component {
    onChangeHandler = (event) => {
        const obj = { val: event?.target.value, index: this.props.index, id: this.props?.id || '' };
        this.props.callback(obj);
    };
    render() {
        return (react_1.default.createElement("label", { className: `input__container ${this.props.class || ''}` },
            react_1.default.createElement("input", { type: this.props.type ? this.props.type : 'text', className: "noneDraggable", placeholder: adapter_react_v5_1.I18n.t(this.props.placeholder || ''), value: this.props.value, disabled: this.props.disabled, onChange: this.onChangeHandler, spellCheck: this.props.spellCheck ? this.props.spellCheck : false, onMouseOver: this.props.onMouseOver ? e => this.props.onMouseOver?.(e, this.props.setState) : undefined, onMouseLeave: this.props.onMouseLeave ? e => this.props?.onMouseLeave?.(e, this.props.setState) : undefined }),
            react_1.default.createElement("span", { className: "input__icon" }, this.props.children),
            this.props.label ? react_1.default.createElement("p", null, this.props.label) : null));
    }
}
exports.default = Input;
//# sourceMappingURL=input.js.map
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
class Textarea extends react_1.Component {
    onChangeHandler = (event) => {
        if (!event) {
            return;
        }
        this.props.callback({ [this.props.id]: event?.target.value });
    };
    render() {
        return (react_1.default.createElement("div", { className: `textarea__container ${this.props.class || ''}` },
            react_1.default.createElement("label", null,
                react_1.default.createElement("textarea", { className: "textarea__content noneDraggable", placeholder: adapter_react_v5_1.I18n.t(this.props.placeholder || ''), value: this.props.value || '', onChange: this.onChangeHandler, spellCheck: this.props.spellCheck ? this.props.spellCheck : false, onMouseOver: this.props.onMouseOver ? e => this.props.onMouseOver?.(e, this.props.setState) : undefined, onMouseLeave: this.props.onMouseLeave ? e => this.props.onMouseLeave?.(e, this.props.setState) : undefined, rows: this.props.rows, cols: this.props.cols }),
                react_1.default.createElement("div", { className: "textarea__children" }, this.props.children),
                react_1.default.createElement("p", null, this.props.label))));
    }
}
exports.default = Textarea;
//# sourceMappingURL=textarea.js.map
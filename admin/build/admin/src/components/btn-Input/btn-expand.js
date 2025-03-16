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
const Button_1 = __importDefault(require("@components/Button"));
class ButtonExpand extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (react_1.default.createElement("span", { className: "button__expand" },
            react_1.default.createElement(Button_1.default, { className: this.props.label
                    ? `button__primary button__flex ${this.props.class}`
                    : `button__icon button__primary ${this.props.class}`, id: "expandTelegramUsers", callback: this.props.callback, disableButtonStyleByComponent: true },
                react_1.default.createElement("i", { className: "material-icons" }, this.props.isOpen ? 'expand_more' : 'chevron_right'),
                react_1.default.createElement("span", { className: "button__label" }, this.props.label))));
    }
}
exports.default = ButtonExpand;
//# sourceMappingURL=btn-expand.js.map
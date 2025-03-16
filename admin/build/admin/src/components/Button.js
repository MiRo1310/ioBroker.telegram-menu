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
class Button extends react_1.Component {
    eventOnclickButton = (event) => {
        this.props.callback({
            innerText: event.target.innerText,
            id: this.props.id,
            value: this.props.callbackValue,
            index: this.props.index,
            event: event,
        });
    };
    render() {
        const buttonStyle = {
            backgroundColor: this.props.b_color || '#ddd',
            color: this.props.color || 'black',
            padding: this.props.small === 'true' ? '2px' : this.props.padding ? this.props.padding : '8px 32px',
            textAlign: 'center',
            textDecoration: 'none',
            display: 'inline-block',
            fontSize: this.props.fontSize ? this.props.fontSize : '12px',
            border: this.props.border ? this.props.border : 'none',
            width: this.props.small === 'true' ? '30px' : this.props.width ? this.props.width : '',
            minWidth: this.props.small === 'true' ? '30px' : '60px',
            height: this.props.small === 'true' ? '30px' : this.props.height ? this.props.height : '50px',
            margin: this.props.margin || '0px 0px 0px 0px',
            borderRadius: this.props.round === 'true' ? '50%' : this.props.round ? this.props.round : '0px',
            maxWidth: this.props.maxWidth || '100%',
            verticalAlign: this.props.verticalAlign || 'middle',
        };
        return (react_1.default.createElement("button", { style: this.props.disableButtonStyleByComponent ? undefined : buttonStyle, onClick: this.eventOnclickButton, title: adapter_react_v5_1.I18n.t(this.props.title || ''), name: this.props.name, disabled: !!this.props.disabled, className: this.props.className },
            react_1.default.createElement("span", { className: "button--children" }, this.props.children)));
    }
}
exports.default = Button;
//# sourceMappingURL=Button.js.map
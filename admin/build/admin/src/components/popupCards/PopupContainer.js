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
const Button_1 = __importDefault(require("../Button"));
const adapter_react_v5_1 = require("@iobroker/adapter-react-v5");
class PopupContainer extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            menuName: this.props.value || '',
            disable: true,
            inUse: false,
        };
    }
    componentDidMount() {
        if (this.props.drag) {
            const element = document.querySelector('.dialog__card_wrapper');
            element.draggable = true;
        }
    }
    render() {
        const DialogContainer = {
            position: 'absolute',
            top: this.props.top ? this.props.top : '50%',
            left: this.props.left ? this.props.left : '50%',
            right: this.props.right ? this.props.right : '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#fff',
            width: this.props.width || '400px',
            height: this.props.height || '200px',
            zIndex: '100',
            borderRadius: '4px',
            border: '2px solid #ccc',
        };
        return (react_1.default.createElement("div", { className: `dialog__card_wrapper ${this.props.class || ''}`, ref: this.props.reference ? this.props.reference : null, onDragStart: this.props.onDragStart ? event => this.props.onDragStart(event, this.props.setState) : undefined, onDragEnd: this.props.onDragEnd ? event => this.props.onDragEnd(event, this.props.setState) : undefined, onDragOver: this.props.onDragOver ? event => this.props.onDragOver(event, this.props.setState) : undefined, onDrop: this.props.onDrop ? event => this.props.onDrop(event, this.props.setState) : undefined, onDrag: this.props.onDrag ? event => this.props.onDrag(event, this.props.setState) : undefined, onMouseEnter: this.props.onMouseEnter ? event => this.props.onMouseEnter(event, this.props.setState) : undefined, onMouseLeave: this.props.onMouseLeave ? event => this.props.onMouseLeave(event, this.props.setState) : undefined },
            react_1.default.createElement("div", { className: "dialog__card", style: DialogContainer },
                react_1.default.createElement("div", { className: "dialog__card_header" }, this.props.title),
                react_1.default.createElement("div", { className: "dialog__card_content" },
                    this.state.inUse ? react_1.default.createElement("p", { className: "inUse" }, adapter_react_v5_1.I18n.t('Call is already in use!')) : null,
                    this.props.children),
                react_1.default.createElement("div", { className: "dialog__card_footer" },
                    !this.props.onlyCloseBtn ? (react_1.default.createElement(Button_1.default, { className: `button button__ok ${this.props.isOK ? 'button--hover' : 'button__disabled'}`, callbackValue: true, callback: this.props.callback, name: this.props.labelBtnOK ? this.props.labelBtnOK : 'ok', disabled: this.state.disable && !this.props.isOK }, adapter_react_v5_1.I18n.t(this.props.labelBtnOK ? this.props.labelBtnOK : 'ok'))) : null,
                    react_1.default.createElement(Button_1.default, { className: "button button__close", callbackValue: false, callback: this.props.callback, maxWidth: "200px", name: "cancel" }, !this.props.onlyCloseBtn ? adapter_react_v5_1.I18n.t('abort') : adapter_react_v5_1.I18n.t('close'))))));
    }
}
exports.default = PopupContainer;
//# sourceMappingURL=PopupContainer.js.map
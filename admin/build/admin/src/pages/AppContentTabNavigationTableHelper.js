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
const HelperCard_1 = __importDefault(require("@/components/popupCards/HelperCard"));
const PopupContainer_1 = __importDefault(require("@/components/popupCards/PopupContainer"));
const react_1 = __importStar(require("react"));
const helper_js_1 = __importDefault(require("@/config/helper.js"));
class TableNavHelper extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    onchangeValueFromHelper = ({ value }) => {
        if (this.props.state.editedValueFromHelperText === null) {
            this.props.setState({ editedValueFromHelperText: value });
        }
        this.props.setState({ editedValueFromHelperText: `${this.props.state.editedValueFromHelperText} ${value}` });
    };
    render() {
        return (react_1.default.createElement(PopupContainer_1.default, { callback: this.props.popupHelperCard, width: "90%", height: "80%", title: "Helper Texte", setState: this.setState.bind(this), isOK: this.props.state.isOK, class: "HelperText" },
            react_1.default.createElement(HelperCard_1.default, { data: {
                    adapterName: this.props.data.adapterName,
                    socket: this.props.data.socket,
                    themeType: this.props.data.themeType,
                }, helper: helper_js_1.default, name: "nav", val: "nav", helperTextForInput: this.props.state.helperTextFor, text: this.props.state.newRow.text, callback: this.onchangeValueFromHelper, editedValueFromHelperText: this.props.state.editedValueFromHelperText || '', setState: this.props.setState.bind(this) })));
    }
}
exports.default = TableNavHelper;
//# sourceMappingURL=AppContentTabNavigationTableHelper.js.map
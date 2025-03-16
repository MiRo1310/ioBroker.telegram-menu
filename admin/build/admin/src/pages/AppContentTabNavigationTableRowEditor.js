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
const PopupContainer_1 = __importDefault(require("@/components/popupCards/PopupContainer"));
const AppContentTabNavigationTableRowEditorCard_1 = __importDefault(require("@/pages/AppContentTabNavigationTableRowEditorCard"));
const react_1 = __importStar(require("react"));
const Utils_js_1 = require("@/lib/Utils.js");
class TableNavEditRow extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    changeInput = ({ val, id }) => {
        const copyNewRow = (0, Utils_js_1.deepCopy)(this.props.state.newRow);
        if (!copyNewRow) {
            return;
        }
        if (id) {
            copyNewRow[id] = val.toString();
        }
        this.props.setState({ newRow: copyNewRow });
    };
    changeCheckbox = ({ isChecked, id }) => {
        const copyNewRow = (0, Utils_js_1.deepCopy)(this.props.state.newRow);
        if (!copyNewRow) {
            return;
        }
        if (id) {
            copyNewRow[id] = isChecked.toString();
        }
        this.props.setState({ newRow: copyNewRow });
    };
    openHelperText = (value) => {
        if (value) {
            this.props.setState({ editedValueFromHelperText: this.props.state.newRow[value] });
            this.props.setState({ helperTextFor: value });
        }
        this.props.setState({ helperText: true });
    };
    render() {
        return (react_1.default.createElement(PopupContainer_1.default, { callback: this.props.popupRowCard, call: this.props.state.call, nav: this.props.state.nav, text: this.props.state.text, usedTrigger: this.props.data.state.usedTrigger, width: "99%", height: "450px", title: "Navigation", setState: this.props.setState.bind(this), isOK: this.props.state.valuesAreOk },
            react_1.default.createElement(AppContentTabNavigationTableRowEditorCard_1.default, { callback: { onChangeInput: this.changeInput, onChangeCheckbox: this.changeCheckbox }, inUse: this.props.state.callInUse, openHelperText: this.openHelperText, entries: this.props.data.entries, newRow: this.props.state.newRow, data: this.props.data })));
    }
}
exports.default = TableNavEditRow;
//# sourceMappingURL=AppContentTabNavigationTableRowEditor.js.map
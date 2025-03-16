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
const adapter_react_v5_1 = require("@iobroker/adapter-react-v5");
const material_1 = require("@mui/material");
const react_1 = __importStar(require("react"));
const checkbox_1 = __importDefault(require("@/components/btn-Input/checkbox"));
class AppContentTabActionContentRowEditorTableHead extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            checkAll: false,
            isChecked: false,
        };
    }
    clickCheckBox = ({ isChecked }) => {
        this.setState({ isChecked });
        this.props.callback.checkAll(isChecked);
    };
    static shouldShowInHeader(entry) {
        return entry.name != 'trigger' && entry.name != 'parse_mode';
    }
    static isHeaderForDataCheckbox(name) {
        return ['Con', 'Swi', 'Ack'].includes(name) ? 'table__head_checkbox' : '';
    }
    render() {
        return (react_1.default.createElement(material_1.TableHead, null,
            react_1.default.createElement(material_1.TableRow, null,
                react_1.default.createElement(material_1.TableCell, { align: "left", className: "table__head_checkbox" },
                    react_1.default.createElement(checkbox_1.default, { id: "checkbox", index: 1, callback: this.clickCheckBox, isChecked: this.state.isChecked, obj: true })),
                this.props.tab.entries.map((entry, index) => AppContentTabActionContentRowEditorTableHead.shouldShowInHeader(entry) ? (react_1.default.createElement(material_1.TableCell, { key: index, align: "left", className: AppContentTabActionContentRowEditorTableHead.isHeaderForDataCheckbox(entry.headline) },
                    react_1.default.createElement("span", { title: entry.title ? adapter_react_v5_1.I18n.t(entry.title) : undefined }, adapter_react_v5_1.I18n.t(entry.headline)))) : null),
                this.props.tab.popupCard.buttons.add ? (react_1.default.createElement(material_1.TableCell, { align: "left", className: "table__head_button" })) : null,
                this.props.tab.popupCard.buttons.remove ? (react_1.default.createElement(material_1.TableCell, { align: "left", className: "table__head_button" })) : null)));
    }
}
exports.default = AppContentTabActionContentRowEditorTableHead;
//# sourceMappingURL=AppContentTabActionContentRowEditorTableHead.js.map
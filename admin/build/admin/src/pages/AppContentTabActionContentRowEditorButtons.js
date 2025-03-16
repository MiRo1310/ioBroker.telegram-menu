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
const actionUtils_1 = require("@/lib/actionUtils");
const btn_small_add_1 = __importDefault(require("@components/btn-Input/btn-small-add"));
const btn_small_remove_1 = __importDefault(require("@components/btn-Input/btn-small-remove"));
const material_1 = require("@mui/material");
const react_1 = __importStar(require("react"));
class AppContentTabActionContentRowEditorButtons extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            openCopyPopup: false,
            indexOfRowToCopyForModal: 0,
        };
    }
    render() {
        const { buttons } = this.props.data.tab.popupCard;
        const { indexRow, rows } = this.props.data;
        const { setStateEditor } = this.props.callback;
        return (react_1.default.createElement(react_1.default.Fragment, null,
            buttons.add ? (react_1.default.createElement(material_1.TableCell, { align: "center", className: "table__cell_icon" },
                react_1.default.createElement(btn_small_add_1.default, { callback: () => (0, actionUtils_1.addNewRow)(indexRow, this.props, setStateEditor, this.props.callback.setStateTabActionContent), index: indexRow }))) : null,
            buttons.remove ? (react_1.default.createElement(material_1.TableCell, { align: "center", className: "table__cell_icon" },
                react_1.default.createElement(btn_small_remove_1.default, { callback: ({ index }) => (0, actionUtils_1.deleteRow)(index, this.props, setStateEditor), index: indexRow, disabled: rows.length == 1 ? 'disabled' : '' }))) : null));
    }
}
exports.default = AppContentTabActionContentRowEditorButtons;
//# sourceMappingURL=AppContentTabActionContentRowEditorButtons.js.map
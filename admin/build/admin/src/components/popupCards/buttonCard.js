"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ButtonCard = void 0;
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const btn_small_add_1 = __importDefault(require("../btn-Input/btn-small-add"));
const btn_small_edit_1 = __importDefault(require("../btn-Input/btn-small-edit"));
const btn_small_up_1 = __importDefault(require("../btn-Input/btn-small-up"));
const btn_small_down_1 = __importDefault(require("../btn-Input/btn-small-down"));
const btn_small_remove_1 = __importDefault(require("../btn-Input/btn-small-remove"));
const ButtonCard = (props) => {
    return (react_1.default.createElement(react_1.default.Fragment, null,
        props.showButtons.add ? (react_1.default.createElement(material_1.TableCell, { align: "center", className: "table__cell_icon" },
            react_1.default.createElement(btn_small_add_1.default, { callback: props.openAddRowCard, index: props.index }))) : null,
        props.showButtons.edit ? (react_1.default.createElement(material_1.TableCell, { align: "center", className: "table__cell_icon" },
            react_1.default.createElement(btn_small_edit_1.default, { callback: props.editRow, index: props.index }))) : null,
        props.showButtons.moveUp ? (react_1.default.createElement(material_1.TableCell, { align: "center", className: "table__cell_icon" },
            react_1.default.createElement(btn_small_up_1.default, { callback: props.moveUp, index: props.index, disabled: props.index === 0 ? 'disabled' : undefined }))) : null,
        props.showButtons.moveDown ? (react_1.default.createElement(material_1.TableCell, { align: "center", className: "table__cell_icon" },
            react_1.default.createElement(btn_small_down_1.default, { callback: props.moveDown, index: props.index, disabled: props.index === props.rows.length - 1 ? 'disabled' : '' }))) : null,
        props.showButtons.remove ? (react_1.default.createElement(material_1.TableCell, { align: "center", className: "table__cell_icon" }, !props.notShowDelete ? (react_1.default.createElement(btn_small_remove_1.default, { callback: props.deleteRow, index: props.index })) : null)) : null));
};
exports.ButtonCard = ButtonCard;
//# sourceMappingURL=buttonCard.js.map
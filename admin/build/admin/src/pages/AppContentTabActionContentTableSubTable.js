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
const material_1 = require("@mui/material");
const dragNDrop_1 = require("@/lib/dragNDrop");
const actionUtils_1 = require("@/lib/actionUtils");
class SubTable extends react_1.Component {
    render() {
        return (react_1.default.createElement(material_1.Table, null,
            react_1.default.createElement(material_1.TableBody, { className: "dynamicHeight" }, this.props.data
                ? this.props.data.map((element, index) => (react_1.default.createElement(material_1.TableRow, { key: index, className: "SubTable" },
                    react_1.default.createElement(material_1.TableCell, { style: { padding: '0', border: 'none' } },
                        react_1.default.createElement("span", { draggable: false, className: "noneDraggable", onMouseOver: e => (0, dragNDrop_1.handleMouseOver)(e), onMouseLeave: e => (0, dragNDrop_1.handleMouseOut)(e) }, this.props.name != 'values'
                            ? (0, actionUtils_1.getElementIcon)(element, this.props.entry)
                            : element)))))
                : null)));
    }
}
exports.default = SubTable;
//# sourceMappingURL=AppContentTabActionContentTableSubTable.js.map
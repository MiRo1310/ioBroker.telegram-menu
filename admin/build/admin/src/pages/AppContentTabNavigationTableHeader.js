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
const adapter_react_v5_1 = require("@iobroker/adapter-react-v5");
class TabNavHeader extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (react_1.default.createElement(material_1.TableHead, null,
            react_1.default.createElement(material_1.TableRow, null,
                this.props.entries.map((entry, index) => (react_1.default.createElement(material_1.TableCell, { key: index, align: "left" },
                    react_1.default.createElement("span", { title: entry.title ? adapter_react_v5_1.I18n.t(entry.title) : undefined }, adapter_react_v5_1.I18n.t(entry.headline))))),
                react_1.default.createElement(material_1.TableCell, { align: "center", className: "table__cell_icon" }),
                react_1.default.createElement(material_1.TableCell, { align: "center", className: "table__cell_icon" }),
                react_1.default.createElement(material_1.TableCell, { align: "center", className: "table__cell_icon" }))));
    }
}
exports.default = TabNavHeader;
//# sourceMappingURL=AppContentTabNavigationTableHeader.js.map
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
const material_1 = require("@mui/material");
const Utils_js_1 = require("@/lib/Utils.js");
const adapter_react_v5_1 = require("@iobroker/adapter-react-v5");
const buttonCard_1 = require("@components/popupCards/buttonCard");
const button_1 = require("@/lib/button");
const input_1 = __importDefault(require("@/components/btn-Input/input"));
const inputWithOptions_1 = __importDefault(require("@components/btn-Input/inputWithOptions"));
class TabNavigation extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            rows: [{ description: '', call: '' }],
        };
    }
    componentDidMount() {
        if (this.props.data.state.native.description) {
            this.setState({ rows: this.props.data.state.native.description });
        }
    }
    handleUpdateInput = (event) => {
        const rows = (0, Utils_js_1.deepCopy)(this.state.rows);
        if (rows && typeof event?.index === 'number') {
            rows[event.index][event.id] = event.val;
            this.updateRows(rows);
        }
    };
    updateRows = (rows) => {
        this.setState({ rows: rows });
        this.props.callback.updateNative('description', rows);
    };
    addRow = ({ index }) => {
        const row = { description: '', call: '' };
        const rowsCopy = (0, Utils_js_1.deepCopy)(this.state.rows);
        if (!rowsCopy) {
            return;
        }
        rowsCopy.splice(index + 1, 0, row);
        this.updateRows(rowsCopy);
    };
    modifyRows = (direction, index) => {
        const rows = (0, button_1.moveRows)(direction, index, this.state.rows);
        if (!rows) {
            return;
        }
        this.setState({ rows: rows });
        this.props.callback.updateNative('description', rows);
    };
    getOptions = () => {
        return this.props.data.state.unUsedTrigger.sort();
    };
    render() {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("p", { className: 'tab__description_text' }, adapter_react_v5_1.I18n.t('descriptionInfo')),
            react_1.default.createElement(material_1.TableContainer, { component: material_1.Paper, className: "table__container_description" },
                react_1.default.createElement(material_1.Table, { stickyHeader: true, "aria-label": "sticky table" },
                    react_1.default.createElement(material_1.TableHead, null,
                        react_1.default.createElement(material_1.TableRow, null,
                            react_1.default.createElement(material_1.TableCell, null, adapter_react_v5_1.I18n.t('call')),
                            react_1.default.createElement(material_1.TableCell, null, adapter_react_v5_1.I18n.t('description')),
                            react_1.default.createElement(material_1.TableCell, { align: "center", className: "table__cell_icon" }),
                            react_1.default.createElement(material_1.TableCell, { align: "center", className: "table__cell_icon" }),
                            react_1.default.createElement(material_1.TableCell, { align: "center", className: "table__cell_icon" }),
                            react_1.default.createElement(material_1.TableCell, { align: "center", className: "table__cell_icon" }))),
                    react_1.default.createElement(material_1.TableBody, null, this.state.rows.map((row, indexRow) => (react_1.default.createElement(material_1.TableRow, { key: indexRow, sx: { '&:last-child td, &:last-child th': { border: 0 } }, className: `no-select` },
                        react_1.default.createElement(material_1.TableCell, { component: "td", width: '30%' },
                            react_1.default.createElement(inputWithOptions_1.default, { value: row.call, callback: this.handleUpdateInput, index: indexRow, id: 'call', options: this.getOptions() })),
                        react_1.default.createElement(material_1.TableCell, { component: "td" },
                            react_1.default.createElement(input_1.default, { value: row.description, callback: this.handleUpdateInput, index: indexRow, id: 'description' })),
                        react_1.default.createElement(buttonCard_1.ButtonCard, { openAddRowCard: this.addRow, editRow: () => { }, moveDown: () => this.modifyRows('down', indexRow), moveUp: () => this.modifyRows('up', indexRow), deleteRow: () => this.modifyRows('delete', indexRow), rows: this.state.rows, index: indexRow, showButtons: {
                                edit: false,
                                add: true,
                                remove: true,
                                moveUp: true,
                                moveDown: true,
                            }, notShowDelete: this.state.rows.length === 1 })))))))));
    }
}
exports.default = TabNavigation;
//# sourceMappingURL=AppContentTabDescripton.js.map
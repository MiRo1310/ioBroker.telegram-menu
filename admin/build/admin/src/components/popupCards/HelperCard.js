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
const Table_1 = __importDefault(require("@mui/material/Table"));
const TableBody_1 = __importDefault(require("@mui/material/TableBody"));
const TableCell_1 = __importDefault(require("@mui/material/TableCell"));
const TableContainer_1 = __importDefault(require("@mui/material/TableContainer"));
const TableHead_1 = __importDefault(require("@mui/material/TableHead"));
const TableRow_1 = __importDefault(require("@mui/material/TableRow"));
const Paper_1 = __importDefault(require("@mui/material/Paper"));
const adapter_react_v5_1 = require("@iobroker/adapter-react-v5");
const btn_small_add_1 = __importDefault(require("../btn-Input/btn-small-add"));
const btn_small_search_1 = __importDefault(require("../btn-Input/btn-small-search"));
const textarea_1 = __importDefault(require("../btn-Input/textarea"));
const theme = (0, adapter_react_v5_1.Theme)('light');
class HelperCard extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            rows: this.props.helper[this.props.val],
            showSelectId: false,
            selectedId: '',
        };
    }
    updateId = (selected) => {
        const value = this.props.editedValueFromHelperText;
        if (value.includes('ID')) {
            this.props.setState({ editedValueFromHelperText: value.replace('ID', selected) });
            return;
        }
        else if (value.includes("'id':'")) {
            const oldId = value.split("'id':'")[1].split("'}")[0];
            this.props.setState({ editedValueFromHelperText: value.replace(oldId, selected) });
            return;
        }
        this.props.setState({ editedValueFromHelperText: `${value} ${selected}` });
    };
    openSelectId = () => {
        if (this.props.editedValueFromHelperText) {
            if (this.props.editedValueFromHelperText.includes("'id':'") &&
                !this.props.editedValueFromHelperText.includes('ID')) {
                const id = this.props.editedValueFromHelperText.split("'id':'")[1].split("'}")[0];
                this.setState({ selectedId: id });
            }
            this.setState({ showSelectId: true });
        }
    };
    render() {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(TableContainer_1.default, { component: Paper_1.default, className: "HelperCard" },
                react_1.default.createElement(Table_1.default, { stickyHeader: true, "aria-label": "sticky table", className: "HelperCard-Table" },
                    react_1.default.createElement(TableHead_1.default, null,
                        react_1.default.createElement(TableRow_1.default, null,
                            react_1.default.createElement(TableCell_1.default, null, "Text"),
                            react_1.default.createElement(TableCell_1.default, { align: "left" }, "Info"),
                            react_1.default.createElement(TableCell_1.default, { align: "left" }))),
                    react_1.default.createElement(TableBody_1.default, null, this.state.rows[this.props.helperTextForInput].map((row, index) => (react_1.default.createElement(TableRow_1.default, { key: index, sx: { '&:last-child td, &:last-child th': { border: 0 } } },
                        react_1.default.createElement(TableCell_1.default, { component: "td", scope: "row" }, row.text),
                        react_1.default.createElement(TableCell_1.default, null,
                            row.head ? react_1.default.createElement("div", { dangerouslySetInnerHTML: { __html: row.head } }) : null,
                            react_1.default.createElement("div", { dangerouslySetInnerHTML: { __html: adapter_react_v5_1.I18n.t(row.info) } })),
                        row.text ? (react_1.default.createElement(TableCell_1.default, { align: "center" },
                            react_1.default.createElement(btn_small_add_1.default, { index: index, callback: this.props.callback, callbackValue: row.text }))) : null)))))),
            ['nav', 'text', 'set', 'get', 'value'].includes(this.props.val) ? (react_1.default.createElement(btn_small_search_1.default, { class: "helper__btn_search", index: 0, callback: this.openSelectId })) : null,
            react_1.default.createElement(textarea_1.default, { value: this.props.editedValueFromHelperText.replace(/&amp;/g, '&'), id: "editedValueFromHelperText", callback: this.props.setState, callbackValue: "event.target.value", label: "", rows: 4 }),
            this.state.showSelectId ? (react_1.default.createElement(adapter_react_v5_1.SelectID, { key: "tableSelect", imagePrefix: "../..", dialogName: this.props.data.adapterName, themeType: this.props.data.themeType, theme: theme, socket: this.props.data.socket, filters: {}, selected: '', onClose: () => this.setState({ showSelectId: false }), onOk: selected => {
                    this.setState({ showSelectId: false });
                    this.updateId(selected);
                } })) : null));
    }
}
exports.default = HelperCard;
//# sourceMappingURL=HelperCard.js.map
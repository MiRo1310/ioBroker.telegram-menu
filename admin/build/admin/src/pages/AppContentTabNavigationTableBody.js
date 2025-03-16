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
const material_1 = require("@mui/material");
const react_1 = __importStar(require("react"));
const buttonCard_js_1 = require("@/components/popupCards/buttonCard.js");
const button_js_1 = require("@/lib/button.js");
const dragNDrop_js_1 = require("@/lib/dragNDrop.js");
const adapter_react_v5_1 = require("@iobroker/adapter-react-v5");
const AppContentTabNavigationTableBodyValueModifier_1 = __importDefault(require("@/pages/AppContentTabNavigationTableBodyValueModifier"));
const Utils_1 = require("@/lib/Utils");
function createData(entriesOfParentComponent, element) {
    const obj = {};
    entriesOfParentComponent.forEach(entry => {
        obj[entry.name] = element[entry.name];
    });
    return obj;
}
class TableDndNav extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            dropStart: 0,
            dropEnd: 0,
            dropOver: 0,
            mouseOverNoneDraggable: false,
            rows: [],
        };
    }
    getRows(nav, activeMenu) {
        if (!nav || !activeMenu) {
            return;
        }
        const elements = nav[activeMenu];
        const rows = [];
        if (!elements) {
            return;
        }
        for (const entry of elements) {
            rows.push(createData(this.props.data.entries, entry));
        }
        this.setState({ rows: rows });
    }
    componentDidMount() {
        const { native, activeMenu } = this.props.data.state;
        if (native.data.nav) {
            this.getRows(native.data.nav, activeMenu);
        }
    }
    componentDidUpdate(prevProps) {
        const { native, activeMenu } = this.props.data.state;
        const { nav } = native.data;
        if (prevProps.data.state.activeMenu !== activeMenu || prevProps.data.state.native.data.nav !== nav) {
            this.getRows(native.data.nav, activeMenu);
        }
        if (this.props.data.state.clickedTriggerInNav) {
            (0, Utils_1.scrollToId)(this.props.data.state.clickedTriggerInNav);
        }
    }
    handleDrop = (event, index) => {
        let currentElement = event.target;
        while (currentElement) {
            if (currentElement.tagName === 'TR') {
                if (currentElement.classList.contains('draggingDropBox')) {
                    return;
                }
            }
            currentElement = currentElement.parentElement;
        }
        if (index !== this.state.dropStart && index != 0) {
            (0, button_js_1.moveItem)({
                index: this.state.dropStart,
                card: this.props.card,
                upDown: index - this.state.dropStart,
                data: this.props.data.state.native.data,
                activeMenu: this.props.data.state.activeMenu,
                updateNative: this.props.callback.updateNative,
            });
        }
    };
    editRow = ({ index }) => {
        const { native, activeMenu } = this.props.data.state;
        if (native.data.nav && activeMenu) {
            const rowToEdit = native.data.nav[activeMenu][index];
            this.props.setState({ newRow: rowToEdit });
        }
        this.props.setState({ rowPopup: true });
        this.props.setState({ rowIndex: index });
        this.props.setState({ editRow: true });
    };
    jumpedToTrigger = (call) => {
        if (this.props.data.state.clickedTriggerInNav === call) {
            return 'row__navigate_to-active';
        }
        return '';
    };
    render() {
        return (react_1.default.createElement(material_1.TableBody, null, this.state.rows.map((row, indexRow) => (react_1.default.createElement(material_1.TableRow, { key: indexRow, sx: { '&:last-child td, &:last-child th': { border: 0 } }, className: `no-select` +
                ` ${this.jumpedToTrigger(row.call)}` +
                ` ${indexRow === 0
                    ? row.call != '' && row.call != '-'
                        ? 'startside__active'
                        : 'startside__inactive'
                    : ''}`, draggable: (0, dragNDrop_js_1.handleDraggable)(indexRow), onDrop: event => this.handleDrop(event, indexRow), onDragStart: event => (0, dragNDrop_js_1.handleDragStart)(indexRow, event, this.state.mouseOverNoneDraggable, this.setState.bind(this), { draggingRowIndex: indexRow }, this.props.callback.setStateApp), onDragEnd: () => (0, dragNDrop_js_1.handleDragEnd)(this.setState.bind(this), this.props.callback.setStateApp), onDragOver: event => (0, dragNDrop_js_1.handleDragOver)(indexRow, event), onDragEnter: () => (0, dragNDrop_js_1.handleDragEnter)(indexRow, this.setState.bind(this)), style: (0, dragNDrop_js_1.handleStyleDragOver)(indexRow, this.state.dropOver, this.state.dropStart) },
            this.props.data.entries.map((entry, indexCell) => (react_1.default.createElement(material_1.TableCell, { key: indexCell, component: "td", style: { width: entry.width ? entry.width : undefined } },
                react_1.default.createElement("span", { className: "table__ghost_id", id: row.call }),
                react_1.default.createElement("span", { className: "noneDraggable", onMouseOver: e => (0, dragNDrop_js_1.handleMouseOver)(e), onMouseLeave: indexRow == 0 ? undefined : e => (0, dragNDrop_js_1.handleMouseOut)(e) },
                    react_1.default.createElement(AppContentTabNavigationTableBodyValueModifier_1.default, { row: row, entry: entry, data: this.props.data, callback: this.props.callback }),
                    react_1.default.createElement("span", { draggable: false, className: `textSubmenuInfo noneDraggable` }, indexRow === 0 &&
                        (row.call === '' || row.call === '-') &&
                        entry.name === 'call' ? (react_1.default.createElement("span", null, adapter_react_v5_1.I18n.t('isSubmenu'))) : null))))),
            react_1.default.createElement(buttonCard_js_1.ButtonCard, { openAddRowCard: this.props.openAddRowCard, editRow: this.editRow, moveDown: () => { }, moveUp: () => { }, deleteRow: () => (0, button_js_1.deleteRow)({
                    index: indexRow,
                    card: this.props.card,
                    activeMenu: this.props.data.state.activeMenu,
                    data: this.props.data.state.native.data,
                    updateNative: this.props.callback.updateNative,
                }), rows: this.state.rows, index: indexRow, showButtons: this.props.showButtons, notShowDelete: indexRow == 0 }))))));
    }
}
exports.default = TableDndNav;
//# sourceMappingURL=AppContentTabNavigationTableBody.js.map
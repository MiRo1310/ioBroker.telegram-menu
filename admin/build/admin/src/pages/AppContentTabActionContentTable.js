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
const buttonCard_1 = require("@components/popupCards/buttonCard");
const Utils_1 = require("@/lib/Utils");
const actionUtils_1 = require("@/lib/actionUtils");
const button_1 = require("@/lib/button");
const dragNDrop_1 = require("@/lib/dragNDrop");
const AppContentTabActionContentTableSubTable_js_1 = __importDefault(require("./AppContentTabActionContentTableSubTable.js"));
class AppContentTabActionContentTable extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            dropStart: 0,
            dropEnd: 0,
            dropOver: 0,
            rows: [],
            mouseOverNoneDraggable: false,
        };
    }
    static createData(entriesOfParentComponent, element) {
        const obj = {};
        entriesOfParentComponent.forEach(entry => {
            obj[entry.name] = element[entry.name];
        });
        return obj;
    }
    getRows = () => {
        const { activeMenu, native } = this.props.data.state;
        const action = native.data.action;
        if (!action) {
            return;
        }
        const elements = action[activeMenu][this.props.data.tab.value];
        const rows = [];
        if (elements === undefined) {
            return;
        }
        for (const entry of elements) {
            rows.push(AppContentTabActionContentTable.createData(this.props.data.tab.entries, entry));
        }
        this.setState({ rows: rows });
    };
    componentDidUpdate(prevProps) {
        if (prevProps.data.state.activeMenu !== this.props.data.state.activeMenu) {
            this.getRows();
            AppContentTabActionContentTable.updateHeight();
        }
        if (prevProps.data.state.native.data.action !== this.props.data.state.native.data.action) {
            this.getRows();
        }
    }
    static updateHeight = () => {
        const tBodies = Array.from(document.getElementsByClassName('dynamicHeight'));
        const tds = Array.from(document.getElementsByClassName('tdWithHeightForSubTable'));
        tBodies.forEach((tbody) => {
            tbody.style.height = 'auto';
        });
        const offset = 0;
        if (tds.length > 0) {
            tds.forEach((td, index) => {
                if (td && tBodies[index]) {
                    if (tBodies[index].offsetHeight < td.offsetHeight) {
                        tBodies[index].style.height = `${td.offsetHeight + offset}px`;
                    }
                }
            });
        }
    };
    componentDidMount() {
        this.getRows();
        window.addEventListener('resize', AppContentTabActionContentTable.updateHeight);
        setTimeout(() => {
            AppContentTabActionContentTable.updateHeight();
        }, 100);
        setTimeout(() => {
            if (this.props.data.state.clickedTriggerInNav) {
                (0, Utils_1.scrollToId)(this.props.data.state.clickedTriggerInNav);
            }
        }, 500);
    }
    static componentWillUnmount() {
        window.removeEventListener('resize', AppContentTabActionContentTable.updateHeight);
    }
    handleDrop = (index, event) => {
        let currentElement = event?.target;
        while (currentElement) {
            if (currentElement.tagName === 'TR' && !currentElement.classList.contains('SubTable')) {
                if (currentElement.classList.contains('draggingDropBox')) {
                    return;
                }
            }
            currentElement = currentElement.parentElement;
        }
        if (index !== this.state.dropStart) {
            (0, button_1.moveItem)({
                index: this.state.dropStart,
                card: this.props.data.card,
                subCard: this.props.data.tab.value,
                upDown: index - this.state.dropStart,
                activeMenu: this.props.data.state.activeMenu,
                data: this.props.data.state.native.data,
                updateNative: this.props.callback.updateNative,
            });
        }
    };
    editRow = ({ index }) => {
        const { activeMenu } = this.props.data.state;
        const { data } = this.props.data.state.native;
        const { setStateTabActionContent } = this.props.callback;
        const dataCopy = (0, Utils_1.deepCopy)(data);
        if (!dataCopy) {
            return;
        }
        const newRow = dataCopy[this.props.data.card][activeMenu][this.props.data.tab.value][index];
        if (newRow.trigger) {
            this.props.callback.addEditedTrigger(newRow.trigger[0]);
        }
        setStateTabActionContent({ newRow: newRow, editRow: true, rowPopup: true, rowIndexToEdit: index });
    };
    jumpedToTrigger = (call) => !call || this.props.data.state.clickedTriggerInNav !== call ? '' : 'row__navigate_to-active';
    render() {
        return (react_1.default.createElement(material_1.TableBody, { className: "TableDndAction-Body" }, this.state.rows.map((row, index) => (react_1.default.createElement(material_1.TableRow, { key: index, sx: { '&:last-child td, &:last-child th': { border: 0 } }, className: `no-select ${this.jumpedToTrigger(row?.trigger?.[0])}`, draggable: true, onDrop: event => this.handleDrop(index, event), onDragStart: event => {
                (0, dragNDrop_1.handleDragStart)(index, event, this.state.mouseOverNoneDraggable, this.setState.bind(this), { draggingRowIndex: index }, this.props.callback.setStateApp);
            }, onDragEnd: () => (0, dragNDrop_1.handleDragEnd)(this.setState.bind(this), this.props.callback.setStateApp), onDragOver: event => (0, dragNDrop_1.handleDragOver)(index, event), onDragEnter: () => (0, dragNDrop_1.handleDragEnter)(index, this.setState.bind(this)), style: (0, dragNDrop_1.handleStyleDragOver)(index, this.state.dropOver, this.state.dropStart) },
            row?.trigger?.[0] ? (react_1.default.createElement(material_1.TableCell, { align: "left", component: "td", scope: "row" },
                react_1.default.createElement("span", { className: "table__ghost_id", id: row?.trigger?.[0] }),
                react_1.default.createElement("span", { className: "noneDraggable", onMouseOver: e => (0, dragNDrop_1.handleMouseOver)(e), onMouseLeave: e => (0, dragNDrop_1.handleMouseOut)(e) }, row?.trigger?.[0]))) : null,
            this.props.data.tab.entries.map((entry, indexEntry) => entry.name != 'trigger' && entry.name != 'parse_mode' ? (react_1.default.createElement(material_1.TableCell, { className: "tdWithHeightForSubTable", align: "left", component: "td", scope: "row", key: indexEntry, style: entry.width ? { width: entry.width } : undefined },
                react_1.default.createElement(AppContentTabActionContentTableSubTable_js_1.default, { data: row[entry.name], setState: this.setState.bind(this), name: entry.name, entry: entry }))) : null),
            row.parse_mode ? (react_1.default.createElement(material_1.TableCell, { align: "left", component: "td", scope: "row" },
                react_1.default.createElement("span", { className: "noneDraggable", onMouseOver: e => (0, dragNDrop_1.handleMouseOver)(e), onMouseLeave: e => (0, dragNDrop_1.handleMouseOut)(e) }, (0, actionUtils_1.getElementIcon)(row.parse_mode[0])))) : null,
            react_1.default.createElement(buttonCard_1.ButtonCard, { openAddRowCard: this.props.callback.openAddRowCard, editRow: this.editRow, moveDown: () => { }, moveUp: () => { }, deleteRow: ({ index }) => (0, button_1.deleteRow)({
                    index,
                    activeMenu: this.props.data.state.activeMenu,
                    card: this.props.data.card,
                    subCard: this.props.data.tab.value,
                    updateNative: this.props.callback.updateNative,
                    data: this.props.data.state.native.data,
                }), rows: this.state.rows, index: index, showButtons: this.props.data.showButtons }))))));
    }
}
exports.default = AppContentTabActionContentTable;
//# sourceMappingURL=AppContentTabActionContentTable.js.map
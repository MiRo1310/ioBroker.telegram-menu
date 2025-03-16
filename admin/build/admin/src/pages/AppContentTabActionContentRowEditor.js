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
const btn_circle_add_1 = require("@/components/btn-Input/btn-circle-add");
const btn_small_search_1 = __importDefault(require("@/components/btn-Input/btn-small-search"));
const input_1 = __importDefault(require("@/components/btn-Input/input"));
const Utils_js_1 = require("@/lib/Utils.js");
const actionUtils_js_1 = require("@/lib/actionUtils.js");
const dragNDrop_js_1 = require("@/lib/dragNDrop.js");
const string_1 = require("@/lib/string");
const AppContentTabActionContentRowEditorTableHead_1 = __importDefault(require("@/pages/AppContentTabActionContentRowEditorTableHead"));
const RenameModal_1 = __importDefault(require("@components/RenameModal"));
const checkbox_1 = __importDefault(require("@components/btn-Input/checkbox"));
const PopupContainer_1 = __importDefault(require("@components/popupCards/PopupContainer"));
const adapter_react_v5_1 = require("@iobroker/adapter-react-v5");
const material_1 = require("@mui/material");
const react_1 = __importStar(require("react"));
const AppContentTabActionContentRowEditorButtons_1 = __importDefault(require("./AppContentTabActionContentRowEditorButtons"));
const AppContentTabActionContentRowEditorCopyModal_1 = __importDefault(require("./AppContentTabActionContentRowEditorCopyModal"));
const AppContentTabActionContentRowEditorHeader_1 = __importDefault(require("./AppContentTabActionContentRowEditorHeader"));
const theme = (0, adapter_react_v5_1.Theme)('light');
class AppContentTabActionContentRowEditor extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            rows: [],
            trigger: '',
            showSelectId: false,
            selectIdValue: '',
            indexID: 0,
            dropStart: 0,
            dropEnd: 0,
            dropOver: 0,
            mouseOverNoneDraggable: false,
            itemForID: '',
            openCopyPopup: false,
            indexOfRowToCopyForModal: 0,
            checkboxes: [],
            isMinOneCheckboxChecked: false,
            copyModalOpen: false,
            copyToMenu: '',
            openRenameModal: false,
            isValueChanged: false,
            triggerName: '',
            renamedTriggerName: '',
            saveData: {
                checkboxesToCopy: [],
                copyToMenu: '',
                activeMenu: '',
                tab: '',
                rowIndexToEdit: 0,
                newTriggerName: '',
            },
            targetCheckboxes: {},
            isValueOk: false,
        };
    }
    componentDidMount() {
        (0, actionUtils_js_1.saveRows)(this.props, this.setState.bind(this), [], this.state.rows);
        this.initCheckboxesForEachRow();
    }
    componentDidUpdate(prevProps, prevState) {
        const { newRow } = this.props.data;
        if (prevProps.data.newRow !== newRow) {
            (0, actionUtils_js_1.saveRows)(this.props, this.setState.bind(this), newRow);
            this.initCheckboxesForEachRow();
        }
        if (prevState.checkboxes !== this.state.checkboxes) {
            const isMinOneCheckboxChecked = this.state.checkboxes.some(checkbox => checkbox);
            this.setState({ isMinOneCheckboxChecked });
        }
        if (prevState.renamedTriggerName !== this.state.renamedTriggerName &&
            this.state.renamedTriggerName !== this.state.triggerName) {
            this.setState({ isValueChanged: true });
        }
        if (prevProps.data.state.copyDataObject.targetCheckboxes !==
            this.props.data.state.copyDataObject.targetCheckboxes ||
            prevProps.data.state.copyDataObject.targetActionName !==
                this.props.data.state.copyDataObject.targetActionName) {
            this.isMinOneItemChecked();
        }
    }
    updateData = (obj) => (0, actionUtils_js_1.updateData)(obj, this.props, this.setState.bind(this));
    handleDrop = (index) => {
        if (index !== this.state.dropStart) {
            (0, actionUtils_js_1.moveItem)(this.state.dropStart, this.props, this.setState.bind(this), index - this.state.dropStart);
        }
    };
    disableInput = (name, index) => {
        return (0, string_1.isTruthy)(this.state?.rows?.[index]?.switch_checkbox) && name === 'values';
    };
    initCheckboxesForEachRow = () => {
        const checkboxes = [];
        this.state.rows.forEach((_, index) => {
            checkboxes[index] = false;
        });
        this.setState({ checkboxes: checkboxes });
    };
    checkAll = (check) => {
        const rows = [...this.state.rows];
        const checkboxesRowToCopy = [];
        rows.forEach((_, index) => {
            checkboxesRowToCopy[index] = check;
        });
        this.setState({ checkboxes: checkboxesRowToCopy });
    };
    setCheckbox = (event) => {
        const checkboxes = [...this.state.checkboxes];
        checkboxes[event.index] = event.isChecked;
        this.setState({ checkboxes });
    };
    openCopyModal = () => {
        this.setState({ openCopyPopup: true });
    };
    closeCopyModal = (val) => {
        if (val) {
            this.addSelectedDataToSelected();
        }
        this.initCheckboxesForEachRow();
        this.setState({ openCopyPopup: false });
    };
    addSelectedDataToSelected = () => {
        if (this.functionSave) {
            const obj = this.getSaveData();
            const { isEmpty, action } = this.isActionTabEmpty(obj);
            if (isEmpty) {
                const triggerName = action[obj.activeMenu][obj.tab][obj.rowIndexToEdit].trigger[0];
                this.setState({ openRenameModal: true, triggerName: triggerName, renamedTriggerName: triggerName });
                return;
            }
            this.functionSave.saveData(obj);
        }
    };
    getSaveData = () => {
        return {
            checkboxesToCopy: this.state.checkboxes,
            copyToMenu: this.state.copyToMenu,
            activeMenu: this.props.data.state.activeMenu,
            tab: this.props.data.tab.value,
            rowIndexToEdit: this.props.data.rowIndexToEdit,
            newTriggerName: '',
        };
    };
    isMinOneItemChecked = () => {
        const isOneMenuSelected = !!this.props.data.state.copyDataObject.targetActionName;
        const { isEmpty } = this.isActionTabEmpty(this.getSaveData());
        if (isEmpty && isOneMenuSelected) {
            this.setState({ isValueOk: true });
            return;
        }
        const targetCheckboxes = this.props.data.state.copyDataObject.targetCheckboxes;
        if (!targetCheckboxes || !Object.keys(targetCheckboxes)?.length) {
            this.setState({ isValueOk: false });
            return;
        }
        this.setState({
            isValueOk: Object.keys(targetCheckboxes).some(item => targetCheckboxes[item]),
        });
    };
    functionSave = null;
    setFunctionSave = (ref) => {
        this.functionSave = ref;
    };
    renameMenu = ({ value }) => {
        if (value) {
            if (!this.functionSave) {
                return;
            }
            const obj = this.getSaveData();
            obj.newTriggerName = this.state.renamedTriggerName;
            this.functionSave.saveData(obj);
        }
        this.setState({ openRenameModal: false });
    };
    isActionTabEmpty(obj) {
        const action = this.props.data.state.native.data.action;
        const isEmpty = !action[obj.copyToMenu]?.[obj.tab].length;
        return { isEmpty, action };
    }
    render() {
        return (react_1.default.createElement("div", { className: "edit__container" },
            this.state.openRenameModal ? (react_1.default.createElement(RenameModal_1.default, { rename: this.renameMenu, isOK: this.state.isValueChanged, title: adapter_react_v5_1.I18n.t('Rename trigger name'), value: this.state.renamedTriggerName, setState: this.setState.bind(this), id: "renamedTriggerName" })) : null,
            react_1.default.createElement(AppContentTabActionContentRowEditorHeader_1.default, { callback: {
                    ...this.props.callback,
                    updateData: ({ id, index, isChecked: val }) => this.updateData({ id, index, val }),
                    openCopyModal: this.openCopyModal.bind(this),
                }, data: {
                    ...this.props.data,
                    isMinOneCheckboxChecked: this.state.isMinOneCheckboxChecked,
                } }),
            react_1.default.createElement(material_1.TableContainer, { component: material_1.Paper, className: "edit__container_action" },
                react_1.default.createElement(material_1.Table, { stickyHeader: true, "aria-label": "sticky table" },
                    react_1.default.createElement(AppContentTabActionContentRowEditorTableHead_1.default, { tab: this.props.data.tab, callback: { checkAll: this.checkAll } }),
                    react_1.default.createElement(material_1.TableBody, null, this.state.rows
                        ? this.state.rows.map((row, indexRow) => (react_1.default.createElement(material_1.TableRow, { key: indexRow, sx: { '&:last-child td, &:last-child td': { border: 0 } }, draggable: true, onDrop: () => this.handleDrop(indexRow), onDragStart: event => (0, dragNDrop_js_1.handleDragStart)(indexRow, event, this.state.mouseOverNoneDraggable, this.setState.bind(this)), onDragEnd: () => (0, dragNDrop_js_1.handleDragEnd)(this.setState.bind(this)), onDragOver: event => (0, dragNDrop_js_1.handleDragOver)(indexRow, event), onDragEnter: () => (0, dragNDrop_js_1.handleDragEnter)(indexRow, this.setState.bind(this)), onDragLeave: () => (0, dragNDrop_js_1.handleDragEnter)(indexRow, this.setState.bind(this)), style: (0, dragNDrop_js_1.handleStyleDragOver)(indexRow, this.state.dropOver, this.state.dropStart) },
                            react_1.default.createElement(material_1.TableCell, { component: "td", scope: "row", align: "left", className: "td--checkbox" },
                                react_1.default.createElement(checkbox_1.default, { id: "checkbox", index: indexRow, callback: this.setCheckbox, isChecked: this.state.checkboxes[indexRow] || false, obj: true })),
                            row.IDs || row.IDs === '' ? (react_1.default.createElement(material_1.TableCell, { component: "td", scope: "row", align: "left" },
                                react_1.default.createElement("span", { onMouseEnter: e => (0, dragNDrop_js_1.handleMouseOver)(e), onMouseLeave: e => (0, dragNDrop_js_1.handleMouseOut)(e) },
                                    react_1.default.createElement(input_1.default, { value: row.IDs, id: "IDs", index: indexRow, callback: this.updateData, className: "noneDraggable" },
                                        react_1.default.createElement(btn_small_search_1.default, { index: indexRow, callback: () => this.setState({
                                                showSelectId: true,
                                                selectIdValue: row.IDs,
                                                indexID: indexRow,
                                                itemForID: 'IDs',
                                            }) }))))) : null,
                            this.props.data.tab.entries.map((entry, i) => !entry.checkbox && entry.name != 'IDs' && entry.name != 'trigger' ? (react_1.default.createElement(material_1.TableCell, { align: "left", key: i },
                                react_1.default.createElement(input_1.default, { value: typeof row[entry.name] === 'string'
                                        ? row[entry.name].replace(/&amp;/g, '&')
                                        : '', id: entry.name, index: indexRow, callback: this.updateData, disabled: this.disableInput(entry.name, indexRow), type: entry.type, className: "noneDraggable", onMouseOver: dragNDrop_js_1.handleMouseOver, onMouseLeave: dragNDrop_js_1.handleMouseOut, setState: this.setState.bind(this) }, entry.btnCircleAdd ? (react_1.default.createElement(btn_circle_add_1.BtnCircleAdd, { callback: () => this.props.callback.openHelperText({
                                        index: indexRow,
                                        entry: entry.name,
                                        subCard: this.props.data.tab.value,
                                    }) })) : null),
                                entry.search ? (react_1.default.createElement(btn_small_search_1.default, { index: indexRow, callback: () => this.setState({
                                        showSelectId: true,
                                        selectIdValue: row[entry.name],
                                        indexID: indexRow,
                                        itemForID: entry.name,
                                    }) })) : null)) : entry.checkbox && entry.name != 'parse_mode' ? (react_1.default.createElement(material_1.TableCell, { align: "left", className: "table__head_checkbox", key: i },
                                react_1.default.createElement(checkbox_1.default, { id: entry.name, index: indexRow, callback: ({ id, index, isChecked }) => this.updateData({ id, index, val: isChecked }), isChecked: (0, Utils_js_1.isChecked)(row[entry.name]), obj: true }))) : null),
                            react_1.default.createElement(AppContentTabActionContentRowEditorButtons_1.default, { callback: {
                                    ...this.props.callback,
                                    setStateEditor: this.setState.bind(this),
                                }, data: { ...this.props.data, rows: this.state.rows, indexRow } }))))
                        : null))),
            this.state.showSelectId ? (react_1.default.createElement(adapter_react_v5_1.SelectID, { key: "tableSelect", imagePrefix: "../..", dialogName: this.props.data.adapterName, themeType: this.props.data.state.themeType, theme: theme, socket: this.props.data.socket, filters: {}, selected: this.state.selectIdValue, onClose: () => this.setState({ showSelectId: false }), root: this.props.data.tab.searchRoot?.root, types: this.props.data.tab.searchRoot?.type ? this.props.data.tab.searchRoot.type : undefined, onOk: selected => {
                    this.setState({ showSelectId: false });
                    (0, actionUtils_js_1.updateId)(selected, this.props, this.state.indexID, this.setState.bind(this), this.state.itemForID);
                } })) : null,
            this.state.openCopyPopup ? (react_1.default.createElement(PopupContainer_1.default, { title: "Copy", class: "popupContainer__copy", isOK: this.state.isValueOk, labelBtnOK: "add", callback: ({ value }) => this.closeCopyModal(value) },
                react_1.default.createElement(AppContentTabActionContentRowEditorCopyModal_1.default, { data: { ...this.props.data }, callback: {
                        ...this.props.callback,
                        setStateRowEditor: this.setState.bind(this),
                        setFunctionSave: this.setFunctionSave.bind(this),
                    }, checkboxes: this.state.checkboxes }))) : null));
    }
}
exports.default = AppContentTabActionContentRowEditor;
//# sourceMappingURL=AppContentTabActionContentRowEditor.js.map
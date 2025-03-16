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
const Utils_1 = require("@/lib/Utils");
const checkbox_1 = __importDefault(require("@components/btn-Input/checkbox"));
const material_1 = require("@mui/material");
const react_1 = __importStar(require("react"));
const adapter_react_v5_1 = require("@iobroker/adapter-react-v5");
class AppContentTabActionContentRowEditorCopyModalSelectedValues extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            checked: {},
            isOK: false,
        };
    }
    valueMapping = {
        trigger: adapter_react_v5_1.I18n.t('trigger'),
        values: adapter_react_v5_1.I18n.t('values'),
        returnText: adapter_react_v5_1.I18n.t('returnText'),
        ack: adapter_react_v5_1.I18n.t('ack'),
        confirm: adapter_react_v5_1.I18n.t('confirm'),
        switch_checkbox: adapter_react_v5_1.I18n.t('switchCheckbox'),
        parse_mode: adapter_react_v5_1.I18n.t('parseMode'),
        newline_checkbox: adapter_react_v5_1.I18n.t('newlineCheckbox'),
        text: adapter_react_v5_1.I18n.t('text'),
        IDs: adapter_react_v5_1.I18n.t('ids'),
        url: adapter_react_v5_1.I18n.t('url'),
        user: adapter_react_v5_1.I18n.t('user'),
        password: adapter_react_v5_1.I18n.t('password'),
        filename: adapter_react_v5_1.I18n.t('filename'),
        delay: adapter_react_v5_1.I18n.t('delay'),
        ID: adapter_react_v5_1.I18n.t('id'),
        menu: adapter_react_v5_1.I18n.t('menu'),
        condition: adapter_react_v5_1.I18n.t('condition'),
        picSendDelay: adapter_react_v5_1.I18n.t('picSendDelay'),
    };
    checkboxChecked = ({ isChecked, index }) => {
        const copy = { ...this.state.checked };
        copy[index] = isChecked;
        this.setState({ checked: copy });
        this.props.callback.setStateRowEditor({ targetCheckboxes: this.state.checked });
        this.props.callback.setStateApp({ copyDataObject: { targetCheckboxes: copy } });
    };
    componentDidMount() {
        this.props.callback.setFunctionSave(this);
    }
    saveData = ({ activeMenu, copyToMenu, tab, checkboxesToCopy, rowIndexToEdit, newTriggerName, }) => {
        const addTrigger = !this.props.data.action[copyToMenu]?.[tab].length;
        const ob = this.copySelectedRowsToMenu({
            addTrigger,
            activeMenu,
            tab,
            rowIndexToEdit,
            checkboxesToCopy,
            copyToMenu,
            newTriggerName,
        });
        if (!ob) {
            return;
        }
        this.props.callback.updateNative('data', ob);
    };
    copySelectedRowsToMenu({ activeMenu, tab, rowIndexToEdit, checkboxesToCopy, copyToMenu, addTrigger, newTriggerName, }) {
        const rowToCopy = this.props.data.action[activeMenu][tab][rowIndexToEdit];
        let copyData = (0, Utils_1.deepCopy)(this.props.data);
        if (!copyData) {
            return;
        }
        let emptyObject = false;
        if (copyData.action[copyToMenu][tab].length === 0) {
            emptyObject = true;
        }
        checkboxesToCopy.forEach((value, i) => {
            if (value) {
                if (emptyObject) {
                    copyData = AppContentTabActionContentRowEditorCopyModalSelectedValues.saveToGlobalObject(rowToCopy, addTrigger, copyData, copyToMenu, tab, 0, i, newTriggerName);
                    return copyData;
                }
                Object.keys(this.state.checked).forEach((key, copyToIndex) => {
                    if (!this.state.checked[copyToIndex]) {
                        return;
                    }
                    copyData = AppContentTabActionContentRowEditorCopyModalSelectedValues.saveToGlobalObject(rowToCopy, addTrigger, copyData, copyToMenu, tab, copyToIndex, i);
                });
            }
        });
        return copyData;
    }
    static saveToGlobalObject = (rowToCopy, addTrigger, copyData, menuName, tabActionName, rowNumber, i, newTriggerName) => {
        Object.keys(rowToCopy).forEach(rowParam => {
            if (rowParam === 'trigger' || rowParam === 'parse_mode') {
                if (addTrigger) {
                    copyData = AppContentTabActionContentRowEditorCopyModalSelectedValues.setDataWhenNoTabLength({
                        copyData,
                        menuName,
                        tabActionName,
                        rowParam,
                        rowToCopy,
                        elInRow: 0,
                        newTriggerName,
                    });
                }
                return;
            }
            if (addTrigger) {
                copyData = AppContentTabActionContentRowEditorCopyModalSelectedValues.setDataWhenNoTabLength({
                    copyData,
                    menuName,
                    tabActionName,
                    rowParam,
                    rowToCopy,
                    elInRow: i,
                    newTriggerName: '',
                });
                if (!copyData.action[menuName][tabActionName][rowNumber]?.[rowParam]) {
                    copyData.action[menuName][tabActionName][rowNumber][rowParam] = [rowToCopy[rowParam][i]];
                    return;
                }
                copyData.action[menuName][tabActionName][rowNumber][rowParam].push(rowToCopy[rowParam][i]);
                return;
            }
            copyData.action[menuName][tabActionName][rowNumber][rowParam].push(rowToCopy[rowParam][i]);
        });
        return copyData;
    };
    static setDataWhenNoTabLength = ({ copyData, menuName, tabActionName, rowParam, rowToCopy, elInRow, newTriggerName, }) => {
        if (!copyData.action[menuName][tabActionName].length) {
            if (rowParam === 'trigger') {
                copyData.action[menuName][tabActionName].push({ [rowParam]: [newTriggerName] });
                return copyData;
            }
            copyData.action[menuName][tabActionName].push({ [rowParam]: [rowToCopy[rowParam][elInRow]] });
        }
        return copyData;
    };
    render() {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(material_1.Table, null,
                react_1.default.createElement(material_1.TableHead, null,
                    react_1.default.createElement(material_1.TableRow, null,
                        react_1.default.createElement(material_1.TableCell, { align: "left" }),
                        this.props.value?.[0]
                            ? Object.keys(this.props.value[0]).map((item, index) => (react_1.default.createElement(material_1.TableCell, { align: "left", key: index }, this.valueMapping[item] || item)))
                            : null)),
                react_1.default.createElement(material_1.TableBody, null, this.props.value
                    ? this.props.value.map((row, index) => (react_1.default.createElement(material_1.TableRow, { key: index },
                        react_1.default.createElement(material_1.TableCell, { align: "left" },
                            react_1.default.createElement(checkbox_1.default, { callback: this.checkboxChecked, id: "checkbox", index: index, isChecked: this.state.checked[index] || false })),
                        Object.keys(row).map((val, i) => (react_1.default.createElement(material_1.TableCell, { align: "left", key: i }, typeof row[val] === 'string'
                            ? row[val]
                            : row[val].map((entry, index) => {
                                return (react_1.default.createElement(material_1.Table, { key: index },
                                    react_1.default.createElement(material_1.TableBody, null,
                                        react_1.default.createElement(material_1.TableRow, { className: "SubTable" },
                                            react_1.default.createElement(material_1.TableCell, { align: "left" }, entry)))));
                            })))))))
                    : null))));
    }
}
exports.default = AppContentTabActionContentRowEditorCopyModalSelectedValues;
//# sourceMappingURL=AppContentTabActionContentRowEditorCopyModalSelectedValues.js.map
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
const AppContentTabNavigationTableBody_1 = __importDefault(require("@/pages/AppContentTabNavigationTableBody"));
const AppContentTabNavigationTableHeader_1 = __importDefault(require("@/pages/AppContentTabNavigationTableHeader"));
const AppContentTabNavigationTableRowEditor_1 = __importDefault(require("@/pages/AppContentTabNavigationTableRowEditor"));
const AppContentTabNavigationTableHelper_1 = __importDefault(require("@/pages/AppContentTabNavigationTableHelper"));
const Utils_js_1 = require("@/lib/Utils.js");
const string_1 = require("@/lib/string");
class TabNavigation extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            rowPopup: false,
            rowIndex: 0,
            editRow: false,
            valuesAreOk: false,
            callInUse: false,
            helperTextFor: '',
            editedValueFromHelperText: null,
            isOK: false,
            helperText: false,
            newRow: {},
            nav: '',
            call: '',
            text: '',
        };
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevState.editedValueFromHelperText !== this.state.editedValueFromHelperText) {
            if (this.state.editedValueFromHelperText !== null && this.state.editedValueFromHelperText !== undefined) {
                if (this.state.editedValueFromHelperText !== '') {
                    this.setState({ isOK: this.checkNewValueIsOK() });
                }
            }
        }
        if (prevState.newRow !== this.state.newRow) {
            this.checkValueAlreadyUsed();
        }
    }
    checkValueAlreadyUsed = () => {
        if (this.state.newRow.text !== '') {
            if (this.state.editRow) {
                this.setState({ valuesAreOk: true });
            }
            else if (this.props.data.state.usedTrigger.includes(this.state.newRow.call) ||
                this.state.newRow.call.startsWith('menu')) {
                this.setState({ valuesAreOk: false });
            }
            else {
                this.setState({ valuesAreOk: true });
            }
        }
        else {
            this.setState({ valuesAreOk: false });
        }
        if (this.state.newRow.call !== '') {
            if (this.state.editRow) {
                this.setState({ callInUse: false });
            }
            else if (this.props.data.state.usedTrigger.includes(this.state.newRow.call) ||
                this.state.newRow.call.startsWith('menu')) {
                this.setState({ callInUse: true });
            }
            else {
                this.setState({ callInUse: false });
            }
        }
    };
    checkNewValueIsOK = () => {
        return (this.state.editedValueFromHelperText !== null &&
            this.state.editedValueFromHelperText !== undefined &&
            this.state.editedValueFromHelperText !== '' &&
            this.state.editedValueFromHelperText !== this.state[this.state.helperTextFor]);
    };
    modifyValueFromNewRow() {
        const row = this.state.newRow;
        row.value = (0, string_1.splitTrimAndJoin)((0, string_1.splitTrimAndJoin)(row.value, ',', ' , '), '&&', ' && ');
        return row;
    }
    popupRowCard = ({ value }) => {
        if (!value) {
            this.setState({ rowPopup: false, editRow: false });
            return;
        }
        const dataCopy = JSON.parse(JSON.stringify(this.props.data.state.native.data));
        const navUserArray = dataCopy.nav[this.props.data.state.activeMenu];
        const newRow = this.modifyValueFromNewRow();
        if (this.state.editRow) {
            navUserArray.splice(this.state.rowIndex, 1, newRow);
        }
        else {
            navUserArray.splice(this.state.rowIndex + 1, 0, newRow);
        }
        dataCopy.nav[this.props.data.state.activeMenu] = navUserArray;
        this.props.callback.updateNative('data', dataCopy);
        this.setState({ rowPopup: false, editRow: false });
    };
    openAddRowCard = ({ index }) => {
        if (index) {
            this.setState({ rowIndex: index });
        }
        const obj = {};
        this.props.data.entries.forEach(entry => {
            obj[entry.name] = entry.val;
        });
        this.setState({ newRow: obj, rowPopup: true });
    };
    popupHelperCard = ({ value }) => {
        if (value) {
            const copyNewRow = (0, Utils_js_1.deepCopy)(this.state.newRow);
            if (!copyNewRow) {
                return;
            }
            const name = this.state.helperTextFor;
            copyNewRow[name] = this.state.editedValueFromHelperText;
            this.setState({ newRow: copyNewRow });
        }
        this.setState({ helperText: false, editedValueFromHelperText: null });
    };
    render() {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(material_1.TableContainer, { component: material_1.Paper, className: "navigation__container" },
                react_1.default.createElement(material_1.Table, { stickyHeader: true, "aria-label": "sticky table" },
                    react_1.default.createElement(AppContentTabNavigationTableHeader_1.default, { entries: this.props.data.entries }),
                    react_1.default.createElement(AppContentTabNavigationTableBody_1.default, { data: this.props.data, callback: this.props.callback, card: 'nav', showButtons: { add: true, remove: true, edit: true }, openAddRowCard: this.openAddRowCard, setState: this.setState.bind(this) }))),
            this.state.rowPopup ? (react_1.default.createElement(AppContentTabNavigationTableRowEditor_1.default, { state: this.state, setState: this.setState.bind(this), data: this.props.data, popupRowCard: this.popupRowCard })) : null,
            this.state.helperText ? (react_1.default.createElement(AppContentTabNavigationTableHelper_1.default, { state: this.state, setState: this.setState.bind(this), data: this.props.data, popupHelperCard: this.popupHelperCard })) : null));
    }
}
exports.default = TabNavigation;
//# sourceMappingURL=AppContentTabNavigation.js.map
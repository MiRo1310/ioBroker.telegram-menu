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
const Utils_js_1 = require("@/lib/Utils.js");
const adapter_react_v5_1 = require("@iobroker/adapter-react-v5");
const material_1 = require("@mui/material");
const react_1 = __importStar(require("react"));
const HelperCard_1 = __importDefault(require("@/components/popupCards/HelperCard"));
const PopupContainer_1 = __importDefault(require("@/components/popupCards/PopupContainer"));
const helper_js_1 = __importDefault(require("@/config/helper.js"));
const actionUtils_js_1 = require("@/lib/actionUtils.js");
const AppContentTabActionContentRowEditor_1 = __importDefault(require("@/pages/AppContentTabActionContentRowEditor"));
const AppContentTabActionContentTable_1 = __importDefault(require("@/pages/AppContentTabActionContentTable"));
const Button_1 = __importDefault(require("@components/Button"));
const ErrorBoundary_1 = __importDefault(require("@components/ErrorBoundary"));
class ActionCard extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            rowPopup: false,
            rowIndexToEdit: 0,
            editRow: false,
            newRow: {},
            rowsLength: 0,
            newUnUsedTrigger: this.props.data.state.unUsedTrigger,
            helperText: false,
            helperTextFor: '',
            helperTextForInput: '',
            editedValueFromHelperText: null,
            isOK: false,
            valueForSave: null,
            inputValuesAreOK: true,
            disableInput: false,
            nav: '',
            text: '',
        };
    }
    componentDidUpdate(prevProps, prevState) {
        const { native, activeMenu } = this.props.data.state;
        if (prevState.editedValueFromHelperText !== this.state.editedValueFromHelperText) {
            if (this.state.editedValueFromHelperText !== null && this.state.editedValueFromHelperText !== undefined) {
                if (this.state.editedValueFromHelperText !== '') {
                    this.setState({ isOK: this.checkNewValueIsOK() });
                }
            }
        }
        if (prevProps.data !== this.props.data || activeMenu !== prevProps.data.state.activeMenu) {
            this.getLengthOfData(native.data.action, activeMenu);
        }
        if (prevState.newRow !== this.state.newRow) {
            this.disableButtonHandler();
        }
    }
    checkNewValueIsOK = () => {
        return !!(this.state.editedValueFromHelperText &&
            this.state.editedValueFromHelperText !== '' &&
            this.state.editedValueFromHelperText !== this.state[this.state.helperTextFor]);
    };
    addEditedTrigger = (trigger) => {
        const unUsedTrigger = (0, Utils_js_1.deepCopy)(this.props.data.state.unUsedTrigger);
        if (!unUsedTrigger) {
            return;
        }
        if (trigger) {
            this.setState({ newUnUsedTrigger: [...unUsedTrigger, trigger] });
            return;
        }
    };
    disableButtonHandler() {
        const { tab } = this.props.data;
        let inputValuesAreOk = true;
        const row = this.state.newRow;
        tab.entries.forEach(entry => {
            if (!entry.checkbox && entry.required) {
                if (!row[entry.name]) {
                    row[entry.name] = [''];
                }
                row[entry.name].forEach(val => {
                    if (inputValuesAreOk && entry.name === 'values') {
                        if (typeof val !== 'string') {
                            inputValuesAreOk = false;
                        }
                        return;
                    }
                    if (inputValuesAreOk && val == '') {
                        inputValuesAreOk = false;
                    }
                });
            }
        });
        if (this.state.inputValuesAreOK !== inputValuesAreOk) {
            this.setState({ inputValuesAreOK: inputValuesAreOk });
        }
    }
    componentDidMount() {
        const { native, activeMenu } = this.props.data.state;
        this.resetNewRow();
        this.getLengthOfData(native.data?.action, activeMenu);
    }
    openAddRowCard = ({ index }) => {
        this.addEditedTrigger(null);
        this.setState({ rowPopup: true, rowIndexToEdit: index });
    };
    eventModalButtonClick = ({ value: saveData }) => {
        if (saveData) {
            this.saveData();
        }
        this.setState({ newUnUsedTrigger: null, rowPopup: false, editRow: false });
        this.resetNewRow();
    };
    saveData() {
        const { value: subCard } = this.props.data.tab;
        const { native, activeMenu } = this.props.data.state;
        const data = (0, Utils_js_1.deepCopy)(native.data);
        if (!data) {
            return;
        }
        if (!data.action[activeMenu][subCard]) {
            data.action[activeMenu][subCard] = [];
        }
        if (this.state.editRow) {
            data.action[activeMenu][subCard].splice(this.state.rowIndexToEdit, 1, this.state.newRow);
        }
        else {
            data.action[activeMenu][subCard].splice(this.state.rowIndexToEdit + 1, 0, this.state.newRow);
        }
        this.props.callback.updateNative('data', data);
    }
    resetNewRow = () => {
        const newRow = {};
        this.props.data.tab.entries.forEach(entry => {
            newRow[entry.name] = [entry.val || ''];
        });
        this.setState({ newRow: newRow });
    };
    getLengthOfData = (data, activeMenu) => {
        const { value: subCard } = this.props.data.tab;
        if (data?.[activeMenu]?.[subCard]?.length) {
            this.setState({ rowsLength: data[activeMenu][subCard].length });
            return;
        }
        this.setState({ rowsLength: 0 });
    };
    openHelperText = (value) => {
        this.setState({ valueForSave: value });
        if (value) {
            this.setState({
                editedValueFromHelperText: this.state.newRow[value.entry][value.index],
                helperTextFor: value.subCard,
                helperTextForInput: value.entry,
            });
        }
        this.setState({ helperText: true });
    };
    onchangeValueFromHelper = ({ value }) => {
        if (this.state.editedValueFromHelperText === null) {
            this.setState({ editedValueFromHelperText: value });
            return;
        }
        this.setState({ editedValueFromHelperText: `${this.state.editedValueFromHelperText} ${value}` });
    };
    popupHelperCard = ({ value }) => {
        if (value) {
            const row = (0, Utils_js_1.deepCopy)(this.state.newRow);
            if (!row) {
                return;
            }
            if (!this.state.valueForSave) {
                return;
            }
            row[this.state.valueForSave?.entry][this.state.valueForSave?.index] = this.state.editedValueFromHelperText;
            this.setState({ newRow: row });
        }
        this.setState({ helperText: false, editedValueFromHelperText: null });
    };
    addNewRow = ({ index }) => {
        this.setState({ rowPopup: true });
        const combinedProps = {
            data: {
                newRow: this.state.newRow,
                tab: { entries: this.props.data.tab.entries },
            },
        };
        (0, actionUtils_js_1.addNewRow)(index, combinedProps, this.props.callback.setStateApp, this.props.callback.setStateApp);
    };
    render() {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            this.state.rowsLength == 0 ? (react_1.default.createElement(Button_1.default, { b_color: "#96d15a", title: "addAction", width: "50%", margin: "0 18px", height: "50px", index: null, callback: this.addNewRow },
                react_1.default.createElement("i", { className: "material-icons translate" }, "add"),
                adapter_react_v5_1.I18n.t('addAction'))) : (react_1.default.createElement(material_1.TableContainer, { component: material_1.Paper, className: "action__container" },
                react_1.default.createElement(material_1.Table, { stickyHeader: true, "aria-label": "sticky table" },
                    react_1.default.createElement(material_1.TableHead, null,
                        react_1.default.createElement(material_1.TableRow, null,
                            this.props.data.tab.entries.map((entry, index) => (react_1.default.createElement(material_1.TableCell, { key: index },
                                react_1.default.createElement("span", { title: entry.title ? adapter_react_v5_1.I18n.t(entry.title) : undefined }, adapter_react_v5_1.I18n.t(entry.headline))))),
                            Array(Object.keys(this.props.data.showButtons).length)
                                .fill(undefined)
                                .map((_, i) => (react_1.default.createElement(material_1.TableCell, { key: i, align: "center", className: "table__cell_icon" }))))),
                    react_1.default.createElement(ErrorBoundary_1.default, null,
                        react_1.default.createElement(AppContentTabActionContentTable_1.default, { data: this.props.data, callback: {
                                ...this.props.callback,
                                setStateTabActionContent: this.setState.bind(this),
                                openAddRowCard: this.openAddRowCard,
                                addEditedTrigger: this.addEditedTrigger,
                            } }))))),
            this.state.rowPopup ? (react_1.default.createElement(PopupContainer_1.default, { callback: this.eventModalButtonClick, width: this.props.data.tab.popupCard.width, height: this.props.data.tab.popupCard.height, title: this.props.data.tab.label, isOK: this.state.inputValuesAreOK },
                react_1.default.createElement(AppContentTabActionContentRowEditor_1.default, { data: {
                        ...this.props.data,
                        newRow: this.state.newRow,
                        newUnUsedTrigger: this.state.newUnUsedTrigger || this.props.data.state.unUsedTrigger,
                        rowIndexToEdit: this.state.rowIndexToEdit,
                    }, callback: {
                        ...this.props.callback,
                        setStateTabActionContent: this.setState.bind(this),
                        openHelperText: this.openHelperText,
                    } }))) : null,
            this.state.helperText ? (react_1.default.createElement(PopupContainer_1.default, { callback: this.popupHelperCard, width: "90%", height: "80%", title: "Helper Texte", setState: this.setState.bind(this), isOK: this.state.isOK, class: "HelperText" },
                react_1.default.createElement(HelperCard_1.default, { data: this.props.data, helper: helper_js_1.default, name: "action", val: this.state.helperTextFor, text: this.state.text, helperTextForInput: this.state.helperTextForInput, callback: this.onchangeValueFromHelper, editedValueFromHelperText: this.state.editedValueFromHelperText, setState: this.setState.bind(this) }))) : null));
    }
}
exports.default = ActionCard;
//# sourceMappingURL=AppContentTabActionContent.js.map
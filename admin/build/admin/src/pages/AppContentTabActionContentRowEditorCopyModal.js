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
const select_1 = __importDefault(require("@components/btn-Input/select"));
const react_1 = __importStar(require("react"));
const AppContentTabActionContentRowEditorCopyModalSelectedValues_1 = __importDefault(require("./AppContentTabActionContentRowEditorCopyModalSelectedValues"));
const adapter_react_v5_1 = require("@iobroker/adapter-react-v5");
class AppContentTabActionContentRowEditorCopyModal extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedMenu: '',
            action: '',
        };
    }
    componentDidMount() {
        this.setState({ action: this.props.data.tab.value });
    }
    getAllMenusWithoutActiveMenu() {
        return Object.keys(this.props.data.state.native.usersInGroup);
    }
    getValuesInSelectedAction() {
        return this.props.data.state.native.data.action?.[this.state.selectedMenu]?.[this.state.action] || [];
    }
    updateSelect = ({ val }) => {
        this.setState({ selectedMenu: val });
        this.props.callback.setStateRowEditor({ copyToMenu: val });
        this.props.callback.setStateApp({ copyDataObject: { targetActionName: val } });
    };
    render() {
        return (react_1.default.createElement("div", { className: "editor__modal_container" },
            react_1.default.createElement("div", { className: "editor__modal_inputs" },
                adapter_react_v5_1.I18n.t('activeMenu'),
                ": ",
                this.props.data.state.activeMenu,
                react_1.default.createElement("p", null, adapter_react_v5_1.I18n.t('menuToCopy')),
                react_1.default.createElement(select_1.default, { options: this.getAllMenusWithoutActiveMenu(), id: "selectedMenu", selected: this.state.selectedMenu || '', placeholder: "Select a menu", callback: this.updateSelect })),
            this.state.action !== '' ? (react_1.default.createElement(AppContentTabActionContentRowEditorCopyModalSelectedValues_1.default, { value: this.getValuesInSelectedAction(), data: this.props.data.state.native.data, callback: {
                    ...this.props.callback,
                    setStateRowEditor: this.props.callback.setStateRowEditor,
                    setFunctionSave: this.props.callback.setFunctionSave,
                } })) : null));
    }
}
exports.default = AppContentTabActionContentRowEditorCopyModal;
//# sourceMappingURL=AppContentTabActionContentRowEditorCopyModal.js.map
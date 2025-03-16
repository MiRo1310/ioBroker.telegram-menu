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
const adapter_react_v5_1 = require("@iobroker/adapter-react-v5");
const react_1 = __importStar(require("react"));
const Button_1 = __importDefault(require("@components/Button"));
const input_1 = __importDefault(require("../components/btn-Input/input"));
const RenameModal_1 = __importDefault(require("@components/RenameModal"));
const string_1 = require("@/lib/string");
const Utils_1 = require("@/lib/Utils");
class BtnCard extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            oldMenuName: '',
            newMenuName: '',
            renamedMenuName: '',
            confirmDialog: false,
            renameDialog: false,
            menuNameExists: false,
            isOK: false,
        };
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevState.oldMenuName !== this.props.data.state.activeMenu) {
            this.setState({
                oldMenuName: this.props.data.state.activeMenu,
                renamedMenuName: this.props.data.state.activeMenu,
            });
        }
        if (prevState.newMenuName !== this.state.newMenuName) {
            this.setState({ menuNameExists: this.validateMenuName(this.state.newMenuName) });
        }
        if (this.state.renamedMenuName) {
            if (prevState.renamedMenuName !== this.state.renamedMenuName) {
                if (this.userChangedMenuName()) {
                    this.setState({ isOK: false });
                }
                if (!this.props.data.state.native.usersInGroup) {
                    return;
                }
                this.setState({ isOK: !this.validateMenuName(this.state.renamedMenuName) });
            }
        }
    }
    validateMenuName(str) {
        return str !== '' && !!this.props.data.state.native.usersInGroup?.[str.replace(/ /g, '_')];
    }
    userChangedMenuName() {
        return this.state.renamedMenuName === this.props.data.state.activeMenu;
    }
    addNewMenu = (newMenuName, copyMenu) => {
        newMenuName = (0, string_1.replaceSpaceWithUnderscore)(newMenuName);
        let addNewMenu = false;
        const data = (0, Utils_1.deepCopy)(this.props.data.state.native.data);
        let userActiveCheckbox = (0, Utils_1.deepCopy)(this.props.data.state.native.userActiveCheckbox);
        if (!data || !userActiveCheckbox) {
            return;
        }
        const usersInGroup = { ...this.props.data.state.native.usersInGroup };
        if (!this.props.data.state.native.data.nav) {
            data.nav = {};
            data.action = {};
            userActiveCheckbox = {};
            addNewMenu = true;
        }
        else if (newMenuName !== '' && !this.props.data.state.native.data.nav[newMenuName]) {
            if (copyMenu) {
                data.nav[newMenuName] = data.nav[this.state.oldMenuName];
                data.action[newMenuName] = data.action[this.state.oldMenuName];
                userActiveCheckbox[newMenuName] = userActiveCheckbox[this.state.oldMenuName];
                usersInGroup[newMenuName] = usersInGroup[this.state.oldMenuName];
            }
            else {
                addNewMenu = true;
            }
        }
        else {
            return;
        }
        if (addNewMenu) {
            data.nav[newMenuName] = [
                {
                    call: 'StartSide',
                    value: 'Iobroker, Light, Grafana, Weather',
                    text: 'chooseAction',
                    parse_mode: 'false',
                },
            ];
            data.action[newMenuName] = { get: [], set: [], pic: [], echarts: [], events: [], httpRequest: [] };
            userActiveCheckbox[newMenuName] = false;
            usersInGroup[newMenuName] = [];
            this.setState({ newMenuName: '' });
        }
        this.updateNative(data, usersInGroup, userActiveCheckbox);
        setTimeout(() => {
            this.props.callback.setStateApp({ activeMenu: newMenuName });
        }, 500);
    };
    updateNative(data, usersInGroup, userActiveCheckbox) {
        this.props.callback.updateNative('data', data, () => this.props.callback.updateNative('usersInGroup', usersInGroup, () => this.props.callback.updateNative('userActiveCheckbox', userActiveCheckbox)));
    }
    removeMenu = (menu, renameMenu, newMenu) => {
        const newObject = (0, Utils_1.deepCopy)(this.props.data.state.native.data);
        const copyOfUsersInGroup = (0, Utils_1.deepCopy)(this.props.data.state.native.usersInGroup);
        const userActiveCheckbox = (0, Utils_1.deepCopy)(this.props.data.state.native.userActiveCheckbox);
        if (!copyOfUsersInGroup || !userActiveCheckbox || !newObject) {
            return;
        }
        delete newObject.nav[menu];
        delete newObject.action[menu];
        delete userActiveCheckbox[menu];
        delete copyOfUsersInGroup[menu];
        this.updateNative(newObject, copyOfUsersInGroup, userActiveCheckbox);
        if (renameMenu) {
            this.props.callback.setStateApp({ activeMenu: newMenu });
            return;
        }
        this.setFirstMenuInList(newObject);
    };
    openConfirmDialog = () => {
        this.setState({ confirmDialog: true });
    };
    renameMenu = ({ value }) => {
        if (!value) {
            this.setState({ renameDialog: false });
            return;
        }
        const oldMenuName = this.state.oldMenuName;
        const newMenu = this.state.renamedMenuName;
        if (BtnCard.validateNewMenuName(newMenu, oldMenuName)) {
            return;
        }
        this.addNewMenu(this.state.renamedMenuName, true);
        setTimeout(() => {
            this.removeMenu(oldMenuName, true, newMenu);
        }, 1000);
        this.setState({ renameDialog: false });
    };
    static validateNewMenuName(newMenu, oldMenuName) {
        return newMenu === '' || newMenu == undefined || newMenu === oldMenuName;
    }
    openRenameDialog = () => {
        this.setState({ renamedMenuName: this.state.oldMenuName });
        this.setState({ renameDialog: true });
    };
    buttonAddNewMenuHandler = ({ value }) => {
        this.addNewMenu(value, false);
    };
    appSetStateHandler = ({ id, value: cbValue }) => {
        this.props.callback.setStateApp({ [id]: cbValue });
    };
    setFirstMenuInList(newObject) {
        const firstMenu = Object.keys(newObject.nav)[0];
        this.props.callback.setStateApp({ activeMenu: firstMenu });
    }
    render() {
        return (react_1.default.createElement("div", { className: "header__menu_buttons" },
            react_1.default.createElement(input_1.default, { placeholder: adapter_react_v5_1.I18n.t('addMenu'), value: this.state.newMenuName, callback: ({ val }) => this.setState({ newMenuName: val?.toString() || '' }), class: this.state.menuNameExists ? 'inUse' : '' }),
            react_1.default.createElement(Button_1.default, { callbackValue: this.state.newMenuName, callback: this.buttonAddNewMenuHandler, disabled: !this.state.newMenuName || this.state.newMenuName === '', className: `${!this.state.newMenuName || this.state.newMenuName === '' ? 'button__disabled' : 'button--hover'} header__button_actions button button__add button__icon_text` },
                react_1.default.createElement("i", { className: "material-icons" }, "group_add"),
                adapter_react_v5_1.I18n.t('add')),
            react_1.default.createElement(Button_1.default, { callback: this.openConfirmDialog, className: "button button__delete button--hover header__button_actions" },
                react_1.default.createElement("i", { className: "material-icons" }, "delete"),
                adapter_react_v5_1.I18n.t('delete')),
            react_1.default.createElement(Button_1.default, { id: "openRenameMenu", callback: this.openRenameDialog, className: "button button--hover button__edit header__button_actions" },
                react_1.default.createElement("i", { className: "material-icons" }, "edit"),
                adapter_react_v5_1.I18n.t('edit')),
            react_1.default.createElement(Button_1.default, { id: "showDropBox", callbackValue: true, callback: this.appSetStateHandler, className: "button button--hover button__copy header__button_actions" },
                react_1.default.createElement("i", { className: "material-icons translate " }, "content_copy"),
                adapter_react_v5_1.I18n.t('copy')),
            react_1.default.createElement(Button_1.default, { id: "showTriggerInfo", callbackValue: true, callback: this.appSetStateHandler, className: " button button__info button--hover header__button_actions" },
                react_1.default.createElement("i", { className: "material-icons translate " }, "info"),
                adapter_react_v5_1.I18n.t('overview')),
            this.state.confirmDialog ? (react_1.default.createElement(adapter_react_v5_1.Confirm, { title: adapter_react_v5_1.I18n.t('reallyDelete'), text: adapter_react_v5_1.I18n.t('confirmDelete'), ok: adapter_react_v5_1.I18n.t('yes'), cancel: adapter_react_v5_1.I18n.t('abort'), dialogName: "myConfirmDialogThatCouldBeSuppressed", onClose: isYes => {
                    if (isYes) {
                        this.removeMenu(this.state.oldMenuName, false);
                    }
                    this.setState({ confirmDialog: false });
                } })) : null,
            this.state.renameDialog ? (react_1.default.createElement(RenameModal_1.default, { rename: this.renameMenu, isOK: this.state.isOK, title: adapter_react_v5_1.I18n.t('renameMenu'), value: this.state.renamedMenuName, setState: this.setState.bind(this), id: "renamedMenuName" })) : null));
    }
}
exports.default = BtnCard;
//# sourceMappingURL=AppContentHeaderMenuButtons.js.map
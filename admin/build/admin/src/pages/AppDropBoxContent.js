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
const select_1 = __importDefault(require("@/components/btn-Input/select"));
const material_1 = require("@mui/material");
const adapter_react_v5_1 = require("@iobroker/adapter-react-v5");
const actionUtils_1 = require("@/lib/actionUtils");
const Utils_1 = require("@/lib/Utils");
const PopupContainer_1 = __importDefault(require("@/components/popupCards/PopupContainer"));
const RenameCard_1 = __importDefault(require("@/components/popupCards/RenameCard"));
class DropBox extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            inDropBox: false,
            menuList: [],
            selectedMenu: '',
            selectedValue: 'move',
            openRenamePopup: false,
            trigger: '',
            newTrigger: '',
            usedTrigger: [],
            rowToWorkWith: {},
            isOK: false,
            oldTrigger: '',
        };
    }
    componentDidMount() {
        this.updateMenuList();
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.data.state.activeMenu !== this.props.data.state.activeMenu) {
            this.setState({ selectedMenu: '' });
            this.updateMenuList();
        }
        if (prevState.newTrigger !== this.state.newTrigger) {
            if (this.state.usedTrigger) {
                if (this.state.usedTrigger.includes(this.state.newTrigger) ||
                    this.state.newTrigger === '' ||
                    this.state.newTrigger === this.state.oldTrigger) {
                    this.setState({ isOK: false });
                }
                else {
                    this.setState({ isOK: true });
                }
            }
            else {
                this.setState({ isOK: true });
            }
        }
    }
    updateMenuList = () => {
        const menuList = Object.keys(this.props.data.state.native.usersInGroup);
        this.setState({ menuList: menuList });
    };
    static handleDragOver = (e) => {
        e.preventDefault();
    };
    handleOnDrop = () => {
        if (this.state.selectedMenu === '') {
            return;
        }
        const data = (0, Utils_1.deepCopy)(this.props.data.state.native.data);
        if (!data) {
            return;
        }
        let rowToWorkWith = {};
        const moveOrCopy = this.state.selectedValue;
        if (this.state.newTrigger === '' && !(this.props.data.state.subTab === 'events')) {
            if (this.props.data.state.tab === 'action') {
                rowToWorkWith =
                    this.props.data.state.native.data[this.props.data.state.tab][this.props.data.state.activeMenu][this.props.data.state.subTab][this.props.index];
            }
            else {
                rowToWorkWith =
                    this.props.data.state.native.data[this.props.data.state.tab][this.props.data.state.activeMenu][this.props.index];
            }
            this.setState({ rowToWorkWith: rowToWorkWith });
            const usedTrigger = (0, actionUtils_1.updateTriggerForSelect)(data, this.props.data.state.native?.usersInGroup, this.state.selectedMenu)?.usedTrigger;
            this.setState({ usedTrigger: usedTrigger || [] });
            if (this.props.data.state.tab === 'action' && 'trigger' in rowToWorkWith) {
                if (moveOrCopy === 'copy') {
                    if (rowToWorkWith.trigger && usedTrigger?.includes(rowToWorkWith.trigger[0])) {
                        this.setState({
                            trigger: rowToWorkWith.trigger[0],
                            newTrigger: rowToWorkWith.trigger[0],
                            openRenamePopup: true,
                            oldTrigger: rowToWorkWith.trigger[0],
                        });
                    }
                }
                else {
                    const items = DropBox.countItemsInArray(usedTrigger, rowToWorkWith.trigger[0]);
                    if (items && items <= 1) {
                        this.setState({ trigger: rowToWorkWith.trigger[0], newTrigger: rowToWorkWith.trigger[0] });
                        this.move(rowToWorkWith, data);
                    }
                    else {
                        this.setState({
                            trigger: rowToWorkWith.trigger[0],
                            newTrigger: rowToWorkWith.trigger[0],
                            openRenamePopup: true,
                            oldTrigger: rowToWorkWith.trigger[0],
                        });
                    }
                }
            }
            else {
                if (moveOrCopy === 'copy' && 'call' in rowToWorkWith) {
                    if (usedTrigger?.includes(rowToWorkWith.call)) {
                        this.setState({
                            trigger: rowToWorkWith.call,
                            newTrigger: rowToWorkWith.call,
                            openRenamePopup: true,
                            oldTrigger: rowToWorkWith.call,
                        });
                    }
                }
                else if ('call' in rowToWorkWith) {
                    const items = DropBox.countItemsInArray(usedTrigger, rowToWorkWith.call);
                    if (items && items <= 1) {
                        this.setState({ trigger: rowToWorkWith.call, newTrigger: rowToWorkWith.call });
                        this.move(rowToWorkWith, data);
                    }
                    else {
                        this.setState({
                            trigger: rowToWorkWith.call,
                            newTrigger: rowToWorkWith.call,
                            openRenamePopup: true,
                            oldTrigger: rowToWorkWith.call,
                        });
                    }
                }
            }
        }
        else {
            if (this.props.data.state.subTab === 'events') {
                rowToWorkWith =
                    this.props.data.state.native.data[this.props.data.state.tab][this.props.data.state.activeMenu][this.props.data.state.subTab][this.props.index];
            }
            else if (!rowToWorkWith) {
                rowToWorkWith = this.state.rowToWorkWith;
            }
            if (moveOrCopy === 'copy') {
                this.copy(rowToWorkWith, data);
            }
            else {
                this.move(rowToWorkWith, data);
            }
        }
    };
    static countItemsInArray = (data, searchedString) => {
        let count = 0;
        if (!data) {
            return;
        }
        data.forEach(element => {
            if (element.trim() === searchedString.trim()) {
                count++;
            }
        });
        return count;
    };
    move = (rowToWorkWith, data) => {
        if (this.props.data.state.tab === 'action' && this.props.data.state.subTab !== 'events') {
            if (this.state.newTrigger !== '' && 'trigger' in rowToWorkWith) {
                rowToWorkWith.trigger[0] = this.state.newTrigger;
            }
            if (!data[this.props.data.state.tab][this.state.selectedMenu][this.props.data.state.subTab]) {
                data[this.props.data.state.tab][this.state.selectedMenu][this.props.data.state.subTab] = [];
            }
            data[this.props.data.state.tab][this.state.selectedMenu][this.props.data.state.subTab].push(rowToWorkWith);
            data[this.props.data.state.tab][this.props.data.state.activeMenu][this.props.data.state.subTab].splice(this.props.index, 1);
        }
        else if (this.props.data.state.subTab == 'events') {
            if (!data[this.props.data.state.tab][this.state.selectedMenu][this.props.data.state.subTab]) {
                data[this.props.data.state.tab][this.state.selectedMenu][this.props.data.state.subTab] = [];
            }
            data[this.props.data.state.tab][this.state.selectedMenu][this.props.data.state.subTab].push(rowToWorkWith);
            data[this.props.data.state.tab][this.props.data.state.activeMenu][this.props.data.state.subTab].splice(this.props.index, 1);
        }
        else {
            if (this.state.newTrigger !== '' && 'call' in rowToWorkWith) {
                rowToWorkWith.call = this.state.newTrigger;
            }
            data[this.props.data.state.tab][this.state.selectedMenu].push(rowToWorkWith);
            data[this.props.data.state.tab][this.props.data.state.activeMenu].splice(this.props.index, 1);
        }
        this.props.callback.updateNative('data', data);
        this.setState({ newTrigger: '' });
    };
    copy = (rowToWorkWith, data) => {
        if (this.props.data.state.tab === 'action' &&
            this.props.data.state.subTab !== 'events' &&
            'trigger' in rowToWorkWith) {
            rowToWorkWith.trigger[0] = this.state.newTrigger;
            data[this.props.data.state.tab][this.state.selectedMenu][this.props.data.state.subTab].push(rowToWorkWith);
        }
        else if (this.props.data.state.subTab == 'events') {
            data[this.props.data.state.tab][this.state.selectedMenu][this.props.data.state.subTab].push(rowToWorkWith);
        }
        else if ('call' in rowToWorkWith) {
            rowToWorkWith.call = this.state.newTrigger;
            data[this.props.data.state.tab][this.state.selectedMenu].push(rowToWorkWith);
        }
        this.props.callback.updateNative('data', data);
        this.setState({ newTrigger: '' });
    };
    handleDrag = (val) => {
        this.setState({ inDropBox: val });
    };
    handleChange = (event) => {
        this.setState({ selectedValue: event.target.value });
    };
    renameMenu = ({ value }) => {
        if (!value) {
            this.setState({ openRenamePopup: false, newTrigger: '' });
            return;
        }
        if (value) {
            this.setState({ openRenamePopup: false });
            this.handleOnDrop();
            return;
        }
        this.setState({ newTrigger: value });
    };
    render() {
        return (react_1.default.createElement("div", { className: "dropbox__content_wrapper" },
            react_1.default.createElement("div", { className: "dropbox__content" },
                react_1.default.createElement("p", null, this.state.isOK),
                react_1.default.createElement(select_1.default, { options: this.state.menuList, selected: this.state.selectedMenu, id: "selectedMenu", callback: ({ val }) => this.setState({ selectedMenu: val }), placeholder: adapter_react_v5_1.I18n.t('selectTargetMenu') }),
                react_1.default.createElement("label", null,
                    react_1.default.createElement(material_1.Radio, { checked: this.state.selectedValue === 'move', onChange: this.handleChange, value: "move", name: "radio-buttons", inputProps: { 'aria-label': 'A' } }),
                    adapter_react_v5_1.I18n.t('Move')),
                react_1.default.createElement("label", null,
                    react_1.default.createElement(material_1.Radio, { checked: this.state.selectedValue === 'copy', onChange: this.handleChange, value: "copy", name: "radio-buttons", inputProps: { 'aria-label': 'B' } }),
                    adapter_react_v5_1.I18n.t('Copy')),
                react_1.default.createElement("div", { className: "dropbox__drag_in_field", draggable: true, onDrop: () => this.handleOnDrop(), onDragOver: (event) => DropBox.handleDragOver(event), onDragEnter: () => this.handleDrag(true), onDragLeave: () => this.handleDrag(false) },
                    react_1.default.createElement("p", { className: "DropBox-Header" }, "Drop here!!!"),
                    react_1.default.createElement("p", { className: "DropBox-Content" }, adapter_react_v5_1.I18n.t('selectAMenuDropBox')))),
            this.state.openRenamePopup ? (react_1.default.createElement("div", { className: "dropbox__dialog_rename-wrapper" },
                react_1.default.createElement(PopupContainer_1.default, { title: adapter_react_v5_1.I18n.t('Rename trigger'), value: this.state.trigger, callback: this.renameMenu, class: "dropbox__dialog_rename-card", isOK: this.state.isOK },
                    react_1.default.createElement(RenameCard_1.default, { callback: { setState: this.setState.bind(this) }, id: "newTrigger", value: this.state.newTrigger })))) : null));
    }
}
exports.default = DropBox;
//# sourceMappingURL=AppDropBoxContent.js.map
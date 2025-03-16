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
const material_1 = require("@mui/material");
const react_1 = __importStar(require("react"));
const checkbox_1 = __importDefault(require("../components/btn-Input/checkbox"));
const AppContentHeaderTelegramUsersUserCard_1 = __importDefault(require("./AppContentHeaderTelegramUsersUserCard"));
const AppContentHeaderTelegramUsersErrorMessage_1 = __importDefault(require("./AppContentHeaderTelegramUsersErrorMessage"));
const CoverSaveBtn_1 = __importDefault(require("@components/CoverSaveBtn"));
class HeaderTelegramUsers extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            errorUserChecked: false,
            menuChecked: false,
        };
    }
    componentDidUpdate = (prevProps) => {
        if (prevProps.data.usersInGroup !== this.props.data.usersInGroup) {
            this.checkUserSelection();
        }
        if (prevProps.data.activeMenu !== this.props.data.activeMenu) {
            this.setState({ menuChecked: this.props.data.userActiveCheckbox[this.props.data.activeMenu] });
        }
    };
    menuActiveChecked = () => {
        return this.props.data.userActiveCheckbox[this.props.data.activeMenu];
    };
    clickCheckbox = ({ isChecked }) => {
        if (isChecked) {
            if (!this.checkUserSelection(true)) {
                return;
            }
        }
        else {
            this.setState({ errorUserChecked: false });
        }
        this.setState({ menuChecked: isChecked });
        this.props.callback.updateNative(`userActiveCheckbox.${this.props.data.activeMenu}`, isChecked);
    };
    checkUserSelection = (val) => {
        const usersInGroup = this.props.data.usersInGroup;
        if (this.state.menuChecked || val) {
            if (this.isMinOneUserChecked(usersInGroup)) {
                if (!HeaderTelegramUsers.checkUsersAreActiveInTelegram(usersInGroup[this.props.data.activeMenu], this.props.data.state.native?.userListWithChatID)) {
                    this.setState({ errorUserChecked: true });
                    return false;
                }
                return true;
            }
        }
        return false;
    };
    static checkUsersAreActiveInTelegram(activeGroup, userListWithChatID) {
        for (const user of activeGroup) {
            if (HeaderTelegramUsers.isUserActiveInTelegram(user, userListWithChatID)) {
                return true;
            }
        }
        return false;
    }
    isMinOneUserChecked(usersInGroup) {
        return usersInGroup[this.props.data.activeMenu]?.length > 0;
    }
    static isUserActiveInTelegram(user, userListWithChatID) {
        return userListWithChatID.some(item => item.name === user);
    }
    isUserGroupLength() {
        return Object.keys(this.props.data.usersInGroup).length !== 0;
    }
    render() {
        return (react_1.default.createElement(material_1.Grid2, { container: true },
            react_1.default.createElement(material_1.Grid2, { size: 12 },
                react_1.default.createElement("div", { className: "telegram__users-container" }, this.props.data.menuOpen && this.isUserGroupLength() ? (react_1.default.createElement("div", { className: "telegram__user-cards" },
                    react_1.default.createElement("div", null,
                        react_1.default.createElement("p", null, this.state.errorUserChecked ? (react_1.default.createElement(AppContentHeaderTelegramUsersErrorMessage_1.default, null)) : null),
                        this.props.data.state.native?.userListWithChatID.map((user, key) => {
                            return (react_1.default.createElement(AppContentHeaderTelegramUsersUserCard_1.default, { user: user, key: key, callback: this.props.callback, data: this.props.data, setState: this.setState.bind(this) }));
                        })),
                    this.props.data.state.activeMenu != undefined ? (react_1.default.createElement("div", { className: "telegramm__users-active-group" },
                        react_1.default.createElement(checkbox_1.default, { label: `${this.props.data.state.activeMenu} ${adapter_react_v5_1.I18n.t('active')}`, id: "checkboxActiveMenu", isChecked: this.menuActiveChecked() || false, callback: this.clickCheckbox, index: 0 }))) : null)) : null)),
            this.state.errorUserChecked ? react_1.default.createElement(CoverSaveBtn_1.default, null) : null));
    }
}
exports.default = HeaderTelegramUsers;
//# sourceMappingURL=AppContentHeaderTelegramUsers.js.map
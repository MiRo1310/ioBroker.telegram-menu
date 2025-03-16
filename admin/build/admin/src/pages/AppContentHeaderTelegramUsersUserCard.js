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
const checkbox_1 = __importDefault(require("../components/btn-Input/checkbox"));
class AppContentHeaderTelegramUsersUserCard extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            usersInGroup: this.props.data.usersInGroup,
            name: this.props.user.name,
            activeMenu: this.props.data.state.activeMenu,
        };
    }
    componentDidUpdate = () => {
        if (this.props.data.usersInGroup !== this.state.usersInGroup) {
            this.setState({ usersInGroup: this.props.data.usersInGroup });
        }
        if (this.props.data.state.activeMenu !== this.state.activeMenu) {
            this.setState({ activeMenu: this.props.data.state.activeMenu });
        }
    };
    isUserChecked = () => {
        if (!this.props.data.usersInGroup || !this.props.data.usersInGroup[this.state.activeMenu]) {
            return false;
        }
        return this.isUserInList();
    };
    isUserInList() {
        if (!this.state.activeMenu || this.props.data.usersInGroup[this.state.activeMenu].length == 0) {
            return false;
        }
        return this.props.data.usersInGroup[this.state.activeMenu].includes(this.props.user.name);
    }
    checkboxClicked = ({ isChecked, id: name }) => {
        if (isChecked) {
            this.props.setState({ errorUserChecked: false });
        }
        const listOfUsers = [...this.props.data.usersInGroup[this.state.activeMenu]];
        if (isChecked && !listOfUsers.includes(name)) {
            listOfUsers.push(name);
        }
        else {
            const index = listOfUsers.indexOf(name);
            if (index > -1) {
                listOfUsers.splice(index, 1);
            }
        }
        this.props.callback.updateNative(`usersInGroup.${this.state.activeMenu}`, listOfUsers);
    };
    render() {
        const { name, chatID } = this.props.user;
        return (react_1.default.createElement("div", { className: "telegramm__user-content" },
            react_1.default.createElement("div", { className: "telegram__user" },
                react_1.default.createElement("p", { className: "telegram__user-name" }, name),
                react_1.default.createElement("p", { className: "telegram__user-chat-id" },
                    "ChatID :",
                    react_1.default.createElement("span", { className: "telegram__user-chat-id" }, chatID)),
                react_1.default.createElement("div", { className: "telegram__user-checkbox" },
                    react_1.default.createElement(checkbox_1.default, { id: name, callback: this.checkboxClicked.bind(this), isChecked: this.isUserChecked(), index: 0 })))));
    }
}
exports.default = AppContentHeaderTelegramUsersUserCard;
//# sourceMappingURL=AppContentHeaderTelegramUsersUserCard.js.map
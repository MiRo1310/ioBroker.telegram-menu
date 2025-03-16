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
const Button_1 = __importDefault(require("@components/Button"));
class MenuPopupCard extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    componentDidUpdate(prevProps) {
        if (prevProps.usersInGroup !== this.props.usersInGroup) {
            this.menuList = Object.keys(this.props.usersInGroup);
        }
    }
    secondCallback = () => {
        this.props.callback.setStateApp({ showPopupMenuList: false });
    };
    menuList = Object.keys(this.props.usersInGroup);
    render() {
        return (react_1.default.createElement("div", { className: "menu__list_popup" }, this.menuList.map((menu, index) => {
            return (react_1.default.createElement(Button_1.default, { key: index, b_color: "#fff", id: "activeMenu", callback: ({ id, innerText }) => {
                    this.props.callback.setStateApp({ [id]: innerText });
                    this.secondCallback();
                }, callbackValue: "event.target.innerText", className: "button__menu button__primary button" }, menu));
        })));
    }
}
exports.default = MenuPopupCard;
//# sourceMappingURL=AppContentHeaderMenuList.js.map
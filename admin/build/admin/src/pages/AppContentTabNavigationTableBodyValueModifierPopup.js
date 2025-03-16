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
const PopupContainer_1 = __importDefault(require("@components/popupCards/PopupContainer"));
const adapter_react_v5_1 = require("@iobroker/adapter-react-v5");
class AppContentTabNavigationTableBodyValueModifierPopup extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            description: null,
        };
    }
    componentDidMount() {
        console.log('mount');
        console.log(this.getDescription());
        this.setState({ description: this.getDescription() });
    }
    componentDidUpdate(prevProps) {
        if (prevProps.clickedTrigger !== this.props.clickedTrigger) {
            this.setState({ description: this.getDescription() });
        }
    }
    getDescription = () => {
        const clickedTrigger = this.props.clickedTrigger;
        if (!clickedTrigger) {
            return null;
        }
        return this.props.data.state.native.description.find(element => element.call === clickedTrigger)?.description;
    };
    render() {
        return (react_1.default.createElement(PopupContainer_1.default, { onlyCloseBtn: true, title: adapter_react_v5_1.I18n.t('info'), height: '30%', width: '600px', callback: this.props.callback },
            react_1.default.createElement("p", { className: 'flex justify-center text-lg' }, adapter_react_v5_1.I18n.t('menuCannotBeFound')),
            this.state.description ? (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement("p", { className: 'popup__description_header' }, adapter_react_v5_1.I18n.t('description')),
                react_1.default.createElement("div", { className: 'popup__description' }, this.state.description))) : (react_1.default.createElement("p", { className: 'text-center' }, adapter_react_v5_1.I18n.t('contactDeveloperForExistingMenu')))));
    }
}
exports.default = AppContentTabNavigationTableBodyValueModifierPopup;
//# sourceMappingURL=AppContentTabNavigationTableBodyValueModifierPopup.js.map
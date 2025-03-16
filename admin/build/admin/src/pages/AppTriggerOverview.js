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
const PopupContainer_1 = __importDefault(require("@/components/popupCards/PopupContainer"));
const AppTriggerOverviewContent_1 = __importDefault(require("@/pages/AppTriggerOverviewContent"));
class MainTriggerOverview extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (react_1.default.createElement(PopupContainer_1.default, { title: "Trigger Info", width: "99%", height: "99%", top: "50%", class: "TriggerOverview-PopupContainer", onlyCloseBtn: true, callback: ({ value }) => this.props.callback.setState({ showTriggerInfo: value }) },
            react_1.default.createElement(AppTriggerOverviewContent_1.default, { usersInGroup: this.props.state.native.usersInGroup, userActiveCheckbox: this.props.state.native.userActiveCheckbox, data: this.props.state.native.data })));
    }
}
exports.default = MainTriggerOverview;
//# sourceMappingURL=AppTriggerOverview.js.map
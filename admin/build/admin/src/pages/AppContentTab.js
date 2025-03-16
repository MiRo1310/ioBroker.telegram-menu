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
const entries_1 = require("@/config/entries");
const AppContentTabAction_1 = __importDefault(require("@/pages/AppContentTabAction"));
const AppContentTabNavigation_1 = __importDefault(require("@/pages/AppContentTabNavigation"));
const AppContentTabSettings_1 = __importDefault(require("@/pages/AppContentTabSettings"));
const lab_1 = require("@mui/lab");
const react_1 = __importStar(require("react"));
const AppContentTabDescripton_1 = __importDefault(require("@/pages/AppContentTabDescripton"));
class Tabs extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(lab_1.TabPanel, { value: "nav" },
                react_1.default.createElement(AppContentTabNavigation_1.default, { data: { ...this.props.data, entries: entries_1.navEntries }, callback: this.props.callback })),
            react_1.default.createElement(lab_1.TabPanel, { value: "action", className: "tabAction" },
                react_1.default.createElement(AppContentTabAction_1.default, { data: this.props.data, callback: this.props.callback })),
            react_1.default.createElement(lab_1.TabPanel, { value: "description", className: "tabAction" },
                react_1.default.createElement(AppContentTabDescripton_1.default, { data: this.props.data, callback: this.props.callback })),
            react_1.default.createElement(lab_1.TabPanel, { value: "settings" },
                react_1.default.createElement(AppContentTabSettings_1.default, { data: this.props.data, callback: this.props.callback }))));
    }
}
exports.default = Tabs;
//# sourceMappingURL=AppContentTab.js.map
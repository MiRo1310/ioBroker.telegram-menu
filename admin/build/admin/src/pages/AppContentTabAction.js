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
const lab_1 = require("@mui/lab");
const AppContentTabActionContent_1 = __importDefault(require("./AppContentTabActionContent"));
const entries_1 = require("@/config/entries");
class TabAction extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: 'set',
        };
    }
    componentDidMount() {
        this.setState({ value: this.props.data.state.subTab });
    }
    componentDidUpdate(prevProps) {
        if (prevProps.data.state.subTab !== this.props.data.state.subTab) {
            this.setState({ value: this.props.data.state.subTab });
        }
    }
    render() {
        return (react_1.default.createElement(lab_1.TabContext, { value: this.state.value }, entries_1.tabValues.map((tab, index) => (react_1.default.createElement(lab_1.TabPanel, { key: index, value: tab.value, className: "tab__action" },
            react_1.default.createElement(AppContentTabActionContent_1.default, { callback: this.props.callback, data: {
                    ...this.props.data,
                    tab,
                    card: 'action',
                    showButtons: { add: true, remove: true, edit: true },
                } }))))));
    }
}
exports.default = TabAction;
//# sourceMappingURL=AppContentTabAction.js.map
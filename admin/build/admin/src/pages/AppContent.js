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
const AppContentHeader_1 = __importDefault(require("@/pages/AppContentHeader"));
const AppContentTab_1 = __importDefault(require("@/pages/AppContentTab"));
const AppContentNavigation_1 = __importDefault(require("@/pages/AppContentNavigation"));
const lab_1 = require("@mui/lab");
const material_1 = require("@mui/material");
const react_1 = __importStar(require("react"));
class AppContent extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (react_1.default.createElement(material_1.Grid2, { size: 12, className: "app__content" },
            react_1.default.createElement(material_1.Box, { component: "div", sx: { width: '100%', typography: 'body1' }, className: "app__box" },
                react_1.default.createElement(lab_1.TabContext, { value: this.props.data.state.tab },
                    react_1.default.createElement(AppContentNavigation_1.default, { callback: this.props.callback, data: this.props.data }),
                    react_1.default.createElement(AppContentHeader_1.default, { data: this.props.data, callback: this.props.callback }),
                    react_1.default.createElement(AppContentTab_1.default, { callback: this.props.callback, data: this.props.data })))));
    }
}
exports.default = AppContent;
//# sourceMappingURL=AppContent.js.map
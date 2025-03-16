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
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const adapter_react_v5_1 = require("@iobroker/adapter-react-v5");
const material_1 = require("@mui/material");
class AppHeaderIconBar extends react_1.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (react_1.default.createElement(material_1.Grid2, { size: 12 },
            react_1.default.createElement("form", { className: "header__icons" },
                react_1.default.createElement(adapter_react_v5_1.Logo, { instance: this.props.instance, common: this.props.common, native: this.props.native, onError: text => this.setState({ errorText: text }), onLoad: this.props.onLoad }))));
    }
}
exports.default = AppHeaderIconBar;
//# sourceMappingURL=AppHeaderIconBar.js.map
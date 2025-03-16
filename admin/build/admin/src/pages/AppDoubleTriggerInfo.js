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
class DoubleTriggerInfo extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (react_1.default.createElement("div", { className: "error__container-double_trigger" },
            react_1.default.createElement("p", { className: "error__header" }, adapter_react_v5_1.I18n.t('doubleTrigger')),
            this.props.state.doubleTrigger.map((element, index) => (react_1.default.createElement("p", { className: "Error-Items", key: index }, element)))));
    }
}
exports.default = DoubleTriggerInfo;
//# sourceMappingURL=AppDoubleTriggerInfo.js.map
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
const AppDropBoxContent_1 = __importDefault(require("@/pages/AppDropBoxContent"));
const movePosition_1 = require("@/lib/movePosition");
class MainDropBox extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    closeDropBox = () => {
        this.props.callback.setStateApp({ showDropBox: false });
    };
    render() {
        return (react_1.default.createElement(PopupContainer_1.default, { class: "dropbox__container", reference: this.props.data.dropBoxRef, width: "99%", height: "25%", title: "DropBox", callback: this.closeDropBox, onlyCloseBtn: true, drag: "true", onDragStart: movePosition_1.onDragStart, onDragEnd: movePosition_1.onDragEnd, onDragOver: movePosition_1.onDragOver, onDrop: movePosition_1.onDrop, onDrag: movePosition_1.onDrag, onMouseEnter: movePosition_1.onMouseEnter, onMouseLeave: movePosition_1.onMouseLeave, setState: this.props.callback.setStateApp },
            react_1.default.createElement(AppDropBoxContent_1.default, { data: this.props.data, index: this.props.data.state.draggingRowIndex, callback: this.props.callback })));
    }
}
exports.default = MainDropBox;
//# sourceMappingURL=AppDropBox.js.map
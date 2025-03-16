"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BtnCircleAdd = void 0;
const react_1 = __importDefault(require("react"));
const BtnCircleAdd = (props) => {
    const clickHandler = () => {
        props.callback();
    };
    return (react_1.default.createElement("div", { className: "btn__circle_add" },
        react_1.default.createElement("a", { onClick: clickHandler },
            react_1.default.createElement("i", { className: "material-icons" }, "add_circle"))));
};
exports.BtnCircleAdd = BtnCircleAdd;
//# sourceMappingURL=btn-circle-add.js.map
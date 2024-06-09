"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.error = exports.debug = exports.info = void 0;
const main_1 = __importDefault(require("@backend/main"));
[];
const logging = (type, obj) => {
    const _this = main_1.default.getInstance();
    if (obj) {
        obj.forEach((element) => {
            let text = "";
            if (element.text) {
                text = element.text;
            }
            if (element.val) {
                text += " " + JSON.stringify(element.val);
            }
            _this.log[type](text);
        });
        return;
    }
};
const info = (obj) => {
    logging("info", obj);
};
exports.info = info;
const debug = (obj) => {
    logging("debug", obj);
};
exports.debug = debug;
const error = (obj) => {
    logging("error", obj);
};
exports.error = error;
//# sourceMappingURL=logging.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOneLineValue = void 0;
const config_1 = require("../config/config");
const checkOneLineValue = (text) => !text.includes(config_1.config.rowSplitter) ? `${text} ${config_1.config.rowSplitter}` : text;
exports.checkOneLineValue = checkOneLineValue;
//# sourceMappingURL=appUtils.js.map
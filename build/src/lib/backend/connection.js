"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIsTelegramActive = void 0;
const main_1 = __importDefault(require("../..//main"));
const logging_1 = require("./logging");
const checkIsTelegramActive = async (dataPoint) => {
    const _this = main_1.default.getInstance();
    _this.setState("info.connection", false, true);
    const telegramInfoConnection = await _this.getForeignStateAsync(dataPoint);
    (0, logging_1.debug)([{ text: "Telegram Info Connection: ", val: telegramInfoConnection?.val }]);
    if (telegramInfoConnection?.val) {
        _this.setState("info.connection", telegramInfoConnection?.val, true);
    }
    if (!telegramInfoConnection?.val) {
        (0, logging_1.info)([{ text: "Telegram was found, but is not running. Please start!" }]);
    }
    return telegramInfoConnection?.val ? true : false;
};
exports.checkIsTelegramActive = checkIsTelegramActive;
//# sourceMappingURL=connection.js.map
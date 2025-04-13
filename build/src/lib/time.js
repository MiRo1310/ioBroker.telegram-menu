"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.integrateTimeIntoText = exports.toLocaleDate = void 0;
const config_1 = require("../config/config");
const toLocaleDate = (ts) => {
    return ts.toLocaleDateString(config_1.defaultLocale, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: config_1.timezone,
    });
};
exports.toLocaleDate = toLocaleDate;
const integrateTimeIntoText = (text, val) => {
    if (!val) {
        return text.replace(config_1.config.time, '"Invalid Date"');
    }
    const date = new Date(Number(String(val)));
    return text.replace(config_1.config.time, isNaN(date.getTime()) ? '"Invalid Date"' : (0, exports.toLocaleDate)(date));
};
exports.integrateTimeIntoText = integrateTimeIntoText;
//# sourceMappingURL=time.js.map
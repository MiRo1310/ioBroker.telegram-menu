"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.integrateTimeIntoText = exports.toLocaleDate = void 0;
exports.extractTimeValues = extractTimeValues;
exports.getTimeWithPad = getTimeWithPad;
const config_1 = require("../config/config");
const string_1 = require("./string");
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
function extractTimeValues(unixTimestamp) {
    const date = new Date(unixTimestamp); //https://it-tools.tech/date-converter
    const milliseconds = date.getMilliseconds();
    const seconds = date.getSeconds();
    const minutes = date.getMinutes();
    const hours = date.getHours();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return { milliseconds, seconds, minutes, hours, day, month, year };
}
function getTimeWithPad({ milliseconds, seconds, day, minutes, year, month, hours, }) {
    return {
        ms: (0, string_1.pad)(milliseconds, 3),
        s: (0, string_1.pad)(seconds),
        m: (0, string_1.pad)(minutes),
        h: (0, string_1.pad)(hours),
        d: (0, string_1.pad)(day),
        mo: (0, string_1.pad)(month),
        y: year.toString(),
    };
}
//# sourceMappingURL=time.js.map
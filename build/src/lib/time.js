"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.integrateTimeIntoText = exports.toLocaleDate = void 0;
exports.extractTimeValues = extractTimeValues;
exports.getTimeWithPad = getTimeWithPad;
const config_1 = require("../config/config");
const string_1 = require("./string");
const toLocaleDate = (ts, options) => {
    return ts.toLocaleDateString(options?.locale ?? config_1.defaultLocale, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: options?.tz ?? config_1.timezone,
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
function extractTimeValues(tsInMs) {
    if (isNaN(tsInMs) || tsInMs < 0) {
        return { milliseconds: NaN, seconds: NaN, minutes: NaN, hours: NaN, day: NaN, month: NaN, year: NaN };
    }
    const date = new Date(tsInMs); //https://it-tools.tech/date-converter
    const milliseconds = date.getMilliseconds();
    const seconds = date.getSeconds();
    const minutes = date.getMinutes();
    const hours = Number(new Intl.DateTimeFormat(config_1.defaultLocale, {
        hour: '2-digit',
        hour12: false,
        timeZone: config_1.timezone,
    })
        .formatToParts(new Date(tsInMs))
        .find(part => part.type === 'hour')?.value);
    const day = Number(date.toLocaleString(config_1.defaultLocale, { day: '2-digit' }));
    const month = Number(date.toLocaleString(config_1.defaultLocale, { month: '2-digit' }));
    const year = Number(date.toLocaleString(config_1.defaultLocale, { year: 'numeric' }));
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
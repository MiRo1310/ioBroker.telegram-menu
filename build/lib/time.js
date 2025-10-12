"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.integrateTimeIntoText = exports.toLocaleDate = void 0;
exports.extractTimeValues = extractTimeValues;
exports.getTimeWithPad = getTimeWithPad;
const config_1 = require("../config/config");
const string_1 = require("../lib/string");
/**
 * Convert timestamp to local date string
 *
 * @param ts
 * @param options
 *
 * Unit Test
 */
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
/**
 * Integrate time into text
 *
 * @param text Text with placeholder where time should be integrated
 * @param val Timestamp in milliseconds
 *
 * Unit Test
 */
const integrateTimeIntoText = (text, val) => {
    if (!val) {
        return text.replace(config_1.config.time, '"Invalid Date"');
    }
    const date = new Date(Number(String(val)));
    return text.replace(config_1.config.time, isNaN(date.getTime()) ? '"Invalid Date"' : (0, exports.toLocaleDate)(date));
};
exports.integrateTimeIntoText = integrateTimeIntoText;
/**
 * Extract time values from timestamp
 *
 * @param tsInMs Timestamp in milliseconds
 *
 * Unit Test
 */
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
/**
 * Get time values with leading zeros
 * => 1 becomes 01
 *
 * @param root0 Object with time values
 * @param root0.milliseconds Milliseconds
 * @param root0.seconds Seconds
 * @param root0.day Day
 * @param root0.minutes Minutes
 * @param root0.year Year
 * @param root0.month Month
 * @param root0.hours Hours
 *
 * Unit Test
 */
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
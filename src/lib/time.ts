import { config, defaultLocale, timezone } from '../config/config';
import type { ExtractTimeValues, GetTimeWithPad } from '../types/types';
import { pad } from './string';

/**
 * Convert timestamp to local date string
 *
 * @param ts
 * @param options
 *
 * Unit Test
 */

export const toLocaleDate = (ts: Date, options?: { locale?: string; tz?: string }): string => {
    return ts.toLocaleDateString(options?.locale ?? defaultLocale, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: options?.tz ?? timezone,
    });
};

/**
 * Integrate time into text
 *
 * @param text Text with placeholder where time should be integrated
 * @param val Timestamp in milliseconds
 *
 * Unit Test
 */
export const integrateTimeIntoText = (text: string, val?: ioBroker.StateValue): string => {
    if (!val) {
        return text.replace(config.time, '"Invalid Date"');
    }
    const date = new Date(Number(String(val)));

    return text.replace(config.time, isNaN(date.getTime()) ? '"Invalid Date"' : toLocaleDate(date));
};

/**
 * Extract time values from timestamp
 *
 * @param tsInMs Timestamp in milliseconds
 *
 * Unit Test
 */
export function extractTimeValues(tsInMs: number): ExtractTimeValues {
    if (isNaN(tsInMs) || tsInMs < 0) {
        return { milliseconds: NaN, seconds: NaN, minutes: NaN, hours: NaN, day: NaN, month: NaN, year: NaN };
    }
    const date = new Date(tsInMs); //https://it-tools.tech/date-converter
    const milliseconds = date.getMilliseconds();
    const seconds = date.getSeconds();
    const minutes = date.getMinutes();
    const hours = Number(
        new Intl.DateTimeFormat(defaultLocale, {
            hour: '2-digit',
            hour12: false,
            timeZone: timezone,
        })
            .formatToParts(new Date(tsInMs))
            .find(part => part.type === 'hour')?.value,
    );
    const day = Number(date.toLocaleString(defaultLocale, { day: '2-digit' }));
    const month = Number(date.toLocaleString(defaultLocale, { month: '2-digit' }));
    const year = Number(date.toLocaleString(defaultLocale, { year: 'numeric' }));
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
export function getTimeWithPad({
    milliseconds,
    seconds,
    day,
    minutes,
    year,
    month,
    hours,
}: ExtractTimeValues): GetTimeWithPad {
    return {
        ms: pad(milliseconds, 3),
        s: pad(seconds),
        m: pad(minutes),
        h: pad(hours),
        d: pad(day),
        mo: pad(month),
        y: year.toString(),
    };
}

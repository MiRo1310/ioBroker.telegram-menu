import { config, defaultLocale, timezone } from '../config/config';
import type { ExtractTimeValues, GetTimeWithPad } from '../types/types';
import { pad } from './string';

export const toLocaleDate = (ts: Date): string => {
    return ts.toLocaleDateString(defaultLocale, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: timezone,
    });
};

export const integrateTimeIntoText = (text: string, val?: ioBroker.StateValue): string => {
    if (!val) {
        return text.replace(config.time, '"Invalid Date"');
    }
    const date = new Date(Number(String(val)));

    return text.replace(config.time, isNaN(date.getTime()) ? '"Invalid Date"' : toLocaleDate(date));
};

export function extractTimeValues(unixTimestamp: number): ExtractTimeValues {
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

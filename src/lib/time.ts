import { config, defaultLocale, timezone } from '../config/config';

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

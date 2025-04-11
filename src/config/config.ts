export const defaultLocale = 'de-DE';
export const timezone = 'Europe/Berlin';

export const config = {
    replacer: {
        time: '{time}',
        change: {
            start: 'change{',
            end: '}',
            command: 'change',
        },
    },
};

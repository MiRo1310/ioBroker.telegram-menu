export const defaultLocale = 'de-DE';
export const timezone = 'Europe/Berlin';
export const defaultTelegramInstance = 'telegram.0';

export const config = {
    time: '{time}',
    change: {
        start: 'change{',
        end: '}',
        command: 'change',
    },
    rowSplitter: '&&',
    math: {
        start: '{math:',
        end: '}',
    },
    round: {
        start: '{round:',
        end: '}',
    },
    timestamp: {
        start: '{time.',
        end: '}',
        lc: '{time.lc',
        ts: '{time.ts',
    },
    status: {
        start: '{status:',
        end: '}',
        oldWithId: "'id':",
    },
    set: {
        start: '{set:',
        end: '}',
    },
    json: {
        start: '{json',
        end: '}',
        textTable: 'TextTable',
    },
    binding: {
        start: 'binding:',
    },
    functionSelektor: 'functions=',
};

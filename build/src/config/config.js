"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.defaultTelegramInstance = exports.timezone = exports.defaultLocale = void 0;
exports.defaultLocale = 'de-DE';
exports.timezone = 'Europe/Berlin';
exports.defaultTelegramInstance = 'telegram.0';
exports.config = {
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
};
//# sourceMappingURL=config.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.timezone = exports.defaultLocale = void 0;
exports.defaultLocale = 'de-DE';
exports.timezone = 'Europe/Berlin';
exports.config = {
    replacer: {
        time: '{time}',
        change: {
            start: 'change{',
            end: '}',
            command: 'change',
        },
    },
};
//# sourceMappingURL=config.js.map
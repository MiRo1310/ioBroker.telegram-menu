"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "__esModule", { value: true });
exports.processTimeValue = exports.toLocaleDate = void 0;
const main_1 = require("../main");
const toLocaleDate = (time) => {
    return time.toLocaleDateString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });
};
exports.toLocaleDate = toLocaleDate;
const processTimeValue = (textToSend, obj) => {
    const date = new Date(Number(obj.val));
    if (isNaN(date.getTime())) {
        main_1._this.log.error(`Invalid Date: ${String(date)}`);
        return textToSend;
    }
    return textToSend.replace('{time}', (0, exports.toLocaleDate)(date));
};
exports.processTimeValue = processTimeValue;

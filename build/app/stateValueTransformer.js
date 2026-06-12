"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateValueTransformer = void 0;
const config_1 = require("../config/config");
const utilities_1 = require("../lib/utilities");
const time_1 = require("../lib/time");
const appUtils_1 = require("../lib/appUtils");
const string_1 = require("../lib/string");
class StateValueTransformer {
    appContext;
    text;
    stateVal;
    originalStaleVal;
    constructor(text, stateVal, appContext) {
        this.appContext = appContext;
        this.text = text;
        this.stateVal = stateVal;
        this.originalStaleVal = stateVal;
    }
    async applyTimestamp(id) {
        if (this.text.includes(config_1.config.timestamp.ts) || this.text.includes(config_1.config.timestamp.lc)) {
            this.text = await (0, utilities_1.getTimeValue)(this.appContext, this.text, id);
            this.stateVal = '';
        }
    }
    applyTime() {
        if (this.text.includes(config_1.config.time)) {
            this.text = (0, time_1.integrateTimeIntoText)(this.text, this.originalStaleVal);
            this.stateVal = '';
        }
    }
    applyMath() {
        const { textToSend, calculated, error } = (0, appUtils_1.mathFunction)(this.text, this.stateVal, this.appContext.adapter);
        if (!error) {
            this.text = textToSend;
            this.stateVal = calculated;
            this.appContext.adapter.log.debug(`textToSend : ${this.text} val : ${this.stateVal}`);
        }
    }
    applyRound() {
        if (!this.text.includes(config_1.config.round.start)) {
            return;
        }
        const { error, text, roundedValue } = (0, appUtils_1.roundValue)(String(this.stateVal), this.text);
        if (!error) {
            this.appContext.adapter.log.debug(`Rounded from ${(0, string_1.jsonString)(this.stateVal)} to ${(0, string_1.jsonString)(roundedValue)}`);
            this.stateVal = roundedValue;
            this.text = text;
        }
    }
}
exports.StateValueTransformer = StateValueTransformer;
//# sourceMappingURL=stateValueTransformer.js.map
import { config } from '@backend/config/config';
import { getTimeValue } from '@backend/lib/utilities';
import { integrateTimeIntoText } from '@backend/lib/time';
import { mathFunction, roundValue } from '@backend/lib/appUtils';
import { jsonString } from '@backend/lib/string';
import type { AppContext } from '@backend/app/appContext';

export class StateValueTransformer {
    text: string;
    stateVal: string;
    private readonly originalStaleVal: string;

    constructor(
        text: string,
        stateVal: string,
        private readonly appContext: AppContext,
    ) {
        this.text = text;
        this.stateVal = stateVal;
        this.originalStaleVal = stateVal;
    }

    async applyTimestamp(id: string): Promise<void> {
        if (this.text.includes(config.timestamp.ts) || this.text.includes(config.timestamp.lc)) {
            this.text = await getTimeValue(this.appContext, this.text, id);
            this.stateVal = '';
        }
    }

    applyTime(): void {
        if (this.text.includes(config.time)) {
            this.text = integrateTimeIntoText(this.text, this.originalStaleVal);
            this.stateVal = '';
        }
    }

    applyMath(): void {
        const { textToSend, calculated, error } = mathFunction(this.text, this.stateVal, this.appContext.adapter);
        if (!error) {
            this.text = textToSend;
            this.stateVal = calculated;
            this.appContext.adapter.log.debug(`textToSend : ${this.text} val : ${this.stateVal}`);
        }
    }

    applyRound(): void {
        if (!this.text.includes(config.round.start)) {
            return;
        }
        const { error, text, roundedValue } = roundValue(String(this.stateVal), this.text);
        if (!error) {
            this.appContext.adapter.log.debug(
                `Rounded from ${jsonString(this.stateVal)} to ${jsonString(roundedValue)}`,
            );
            this.stateVal = roundedValue;
            this.text = text;
        }
    }
}

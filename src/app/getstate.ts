import { sendToTelegram, sendToTelegramSubmenu } from './telegram';
import { bindingFunc, idBySelector } from './action';
import { createKeyboardFromJson, createTextTableFromJson } from './jsonTable';
import { processTimeIdLc } from '../lib/utilities';
import { isDefined } from '../lib/utils';
import { adapter } from '../main';
import type { Part, TelegramParams } from '../types/types';
import { integrateTimeIntoText } from '../lib/time';
import { cleanUpString, decomposeText, getNewline, getValueToExchange, jsonString } from '../lib/string';
import { calcValue, roundValue } from '../lib/appUtils';
import { config } from '../config/config';
import { errorLogger } from './logging';

function isLastElement(i: number, array: unknown[] | undefined): boolean {
    return i == array?.length;
}

export function getState(part: Part, userToSend: string, telegramParams: TelegramParams): void {
    try {
        const parse_mode = part.getData?.[0].parse_mode; // Parse Mode ist nur immer im ersten Element
        const valueArrayForCorrectOrder: string[] = [];
        part.getData?.forEach(async ({ newline, text, id }, index) => {
            adapter.log.debug(`Get Value ID: ${id}`);

            if (id.includes(config.functionSelektor)) {
                await idBySelector({
                    selector: id,
                    text,
                    userToSend,
                    newline,
                    telegramParams,
                });
                return;
            }

            if (text.includes(config.binding.start)) {
                await bindingFunc(text, userToSend, telegramParams, parse_mode);
                return;
            }

            const state = await adapter.getForeignStateAsync(id);

            if (!isDefined(state)) {
                adapter.log.error('The state is empty!');
                return;
            }

            const stateValue = cleanUpString(state.val?.toString());

            let modifiedStateVal = stateValue;
            let modifiedTextToSend = text;

            if (text.includes(config.timestamp.ts) || text.includes(config.timestamp.lc)) {
                modifiedTextToSend = await processTimeIdLc(text, id);
                modifiedStateVal = '';
            }

            if (modifiedTextToSend.includes(config.time)) {
                modifiedTextToSend = integrateTimeIntoText(modifiedTextToSend, stateValue);
                modifiedStateVal = '';
            }

            if (modifiedTextToSend.includes(config.math.start)) {
                const { textToSend, calculated, error } = calcValue(modifiedTextToSend, modifiedStateVal, adapter);
                if (!error) {
                    modifiedTextToSend = textToSend;
                    modifiedStateVal = calculated;

                    adapter.log.debug(`TextToSend: ${modifiedTextToSend} val: ${modifiedStateVal}`);
                }
            }

            if (modifiedTextToSend.includes(config.round.start)) {
                const { error, text, roundedValue } = roundValue(String(modifiedStateVal), modifiedTextToSend);
                if (!error) {
                    adapter.log.debug(`Rounded from ${jsonString(modifiedStateVal)} to ${jsonString(roundedValue)}`);
                    modifiedStateVal = roundedValue;
                    modifiedTextToSend = text;
                }
            }

            if (modifiedTextToSend.includes(config.json.start)) {
                const { substring } = decomposeText(modifiedTextToSend, config.json.start, config.json.end);

                if (substring.includes(config.json.textTable)) {
                    const result = createTextTableFromJson(stateValue, modifiedTextToSend);
                    if (result) {
                        await sendToTelegram({
                            userToSend,
                            textToSend: result,
                            telegramParams,
                            parse_mode,
                        });
                        return;
                    }
                    adapter.log.debug('Cannot create a Text-Table');
                } else {
                    const result = createKeyboardFromJson(stateValue, modifiedTextToSend, id, userToSend);
                    if (stateValue && stateValue.length > 0) {
                        if (result && result.text && result.keyboard) {
                            sendToTelegramSubmenu(userToSend, result.text, result.keyboard, telegramParams, parse_mode);
                        }
                        return;
                    }
                    await sendToTelegram({
                        userToSend,
                        textToSend: 'The state is empty!',
                        telegramParams,
                        parse_mode,
                    });
                    adapter.log.debug('The state is empty!');
                    return;
                }
            }

            const {
                newValue: _val,
                textToSend: _text,
                error,
            } = getValueToExchange(adapter, modifiedTextToSend, modifiedStateVal);

            modifiedStateVal = String(_val);
            modifiedTextToSend = _text;

            adapter.log.debug(!error ? `Value Changed to: ${modifiedTextToSend}` : `No Change`);

            const isNewline = getNewline(newline);

            valueArrayForCorrectOrder[index] = modifiedTextToSend.includes(config.rowSplitter)
                ? `${modifiedTextToSend.replace(config.rowSplitter, modifiedStateVal.toString())}${isNewline}`
                : `${modifiedTextToSend} ${modifiedStateVal} ${isNewline}`;

            if (isLastElement(index + 1, part.getData)) {
                await sendToTelegram({
                    userToSend,
                    textToSend: valueArrayForCorrectOrder.join(''),
                    telegramParams,
                    parse_mode,
                });
            }
        });
    } catch (error: any) {
        errorLogger('Error GetData:', error, adapter);
    }
}

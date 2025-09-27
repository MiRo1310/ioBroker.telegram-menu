import { sendToTelegram, sendToTelegramSubmenu } from './telegram';
import { bindingFunc } from './action';
import { createKeyboardFromJson, createTextTableFromJson } from './jsonTable';
import { setTimeValue } from '../lib/utilities';
import { isDefined } from '../lib/utils';
import { adapter } from '../main';
import type { Part, TelegramParams } from '../types/types';
import { integrateTimeIntoText } from '../lib/time';
import { cleanUpString, decomposeText, getNewline, jsonString } from '../lib/string';
import { calcValue, roundValue } from '../lib/appUtils';
import { config } from '../config/config';
import { errorLogger } from './logging';
import { exchangeValue } from '../lib/exchangeValue';
import { idBySelector } from './idBySelector';
import { isParseModeFirstElement } from './parseMode';

export async function getState(
    instance: string,
    part: Part,
    userToSend: string,
    telegramParams: TelegramParams,
): Promise<void> {
    try {
        const parse_mode = isParseModeFirstElement(part);
        const valueArrayForCorrectOrder: string[] = [];
        const promises = (part.getData || []).map(async ({ newline, text, id }, index): Promise<void> => {
            adapter.log.debug(`Get Value ID: ${id}`);

            if (id.includes(config.functionSelektor)) {
                await idBySelector({
                    instance,
                    adapter,
                    selector: id,
                    text,
                    userToSend,
                    newline,
                    telegramParams,
                });
                return;
            }

            if (text.includes(config.binding.start)) {
                await bindingFunc(instance, text, userToSend, telegramParams, parse_mode);
                return;
            }

            const state = await adapter.getForeignStateAsync(id);

            if (!isDefined(state)) {
                adapter.log.error('The state is empty!');
                valueArrayForCorrectOrder[index] = 'N/A';
                return Promise.resolve();
            }

            const stateValue = cleanUpString(state.val?.toString());

            let modifiedStateVal = stateValue;
            let modifiedTextToSend = text;

            if (text.includes(config.timestamp.ts) || text.includes(config.timestamp.lc)) {
                modifiedTextToSend = await setTimeValue(text, id);
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

                    adapter.log.debug(`textToSend : ${modifiedTextToSend} val : ${modifiedStateVal}`);
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
                            instance,
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
                        if (result?.text && result?.keyboard) {
                            sendToTelegramSubmenu(
                                instance,
                                userToSend,
                                result.text,
                                result.keyboard,
                                telegramParams,
                                parse_mode,
                            );
                        }
                        return;
                    }
                    await sendToTelegram({
                        instance,
                        userToSend,
                        textToSend: 'The state is empty!',
                        telegramParams,
                        parse_mode,
                    });
                    adapter.log.debug('The state is empty!');
                    return;
                }
            }

            const { textToSend: _text, error } = exchangeValue(adapter, modifiedTextToSend, modifiedStateVal);

            const isNewline = getNewline(newline);
            modifiedTextToSend = `${_text} ${isNewline}`;

            adapter.log.debug(!error ? `Value Changed to: ${modifiedTextToSend}` : `No Change`);

            valueArrayForCorrectOrder[index] = modifiedTextToSend;
        });
        await Promise.all(promises);

        if (valueArrayForCorrectOrder.length) {
            await sendToTelegram({
                instance,
                userToSend,
                textToSend: valueArrayForCorrectOrder.join(''),
                telegramParams,
                parse_mode,
            });
        }
    } catch (error: any) {
        errorLogger('Error GetData:', error, adapter);
    }
}

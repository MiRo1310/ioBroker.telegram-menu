import { config } from '@backend/config/config';
import type { Part, TelegramParams } from '@backend/types/types';
import { isParseModeFirstElement } from '@backend/app/parseMode';
import { idBySelector } from '@backend/app/idBySelector';
import { bindingFunc } from '@backend/app/action';
import { isDefined } from '@backend/lib/utils';
import { cleanUpString, decomposeText, ifTruthyAddNewLine, jsonString } from '@backend/lib/string';
import { setTimeValue } from '@backend/lib/utilities';
import { integrateTimeIntoText } from '@backend/lib/time';
import { mathFunction, roundValue } from '@backend/lib/appUtils';
import { createKeyboardFromJson, createTextTableFromJson } from '@backend/app/jsonTable';
import { sendToTelegram, sendToTelegramSubmenu } from '@backend/app/telegram';
import { exchangeValue } from '@backend/lib/exchangeValue';
import { errorLogger } from '@backend/app/logging';

export async function getState(
    instance: string,
    part: Part,
    userToSend: string,
    telegramParams: TelegramParams,
): Promise<void> {
    const adapter = telegramParams.adapter;
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
                await bindingFunc(adapter, instance, text, userToSend, telegramParams, parse_mode);
                return;
            }

            const state = await adapter.getForeignStateAsync(id);

            if (!isDefined(state)) {
                adapter.log.error('The state is empty!');
                valueArrayForCorrectOrder[index] = 'N/A';
                return Promise.resolve();
            }

            const stateValue = state.val?.toString() ?? '';
            const cleanedString = cleanUpString(stateValue);

            let modifiedStateVal = cleanedString;
            let modifiedTextToSend = text;

            if (text.includes(config.timestamp.ts) || text.includes(config.timestamp.lc)) {
                modifiedTextToSend = await setTimeValue(adapter, text, id);
                modifiedStateVal = '';
            }

            if (modifiedTextToSend.includes(config.time)) {
                modifiedTextToSend = integrateTimeIntoText(modifiedTextToSend, cleanedString);
                modifiedStateVal = '';
            }

            const { textToSend, calculated, error: err } = mathFunction(modifiedTextToSend, modifiedStateVal, adapter);
            if (!err) {
                modifiedTextToSend = textToSend;
                modifiedStateVal = calculated;

                adapter.log.debug(`textToSend : ${modifiedTextToSend} val : ${modifiedStateVal}`);
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
                    const result = createTextTableFromJson(adapter, cleanedString, modifiedTextToSend);
                    if (result) {
                        await sendToTelegram({
                            instance,
                            userToSend,
                            textToSend: result,
                            telegramParams,
                            parse_mode: false,
                            shouldCleanUpString: false,
                        });
                        return;
                    }
                    adapter.log.debug('Cannot create a Text-Table');
                }
            }

            if (modifiedTextToSend.includes('alexaShoppingList')) {
                const result = createKeyboardFromJson(adapter, stateValue, modifiedTextToSend, id, userToSend);
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

            const { textToSend: _text, error } = exchangeValue(adapter, modifiedTextToSend, modifiedStateVal);

            const isNewline = ifTruthyAddNewLine(newline);
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

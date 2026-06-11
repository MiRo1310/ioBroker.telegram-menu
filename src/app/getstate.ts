import { config } from '@backend/config/config';
import type { Part } from '@backend/types/types';
import { isParseModeFirstElement } from '@backend/app/parseMode';
import { idBySelector } from '@backend/app/idBySelector';
import { bindingFunc } from '@backend/app/action';
import { isDefined } from '@backend/lib/utils';
import { cleanUpString, ifTruthyAddNewLine, jsonString } from '@backend/lib/string';
import { getTimeValue } from '@backend/lib/utilities';
import { integrateTimeIntoText } from '@backend/lib/time';
import { mathFunction, roundValue } from '@backend/lib/appUtils';
import { createKeyboardFromJson, createTextTableFromJson } from '@backend/app/jsonTable';
import { sendToTelegram, sendToTelegramSubmenu } from '@backend/app/telegram';
import { exchangeValue } from '@backend/lib/exchangeValue';
import type { AppContext } from '@backend/app/appContext';

export async function getState(
    instance: string,
    part: Part,
    userToSend: string,
    appContext: AppContext,
): Promise<void> {
    const parse_mode = isParseModeFirstElement(part);
    const valueArrayForCorrectOrder: string[] = [];
    const promises = (part.getData || []).map(async ({ newline, text, id }, index): Promise<void> => {
        appContext.adapter.log.debug(`Get Value ID: ${id}`);

        if (id.includes(config.functionSelektor)) {
            await idBySelector({
                instance,
                selector: id,
                text,
                userToSend,
                newline,
                appContext,
            });
            return;
        }

        if (text.includes(config.binding.start)) {
            await bindingFunc(appContext, instance, text, userToSend, parse_mode);
            return;
        }

        const state = await appContext.adapter.getForeignStateAsync(id);

        if (!isDefined(state)) {
            appContext.adapter.log.error('The state is empty!');
            valueArrayForCorrectOrder[index] = 'N/A';
            return Promise.resolve();
        }

        const stateValue = state.val?.toString() ?? '';
        const cleanedString = cleanUpString(stateValue);

        let modifiedStateVal = cleanedString;
        let modifiedTextToSend = text;

        if (text.includes(config.timestamp.ts) || text.includes(config.timestamp.lc)) {
            modifiedTextToSend = await getTimeValue(appContext, text, id);
            modifiedStateVal = '';
        }

        if (modifiedTextToSend.includes(config.time)) {
            modifiedTextToSend = integrateTimeIntoText(modifiedTextToSend, cleanedString);
            modifiedStateVal = '';
        }

        const {
            textToSend,
            calculated,
            error: err,
        } = mathFunction(modifiedTextToSend, modifiedStateVal, appContext.adapter);
        if (!err) {
            modifiedTextToSend = textToSend;
            modifiedStateVal = calculated;

            appContext.adapter.log.debug(`textToSend : ${modifiedTextToSend} val : ${modifiedStateVal}`);
        }

        if (modifiedTextToSend.includes(config.round.start)) {
            const { error, text, roundedValue } = roundValue(String(modifiedStateVal), modifiedTextToSend);
            if (!error) {
                appContext.adapter.log.debug(
                    `Rounded from ${jsonString(modifiedStateVal)} to ${jsonString(roundedValue)}`,
                );
                modifiedStateVal = roundedValue;
                modifiedTextToSend = text;
            }
        }

        if (modifiedTextToSend.includes(config.json.textTable)) {
            const result = createTextTableFromJson(appContext.adapter, cleanedString, modifiedTextToSend);
            if (result) {
                await sendToTelegram({
                    instance,
                    userToSend,
                    textToSend: result,
                    appContext,
                    parse_mode: false,
                    shouldCleanUpString: false,
                });
                return;
            }
            appContext.adapter.log.debug('Cannot create a Text-Table');
        }

        if (modifiedTextToSend.includes('alexaShoppingList')) {
            const result = createKeyboardFromJson(appContext, stateValue, modifiedTextToSend, id, userToSend, instance);
            if (stateValue && stateValue.length > 0) {
                if (result?.text && result?.keyboard) {
                    sendToTelegramSubmenu(instance, userToSend, result.text, result.keyboard, appContext, parse_mode);
                }
                return;
            }
            await sendToTelegram({
                instance,
                userToSend,
                textToSend: 'The state is empty!',
                appContext,
                parse_mode,
            });
            appContext.adapter.log.debug('The state is empty!');
            return;
        }

        const { textToSend: _text, error } = exchangeValue(appContext, modifiedTextToSend, modifiedStateVal);

        const isNewline = ifTruthyAddNewLine(newline);
        modifiedTextToSend = `${_text} ${isNewline}`;

        appContext.adapter.log.debug(!error ? `Value Changed to: ${modifiedTextToSend}` : `No Change`);

        valueArrayForCorrectOrder[index] = modifiedTextToSend;
    });
    await Promise.all(promises);

    if (valueArrayForCorrectOrder.length) {
        await sendToTelegram({
            instance,
            userToSend,
            textToSend: valueArrayForCorrectOrder.join(''),
            appContext,
            parse_mode,
        });
    }
}

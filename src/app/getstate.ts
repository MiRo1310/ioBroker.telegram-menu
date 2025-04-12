import { sendToTelegram, sendToTelegramSubmenu } from './telegram';
import { bindingFunc, calcValue, idBySelector, roundValue } from './action';
import { createKeyboardFromJson, createTextTableFromJson } from './jsonTable';
import { processTimeIdLc } from '../lib/utilities';
import { isDefined } from '../lib/utils';
import { adapter } from '../main';
import type { Part, PrimitiveType, UserListWithChatId } from '../types/types';
import { integrateTimeIntoText } from '../lib/time';
import { decomposeText, getValueToExchange, jsonString } from '../lib/string';

function getState(
    part: Part,
    userToSend: string,
    telegramInstance: string,
    one_time_keyboard: boolean,
    resize_keyboard: boolean,
    userListWithChatID: UserListWithChatId[],
): void {
    let text = '';
    let i = 1;
    // Parse Mode ist nur immer im ersten Element
    const parse_mode = part.getData?.[0].parse_mode || 'false';

    part.getData?.forEach(async element => {
        try {
            adapter.log.debug(`Get Value ID: ${element.id}`);
            const specifiedSelektor = 'functions=';
            const id = element.id;
            let textToSend = '';

            if (id.indexOf(specifiedSelektor) != -1) {
                await idBySelector(
                    id,
                    element.text,
                    userToSend,
                    element.newline,
                    telegramInstance,
                    one_time_keyboard,
                    resize_keyboard,
                    userListWithChatID,
                );
                return;
            }

            if (element.text.includes('binding:')) {
                adapter.log.debug('Binding');
                await bindingFunc(
                    element.text,
                    userToSend,
                    telegramInstance,
                    one_time_keyboard,
                    resize_keyboard,
                    userListWithChatID,
                    parse_mode,
                );
                return;
            }

            await adapter.getForeignStateAsync(id).then(async (state?: ioBroker.State | null) => {
                if (!isDefined(state)) {
                    adapter.log.error('The state is empty!');
                    return;
                }
                const valueForJson: string = state.val?.toString() ?? '';
                adapter.log.debug(`State: ${jsonString(state)}`);

                let val: PrimitiveType = valueForJson.replace(/\\/g, '').replace(/"/g, '');

                let newline = '';
                if (element.newline === 'true') {
                    newline = '\n';
                }
                if (element.text) {
                    textToSend = element.text.toString();
                    if (element.text.includes('{time.lc') || element.text.includes('{time.ts')) {
                        textToSend = (await processTimeIdLc(element.text, id)) || '';
                        val = '';
                    }
                    if (textToSend.includes('{time}')) {
                        textToSend = integrateTimeIntoText(textToSend, state.val);
                        val = '';
                    }
                    if (textToSend.includes('math:')) {
                        const result = calcValue(textToSend, val);
                        if (result) {
                            textToSend = result.textToSend;
                            val = result.val;

                            adapter.log.debug(`TextToSend: ${textToSend} val: ${val}`);
                        }
                    }
                    if (textToSend.includes('round:')) {
                        const result = roundValue(val, textToSend);
                        if (result) {
                            adapter.log.debug(
                                `The Value was rounded ${JSON.stringify(val)} to ${JSON.stringify(result.val)}`,
                            );
                            val = result.val;
                            textToSend = result.textToSend;
                        }
                    }
                    if (textToSend.includes('{json')) {
                        if (decomposeText(textToSend, '{json', '}').substring.includes('TextTable')) {
                            const result = createTextTableFromJson(valueForJson, textToSend);
                            if (result) {
                                await sendToTelegram({
                                    user: userToSend,
                                    textToSend: result,
                                    keyboard: undefined,
                                    instance: telegramInstance,
                                    resize_keyboard: one_time_keyboard,
                                    one_time_keyboard: resize_keyboard,
                                    userListWithChatID: userListWithChatID,
                                    parse_mode: parse_mode,
                                });
                                return;
                            }
                            adapter.log.debug('Cannot create a Text-Table');
                        } else {
                            const result = createKeyboardFromJson(valueForJson, textToSend, element.id, userToSend);
                            if (valueForJson && valueForJson.length > 0) {
                                if (result && result.text && result.keyboard) {
                                    sendToTelegramSubmenu(
                                        userToSend,
                                        result.text,
                                        result.keyboard,
                                        telegramInstance,
                                        userListWithChatID,
                                        parse_mode,
                                    );
                                }
                                return;
                            }
                            await sendToTelegram({
                                user: userToSend,
                                textToSend: 'The state is empty!',
                                keyboard: undefined,
                                instance: telegramInstance,
                                resize_keyboard: one_time_keyboard,
                                one_time_keyboard: resize_keyboard,
                                userListWithChatID: userListWithChatID,
                                parse_mode: parse_mode,
                            });
                            adapter.log.debug('The state is empty!');
                            return;
                        }
                    }

                    const { newValue: _val, textToSend: _text, error } = getValueToExchange(adapter, textToSend, val);

                    val = _val;
                    textToSend = _text;
                    if (!error) {
                        adapter.log.debug(`Value Changed to: ${textToSend}`);
                    } else {
                        adapter.log.debug(`No Change`);
                    }
                    if (textToSend.indexOf('&&') != -1) {
                        text += `${textToSend.replace('&&', val.toString())}${newline}`;
                    } else {
                        text += `${textToSend} ${val}${newline}`;
                    }
                } else {
                    text += `${val} ${newline}`;
                }
                adapter.log.debug(`Text: ${text}`);

                if (i == part.getData?.length) {
                    if (userToSend) {
                        await sendToTelegram({
                            user: userToSend,
                            textToSend: text,
                            keyboard: undefined,
                            instance: telegramInstance,
                            resize_keyboard: one_time_keyboard,
                            one_time_keyboard: resize_keyboard,
                            userListWithChatID: userListWithChatID,
                            parse_mode: parse_mode,
                        });
                    }
                }
                i++;
            });
        } catch (error: any) {
            error({
                array: [
                    { text: 'Error GetData:', val: error.message },
                    { text: 'Stack:', val: error.stack },
                ],
            });
        }
    });
}

export { getState };

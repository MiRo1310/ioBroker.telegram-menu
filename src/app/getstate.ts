import { sendToTelegram, sendToTelegramSubmenu } from './telegram';
import { bindingFunc, idBySelector } from './action';
import { createKeyboardFromJson, createTextTableFromJson } from './jsonTable';
import { processTimeIdLc } from '../lib/utilities';
import { isDefined } from '../lib/utils';
import { adapter } from '../main';
import type { Part, PrimitiveType, UserListWithChatId } from '../types/types';
import { integrateTimeIntoText } from '../lib/time';
import { decomposeText, getValueToExchange, jsonString } from '../lib/string';
import { calcValue, roundValue } from '../lib/appUtils';

function getState(
    part: Part,
    userToSend: string,
    telegramInstance: string,
    oneTimeKeyboard: boolean,
    resizeKeyboard: boolean,
    userListWithChatID: UserListWithChatId[],
): void {
    let text = '';
    let i = 1;
    // Parse Mode ist nur immer im ersten Element
    const parseMode = part.getData?.[0].parseMode;

    part.getData?.forEach(async element => {
        try {
            adapter.log.debug(`Get Value ID: ${element.id}`);
            const specifiedSelektor = 'functions=';
            const id = element.id;
            let textToSend = '';

            if (id.indexOf(specifiedSelektor) != -1) {
                await idBySelector({
                    selector: id,
                    text: element.text,
                    userToSend,
                    newline: element.newline,
                    telegramInstance,
                    oneTimeKeyboard,
                    resizeKeyboard,
                    userListWithChatID,
                });
                return;
            }

            if (element.text.includes('binding:')) {
                adapter.log.debug('Binding');
                await bindingFunc(
                    element.text,
                    userToSend,
                    telegramInstance,
                    oneTimeKeyboard,
                    resizeKeyboard,
                    userListWithChatID,
                    parseMode,
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
                        const result = calcValue(textToSend, val, adapter);
                        if (result) {
                            textToSend = result.textToSend;
                            val = result.val;

                            adapter.log.debug(`TextToSend: ${textToSend} val: ${val}`);
                        }
                    }
                    if (textToSend.includes('round:')) {
                        const result = roundValue(String(val), textToSend, adapter);
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
                                    userToSend,
                                    textToSend: result,
                                    instanceTelegram: telegramInstance,
                                    resizeKeyboard,
                                    oneTimeKeyboard,
                                    userListWithChatID,
                                    parseMode,
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
                                        parseMode,
                                    );
                                }
                                return;
                            }
                            await sendToTelegram({
                                userToSend,
                                textToSend: 'The state is empty!',
                                instanceTelegram: telegramInstance,
                                resizeKeyboard,
                                oneTimeKeyboard,
                                userListWithChatID,
                                parseMode,
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
                            userToSend,
                            textToSend: text,
                            instanceTelegram: telegramInstance,
                            resizeKeyboard,
                            oneTimeKeyboard,
                            userListWithChatID,
                            parseMode,
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

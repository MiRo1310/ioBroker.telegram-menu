import { sendToTelegram, sendToTelegramSubmenu } from './telegram';
import { bindingFunc, roundValue, calcValue, idBySelector } from './action';
import { createKeyboardFromJson, createTextTableFromJson } from './jsonTable';
import { processTimeIdLc, changeValue } from '../lib/utilities';
import { decomposeText, isDefined } from './global';
import { debug, errorLogger } from './logging';
import TelegramMenu from '../main';
import type { Part, UserListWithChatId } from '../types/types';
import { processTimeValue } from '../lib/time';

function getState(
    part: Part,
    userToSend: string,
    telegramInstance: string,
    one_time_keyboard: boolean,
    resize_keyboard: boolean,
    userListWithChatID: UserListWithChatId[],
): void {
    const _this = TelegramMenu.getInstance();
    let text = '';
    let i = 1;
    // Parse Mode ist nur immer im ersten Element
    const parse_mode = part.getData?.[0].parse_mode || 'false';

    part.getData?.forEach(async element => {
        try {
            debug([{ text: 'Get Value ID:', val: element.id }]);
            const specifiedSelektor = 'functions=';
            const id = element.id;
            let textToSend = '';

            if (id.indexOf(specifiedSelektor) != -1) {
                await idBySelector(
                    _this,
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
                debug([{ text: 'Binding' }]);
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

            await _this.getForeignStateAsync(id).then(async (value?: ioBroker.State | null) => {
                if (!isDefined(value)) {
                    errorLogger([{ text: 'The state is empty!' }]);
                    return;
                }
                const valueForJson: string = value.val?.toString() ?? '';
                debug([{ text: 'State:', val: value }]);

                let val: string | number = valueForJson.replace(/\\/g, '').replace(/"/g, '');

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
                        textToSend = processTimeValue(textToSend, value);
                        val = '';
                    }
                    if (textToSend.includes('math:')) {
                        const result = calcValue(_this, textToSend, val);
                        if (result) {
                            textToSend = result.textToSend;
                            val = result.val;

                            _this.log.debug(`TextToSend: ${textToSend} val: ${val}`);
                        }
                    }
                    if (textToSend.includes('round:')) {
                        const result = roundValue(val, textToSend);
                        if (result) {
                            _this.log.debug(
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
                            _this.log.debug('Cannot create a Text-Table');
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
                            _this.log.debug('The state is empty!');
                            return;
                        }
                    }

                    const { val: _val, textToSend: _text, error } = changeValue(textToSend, val);

                    val = _val;
                    textToSend = _text;
                    if (!error) {
                        debug([{ text: 'Value Changed to:', val: textToSend }]);
                    } else {
                        debug([{ text: 'No Change' }]);
                    }
                    if (textToSend.indexOf('&&') != -1) {
                        text += `${textToSend.replace('&&', val.toString())}${newline}`;
                    } else {
                        text += `${textToSend} ${val}${newline}`;
                    }
                } else {
                    text += `${val} ${newline}`;
                }
                debug([{ text: 'Text:', val: text }]);

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

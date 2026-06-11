import type { AppContext } from '@backend/app/appContext';
import type { SetStateIds } from '@backend/types/types';
import { decomposeText, jsonString } from '@backend/lib/string';
import { isDefined } from '@backend/lib/utils';
import { exchangePlaceholderWithValue, exchangeValue } from '@backend/lib/exchangeValue';
import { isFalsy, isTruthy } from '@/lib/string';
import { sendToTelegram } from '@backend/app/telegram';

export class SetStateListenerHandler {
    constructor(private appContext: AppContext) {}

    public async handleSetStateListener(
        state: ioBroker.State | null | undefined,
        setStateIdsToListenTo: SetStateIds[],
        id: string,
    ): Promise<void> {
        if (state && setStateIdsToListenTo?.find(element => element.id == id)) {
            this.appContext.adapter.log.debug(
                `Subscribed state changed: { id : ${id} , state : ${jsonString(state)} }`,
            );

            for (const el of setStateIdsToListenTo) {
                const { id: elId, userToSend, confirm, returnText, parse_mode } = el;
                const key: number = setStateIdsToListenTo.indexOf(el);

                if (elId == id) {
                    this.appContext.adapter.log.debug(`Send Value: ${jsonString(el)}`);
                    this.appContext.adapter.log.debug(`State: ${jsonString(state)}`);

                    if (await this.handlePreConfirm(confirm, state, returnText, el, userToSend, parse_mode)) {
                        continue;
                    }
                    this.appContext.adapter.log.debug(
                        `Data: ${jsonString({ confirm, ack: state?.ack, val: state?.val })}`,
                    );
                    await this.handlePostConfirm(
                        confirm,
                        state,
                        returnText,
                        el,
                        userToSend,
                        parse_mode,
                        setStateIdsToListenTo,
                        key,
                    );
                }
            }
        }
    }

    private async handlePreConfirm(
        confirm: boolean,
        state: ioBroker.State,
        returnText: string | undefined,
        el: SetStateIds,
        userToSend: string,
        parse_mode: boolean | undefined,
    ): Promise<boolean> {
        if (isTruthy(confirm) && !state?.ack && returnText?.includes('{confirmSet:')) {
            const { substring } = decomposeText(returnText, '{confirmSet:', '}');
            const splitSubstring = substring.split(':');

            let text = '';
            if (isDefined(state.val)) {
                text = splitSubstring[2]?.includes('noValue')
                    ? splitSubstring[1]
                    : exchangePlaceholderWithValue(splitSubstring[1], state.val.toString());
            }
            this.appContext.adapter.log.debug(`Return-text: ${text}`);

            if (text === '') {
                this.appContext.adapter.log.error('The return text cannot be empty, please check.');
            }

            await sendToTelegram({
                instance: el.instance,
                textToSend: text,
                parse_mode: parse_mode,
                userToSend,
                appContext: this.appContext,
            });
            return true;
        }
        return false;
    }

    private async handlePostConfirm(
        confirm: boolean,
        state: ioBroker.State,
        returnText: string | undefined,
        el: SetStateIds,
        userToSend: string,
        parse_mode: boolean | undefined,
        setStateIdsToListenTo: SetStateIds[],
        key: number,
    ): Promise<void> {
        if (!isFalsy(confirm) && state?.ack) {
            let textToSend = returnText;

            if (textToSend?.includes('{confirmSet:')) {
                textToSend = decomposeText(textToSend, '{confirmSet:', '}').textExcludeSubstring;
            }

            if (textToSend?.includes('{setDynamicValue')) {
                const { textExcludeSubstring, substringExcludeSearch } = decomposeText(
                    textToSend,
                    '{setDynamicValue:',
                    '}',
                );
                const splitSubstring = substringExcludeSearch.split(':');
                const confirmText = splitSubstring[2];
                textToSend = `${textExcludeSubstring} ${confirmText}`;
            }

            const {
                textToSend: changedText,
                error,
                newValue,
            } = exchangeValue(this.appContext, textToSend ?? '', state.val?.toString());

            if (!error) {
                textToSend = changedText;
            }

            this.appContext.adapter.log.debug(`Value to send: ${newValue}`);

            await sendToTelegram({
                instance: el.instance,
                userToSend,
                textToSend,
                parse_mode,
                appContext: this.appContext,
            });
            setStateIdsToListenTo.splice(key, 1);
        }
    }
}

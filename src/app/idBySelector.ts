import type { BooleanString } from '@/types/app';
import type { Adapter, TelegramParams } from '@b/types/types';
import { config } from '@b/config/config';
import { exchangeValue } from '@b/lib/exchangeValue';
import { ifTruthyAddNewLine } from '@b/lib/string';
import { sendToTelegram } from '@b/app/telegram';
import { errorLogger } from '@b/app/logging';

export const idBySelector = async ({
    instance,
    adapter,
    selector,
    text,
    userToSend,
    newline,
    telegramParams,
}: {
    adapter: Adapter;
    selector: string;
    text: string;
    userToSend: string;
    newline: BooleanString;
    telegramParams: TelegramParams;
    instance: string;
}): Promise<void> => {
    let text2Send = '';
    try {
        const functions = selector.replace(config.functionSelektor, '');
        let enums: string[] | undefined = [];
        const result = await adapter.getEnumsAsync();
        const enumsFunctions = result?.['enum.functions'][`enum.functions.${functions}`];
        if (!enumsFunctions) {
            return;
        }
        enums = enumsFunctions.common.members;
        if (!enums) {
            return;
        }

        const promises = enums.map(async (id: string) => {
            const value = await adapter.getForeignStateAsync(id);

            let newText = text;

            if (text.includes('{common.name}')) {
                const result = await adapter.getForeignObjectAsync(id);
                newText = newText.replace('{common.name}', getCommonName({ name: result?.common.name, adapter }));
            }
            if (text.includes('{folder.name}')) {
                const result = await adapter.getForeignObjectAsync(removeLastPartOfId(id));
                newText = newText.replace('{folder.name}', getCommonName({ name: result?.common.name, adapter }));
            }

            const { textToSend } = exchangeValue(adapter, newText, value?.val ?? '');

            text2Send += textToSend;
            text2Send += ifTruthyAddNewLine(newline);

            adapter.log.debug(`Text to send:  ${JSON.stringify(text2Send)}`);
        });
        Promise.all(promises)
            .then(async () => {
                await sendToTelegram({
                    instance,
                    userToSend,
                    textToSend: text2Send,
                    telegramParams,
                });
            })
            .catch(e => {
                errorLogger('Error Promise', e, adapter);
            });
    } catch (error: any) {
        errorLogger('Error idBySelector', error, adapter);
    }
};

function getCommonName({ name, adapter }: { name?: ioBroker.StringOrTranslated; adapter: Adapter }): string {
    const language = adapter.language ?? 'en';
    if (!name) {
        return '';
    }
    if (typeof name === 'string') {
        return name;
    }
    if (language) {
        return name[language] ?? '';
    }
    return '';
}

function removeLastPartOfId(id: string): string {
    const parts = id.split('.');
    parts.pop();
    return parts.join('.');
}

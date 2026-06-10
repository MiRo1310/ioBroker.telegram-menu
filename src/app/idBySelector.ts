import type { BooleanString } from '@/types/app';
import { config } from '@backend/config/config';
import { exchangeValue } from '@backend/lib/exchangeValue';
import { ifTruthyAddNewLine } from '@backend/lib/string';
import { sendToTelegram } from '@backend/app/telegram';
import { errorLogger } from '@backend/app/logging';
import type { AppContext } from '@backend/app/appContext';

export const idBySelector = async ({
    instance,
    selector,
    text,
    userToSend,
    newline,
    appContext,
}: {
    selector: string;
    text: string;
    userToSend: string;
    newline: BooleanString;
    appContext: AppContext;
    instance: string;
}): Promise<void> => {
    let text2Send = '';
    try {
        const functions = selector.replace(config.functionSelektor, '');
        let enums: string[] | undefined = [];
        const result = await appContext.adapter.getEnumsAsync();
        const enumsFunctions = result?.['enum.functions'][`enum.functions.${functions}`];
        if (!enumsFunctions) {
            return;
        }
        enums = enumsFunctions.common.members;
        if (!enums) {
            return;
        }

        const promises = enums.map(async (id: string) => {
            const value = await appContext.adapter.getForeignStateAsync(id);

            let newText = text;

            if (text.includes('{common.name}')) {
                const result = await appContext.adapter.getForeignObjectAsync(id);
                newText = newText.replace('{common.name}', getCommonName({ name: result?.common.name, appContext }));
            }
            if (text.includes('{folder.name}')) {
                const result = await appContext.adapter.getForeignObjectAsync(removeLastPartOfId(id));
                newText = newText.replace('{folder.name}', getCommonName({ name: result?.common.name, appContext }));
            }

            const { textToSend } = exchangeValue(appContext, newText, value?.val ?? '');

            text2Send += textToSend;
            text2Send += ifTruthyAddNewLine(newline);

            appContext.adapter.log.debug(`Text to send:  ${JSON.stringify(text2Send)}`);
        });
        Promise.all(promises)
            .then(async () => {
                await sendToTelegram({
                    instance,
                    userToSend,
                    textToSend: text2Send,
                    appContext,
                });
            })
            .catch(e => {
                errorLogger('Error Promise', e, appContext.adapter);
            });
    } catch (error: any) {
        errorLogger('Error idBySelector', error, appContext.adapter);
    }
};

function getCommonName({ name, appContext }: { name?: ioBroker.StringOrTranslated; appContext: AppContext }): string {
    const language = appContext.adapter.language ?? 'en';
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

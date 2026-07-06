import { textModifier } from '@backend/lib/utilities';
import type { Adapter, Keyboard, Location, Telegram } from '@backend/types/types';
import { getChatID } from '@backend/lib/utils';
import { cleanUpString, isEmptyString, jsonString } from '@backend/lib/string';
import { getParseMode } from '@backend/lib/appUtils';
import { isInstanceActive } from '@backend/app/instance';
import type { AppContext } from '@backend/app/appContext';

function validateTextToSend(adapter: Adapter, textToSend: string | undefined): boolean {
    if (!textToSend || isEmptyString(textToSend ?? '')) {
        adapter.log.error('There is a problem! Text to send is empty or undefined, please check your configuration.');
        return false;
    }
    if (textToSend.includes('change{')) {
        adapter.log.warn(
            "To use 'change{'. The status must have a param to be exchanged, like: {status:'ID':true}. If you use it in another way, and it doesn't work, please check your configuration. If nothing helps, please open an issue on GitHub.",
        );
    }
    return true;
}

async function sendToTelegram({
    instance,
    userToSend,
    textToSend,
    keyboard,
    appContext,
    parse_mode,
    shouldCleanUpString = true,
}: Telegram): Promise<void> {
    const chatId = getChatID(appContext.userListWithChatID, userToSend);

    if (!instance || !isInstanceActive(appContext.telegramInstanceList, instance)) {
        return;
    }
    appContext.adapter.log.debug(
        `Send to: { user: ${userToSend} , chatId :${chatId} , text: ${textToSend} , instance: ${instance} , parseMode: ${parse_mode} }`,
    );
    validateTextToSend(appContext.adapter, textToSend);

    if (!keyboard) {
        appContext.adapter.sendTo(
            instance,
            'send',
            {
                text: shouldCleanUpString ? cleanUpString(textToSend) : textToSend,
                chatId,
                parse_mode: getParseMode(parse_mode),
            },
            res => telegramLogger(appContext.adapter, res),
        );
        return;
    }

    appContext.adapter.sendTo(
        instance,
        'send',
        {
            chatId,
            parse_mode: getParseMode(parse_mode),
            text: await textModifier(appContext, shouldCleanUpString ? cleanUpString(textToSend) : textToSend),
            reply_markup: {
                keyboard,
                resize_keyboard: appContext.resize_keyboard,
                one_time_keyboard: appContext.one_time_keyboard,
            },
        },
        res => telegramLogger(appContext.adapter, res),
    );
}

function sendToTelegramSubmenu(
    telegramInstance: string,
    user: string,
    textToSend: string,
    keyboard: Keyboard,
    appContext: AppContext,
    parse_mode?: boolean,
): void {
    if (!validateTextToSend(appContext.adapter, textToSend)) {
        return;
    }

    appContext.adapter.sendTo(
        telegramInstance,
        'send',
        {
            chatId: getChatID(appContext.userListWithChatID, user),
            parse_mode: getParseMode(parse_mode),
            text: cleanUpString(textToSend),
            reply_markup: keyboard,
        },
        (res: any) => telegramLogger(appContext.adapter, res),
    );
}

const sendLocationToTelegram = async (
    telegramInstance: string,
    user: string,
    data: Location[],
    appContext: AppContext,
): Promise<void> => {
    const chatId = getChatID(appContext.userListWithChatID, user);

    for (const { longitude: longitudeID, latitude: latitudeID } of data) {
        if (!(latitudeID || longitudeID)) {
            continue;
        }

        const latitude = await appContext.adapter.getForeignStateAsync(latitudeID);
        const longitude = await appContext.adapter.getForeignStateAsync(longitudeID);
        if (!latitude || !longitude) {
            continue;
        }
        appContext.adapter.sendTo(
            telegramInstance,
            {
                chatId: chatId,
                latitude: latitude.val,
                longitude: longitude.val,
                disable_notification: true,
            },
            (res: any) => telegramLogger(appContext.adapter, res),
        );
    }
};

function telegramLogger(adapter: Adapter, res: any): void {
    if (res?.error) {
        adapter.log.warn(`Telegram request failed: ${jsonString(res)}`);
        return;
    }
    adapter.log.debug(`Telegram response : "${jsonString(res)}"`);
}

export { sendToTelegram, sendToTelegramSubmenu, sendLocationToTelegram };

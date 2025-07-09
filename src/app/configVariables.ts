import type { Checkboxes, DataObject, IsUserActiveCheckbox, TelegramParams } from '../types/types';

export const getConfigVariables = (
    config: ioBroker.AdapterConfig,
): {
    telegramID: string;
    botSendMessageID: string;
    requestMessageID: string;
    infoConnectionOfTelegram: string;
    checkboxNoEntryFound: boolean;
    sendMenuAfterRestart: boolean;
    listOfMenus: string[];
    token: string;
    directoryPicture: string;
    isUserActiveCheckbox: IsUserActiveCheckbox;
    menusWithUsers: Record<string, string[]>;
    textNoEntryFound: string;
    dataObject: DataObject;
    checkboxes: Checkboxes;
    telegramParams: TelegramParams;
} => {
    const telegramInstance = config.instance ?? 'telegram.0';
    const checkboxes = config.checkbox;
    const telegramParams: TelegramParams = {
        telegramInstance,
        resize_keyboard: checkboxes.resKey,
        one_time_keyboard: checkboxes.oneTiKey,
        userListWithChatID: config.userListWithChatID,
    };
    return {
        checkboxes,
        telegramID: `${telegramInstance}.communicate.request`,
        botSendMessageID: `${telegramInstance}.communicate.botSendMessageId`,
        requestMessageID: `${telegramInstance}.communicate.requestMessageId`,
        infoConnectionOfTelegram: `${telegramInstance}.info.connection`,
        checkboxNoEntryFound: checkboxes.checkboxNoValueFound,
        sendMenuAfterRestart: checkboxes.sendMenuAfterRestart,
        listOfMenus: config.usersInGroup ? Object.keys(config.usersInGroup) : [],
        token: config.tokenGrafana,
        directoryPicture: config.directory,
        isUserActiveCheckbox: config.userActiveCheckbox,
        menusWithUsers: config.usersInGroup,
        textNoEntryFound: (config.textNoEntry as string | undefined) ?? 'Entry not found',
        dataObject: config.data,
        telegramParams,
    };
};

import type { Checkboxes, DataObject, IsUserActiveCheckbox, TelegramParams } from '../types/types';

export const getConfigVariables = (
    config: ioBroker.AdapterConfig,
): {
    telegramRequestID: (val: string) => string;
    telegramBotSendMessageID: (val: string) => string;
    telegramRequestMessageID: (val: string) => string;
    telegramInfoConnectionID: (val: string) => string;
    telegramRequestChatID: (val: string) => string;
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
    const telegramInstance = config.instancesList;
    const checkboxes = config.checkbox;
    const telegramParams: TelegramParams = {
        telegramInstance,
        resize_keyboard: checkboxes.resKey,
        one_time_keyboard: checkboxes.oneTiKey,
        userListWithChatID: config.userListWithChatID,
    };
    return {
        checkboxes,
        telegramRequestID: (instance: string) => `${instance}.communicate.request`,
        telegramBotSendMessageID: (instance: string) => `${instance}.communicate.botSendMessageId`,
        telegramRequestMessageID: (instance: string) => `${instance}.communicate.requestMessageId`,
        telegramInfoConnectionID: (instance: string) => `${instance}.info.connection`,
        telegramRequestChatID: (instance: string) => `${instance}.communicate.requestChatId`,
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

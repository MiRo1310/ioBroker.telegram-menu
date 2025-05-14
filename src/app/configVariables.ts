import type { Checkboxes, DataObject, IsUserActiveCheckbox, TelegramParams } from '../types/types';

export const getIds = {
    telegramRequestID: (instance: string): string => `${instance}.communicate.request`,
    telegramBotSendMessageID: (instance: string): string => `${instance}.communicate.botSendMessageId`,
    telegramRequestMessageID: (instance: string): string => `${instance}.communicate.requestMessageId`,
    telegramInfoConnectionID: (instance: string): string => `${instance}.info.connection`,
    telegramRequestChatID: (instance: string): string => `${instance}.communicate.requestChatId`,
};

export const getConfigVariables = (
    config: ioBroker.AdapterConfig,
): {
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
        telegramInstance: 'telegram.0', //default value
        telegramInstanceList: telegramInstance,
        resize_keyboard: checkboxes.resKey,
        one_time_keyboard: checkboxes.oneTiKey,
        userListWithChatID: config.userListWithChatID,
    };
    return {
        checkboxes,
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

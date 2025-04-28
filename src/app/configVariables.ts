import type { Checkboxes, DataObject, IsUserActiveCheckbox, UserListWithChatId } from '../types/types';

export const getConfigVariables = (
    config: ioBroker.AdapterConfig,
): {
    telegramInstance: string;
    telegramID: string;
    botSendMessageID: string;
    requestMessageID: string;
    infoConnectionOfTelegram: string;
    one_time_keyboard: boolean;
    resize_keyboard: boolean;
    checkboxNoEntryFound: boolean;
    sendMenuAfterRestart: boolean;
    listOfMenus: string[];
    token: string;
    directoryPicture: string;
    isUserActiveCheckbox: IsUserActiveCheckbox;
    menusWithUsers: Record<string, string[]>;
    textNoEntryFound: string;
    userListWithChatID: UserListWithChatId[];
    dataObject: DataObject;
    checkboxes: Checkboxes;
} => {
    const telegramInstance = config.instance ?? 'telegram.0';
    const checkboxes = config.checkbox;
    return {
        telegramInstance,
        checkboxes,
        telegramID: `${telegramInstance}.communicate.request`,
        botSendMessageID: `${telegramInstance}.communicate.botSendMessageId`,
        requestMessageID: `${telegramInstance}.communicate.requestMessageId`,
        infoConnectionOfTelegram: `${telegramInstance}.info.connection`,
        one_time_keyboard: checkboxes.oneTiKey,
        resize_keyboard: checkboxes.resKey,
        checkboxNoEntryFound: checkboxes.checkboxNoValueFound,
        sendMenuAfterRestart: checkboxes.sendMenuAfterRestart,
        listOfMenus: config.usersInGroup ? Object.keys(config.usersInGroup) : [],
        token: config.tokenGrafana,
        directoryPicture: config.directory,
        isUserActiveCheckbox: config.userActiveCheckbox,
        menusWithUsers: config.usersInGroup,
        textNoEntryFound: config.textNoEntry,
        userListWithChatID: config.userListWithChatID,
        dataObject: config.data,
    };
};

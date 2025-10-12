import type { DataObject, TelegramParams } from '../types/types';
import type { Checkboxes, UserActiveCheckbox, MenusWithUsers } from '@/types/app';
import type { AdapterConfig } from '../types/adapter-config';

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
    isUserActiveCheckbox: UserActiveCheckbox;
    menusWithUsers: MenusWithUsers;
    textNoEntryFound: string;
    dataObject: DataObject;
    checkboxes: Checkboxes;
    telegramParams: TelegramParams;
} => {
    const c = config as AdapterConfig;

    const telegramInstances = c.instanceList ?? [];
    const checkboxes = c.checkbox;
    const telegramParams: TelegramParams = {
        telegramInstanceList: telegramInstances,
        resize_keyboard: checkboxes.resKey,
        one_time_keyboard: checkboxes.oneTiKey,
        userListWithChatID: c.userListWithChatID,
    };
    return {
        checkboxes,
        checkboxNoEntryFound: checkboxes.checkboxNoValueFound,
        sendMenuAfterRestart: checkboxes.sendMenuAfterRestart,
        listOfMenus: c.usersInGroup ? Object.keys(c.usersInGroup) : [],
        token: c.tokenGrafana,
        directoryPicture: c.directory ?? '/opt/iobroker/media/',
        isUserActiveCheckbox: c.userActiveCheckbox,
        menusWithUsers: c.usersInGroup,
        textNoEntryFound: (c.textNoEntry as string | undefined) ?? 'Entry not found',
        dataObject: c.data,
        telegramParams,
    };
};

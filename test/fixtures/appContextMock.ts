import type { AppContext } from '@backend/app/appContext';
import { BackMenuRegistry } from '@backend/app/backMenu';
import { StateIdRegistry } from '@backend/app/stateIdRegistry';

export function createAppContextMock(adapterMock: any, overrides: Partial<any> = {}): AppContext {
    const partialStore: any = {
        adapter: adapterMock,
        telegramInstanceList: [{ name: 'telegram.0', active: true }],
        userListWithChatID: [{ name: 'Michael', chatID: '999', instance: 'telegram.0' }],
        resize_keyboard: true,
        one_time_keyboard: false,
        checkboxNoEntryFound: false,
        sendMenuAfterRestart: false,
        listOfMenus: [],
        token: '',
        directoryPicture: '/opt/iobroker/media/',
        isUserActiveCheckbox: {},
        menusWithUsers: {},
        textNoEntryFound: 'Entry not found',
        dataObject: { nav: {}, action: undefined },
        telegramRequestID: (instance: string) => `${instance}.communicate.request`,
        telegramBotSendMessageID: (instance: string) => `${instance}.communicate.botSendMessageId`,
        telegramRequestMessageID: (instance: string) => `${instance}.communicate.requestMessageId`,
        telegramInfoConnectionID: (instance: string) => `${instance}.info.connection`,
        telegramRequestChatID: (instance: string) => `${instance}.communicate.requestChatId`,
        ...overrides,
    };

    partialStore.backMenuRegistry = new BackMenuRegistry(partialStore);
    partialStore.stateIdRegistry = new StateIdRegistry(partialStore);

    return partialStore as AppContext;
}

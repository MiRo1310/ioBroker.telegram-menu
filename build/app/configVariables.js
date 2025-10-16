"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfigVariables = exports.getIds = void 0;
exports.getIds = {
    telegramRequestID: (instance) => `${instance}.communicate.request`,
    telegramBotSendMessageID: (instance) => `${instance}.communicate.botSendMessageId`,
    telegramRequestMessageID: (instance) => `${instance}.communicate.requestMessageId`,
    telegramInfoConnectionID: (instance) => `${instance}.info.connection`,
    telegramRequestChatID: (instance) => `${instance}.communicate.requestChatId`,
};
const getConfigVariables = (config, adapter) => {
    const c = config;
    const telegramInstances = c.instanceList ?? [];
    const checkboxes = c.checkbox;
    const telegramParams = {
        telegramInstanceList: telegramInstances,
        resize_keyboard: checkboxes.resKey,
        one_time_keyboard: checkboxes.oneTiKey,
        userListWithChatID: c.userListWithChatID,
        adapter,
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
        textNoEntryFound: c.textNoEntry ?? 'Entry not found',
        dataObject: c.data,
        telegramParams,
    };
};
exports.getConfigVariables = getConfigVariables;
//# sourceMappingURL=configVariables.js.map
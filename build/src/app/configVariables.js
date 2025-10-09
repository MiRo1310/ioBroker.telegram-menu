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
const getConfigVariables = (config) => {
    const telegramInstances = config.instanceList ?? [];
    const checkboxes = config.checkbox;
    const telegramParams = {
        telegramInstanceList: telegramInstances,
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
        directoryPicture: config.directory ?? '/opt/iobroker/media/',
        isUserActiveCheckbox: config.userActiveCheckbox,
        menusWithUsers: config.usersInGroup,
        textNoEntryFound: config.textNoEntry ?? 'Entry not found',
        dataObject: config.data,
        telegramParams,
    };
};
exports.getConfigVariables = getConfigVariables;
//# sourceMappingURL=configVariables.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfigVariables = void 0;
const getConfigVariables = (config) => {
    const telegramInstance = config.instance ?? 'telegram.0';
    const checkboxes = config.checkbox;
    const telegramParams = {
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
        textNoEntryFound: config.textNoEntry,
        dataObject: config.data,
        telegramParams,
    };
};
exports.getConfigVariables = getConfigVariables;
//# sourceMappingURL=configVariables.js.map
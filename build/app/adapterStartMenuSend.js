"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adapterStartMenuSend = adapterStartMenuSend;
const appUtils_1 = require("../lib/appUtils");
const string_1 = require("../lib/string");
const telegram_1 = require("../app/telegram");
function isUserActive(appContext, userToSend) {
    return appContext.userListWithChatID.find(user => user.chatID === userToSend.chatId && user.instance === userToSend.instance);
}
async function adapterStartMenuSend(startSides, menuData, appContext) {
    for (const menu of appContext.listOfMenus) {
        const startSide = startSides[menu];
        if (appContext.isUserActiveCheckbox[menu] && (0, appUtils_1.isStartside)(startSide)) {
            appContext.adapter.log.debug(`Startside: ${startSide}`);
            const group = appContext.menusWithUsers[menu];
            if (group) {
                for (const userToSend of group) {
                    const { nav, text, parse_mode } = menuData[menu][startSide];
                    const user = isUserActive(appContext, userToSend);
                    if (!user) {
                        continue;
                    }
                    appContext.backMenuRegistry.backMenuFunc({
                        activePage: startSide,
                        navigation: nav,
                        userToSend: userToSend.name,
                    });
                    appContext.adapter.log.debug(`User list: ${(0, string_1.jsonString)(appContext.userListWithChatID)}`);
                    await (0, telegram_1.sendToTelegram)({
                        instance: userToSend.instance,
                        userToSend: userToSend.name,
                        textToSend: text,
                        keyboard: nav,
                        appContext,
                        parse_mode,
                    });
                }
            }
        }
        else {
            if (!(0, appUtils_1.isStartside)(startSide)) {
                appContext.adapter.log.debug(`Menu "${menu}" is a Submenu.`);
                continue;
            }
            appContext.adapter.log.debug(`Menu "${menu}" is inactive.`);
        }
    }
}
//# sourceMappingURL=adapterStartMenuSend.js.map
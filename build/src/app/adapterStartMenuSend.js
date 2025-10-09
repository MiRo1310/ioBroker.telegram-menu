"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adapterStartMenuSend = adapterStartMenuSend;
const telegram_1 = require("./telegram");
const backMenu_1 = require("./backMenu");
const main_1 = require("../main");
const string_1 = require("../lib/string");
const appUtils_1 = require("../lib/appUtils");
function isUserActive(telegramParams, userToSend) {
    return telegramParams.userListWithChatID.find(user => user.chatID === userToSend.chatId && user.instance === userToSend.instance);
}
async function adapterStartMenuSend(listOfMenus, startSides, userActiveCheckbox, menusWithUsers, menuData, telegramParams) {
    for (const menu of listOfMenus) {
        const startSide = startSides[menu];
        if (userActiveCheckbox[menu] && (0, appUtils_1.isStartside)(startSide)) {
            main_1.adapter.log.debug(`Startside: ${startSide}`);
            const group = menusWithUsers[menu];
            if (group) {
                for (const userToSend of group) {
                    const { nav, text, parse_mode } = menuData[menu][startSide];
                    const user = isUserActive(telegramParams, userToSend);
                    if (!user) {
                        continue;
                    }
                    (0, backMenu_1.backMenuFunc)({ activePage: startSide, navigation: nav, userToSend: userToSend.name });
                    main_1.adapter.log.debug(`User list: ${(0, string_1.jsonString)(telegramParams.userListWithChatID)}`);
                    const params = { ...telegramParams };
                    await (0, telegram_1.sendToTelegram)({
                        instance: userToSend.instance,
                        userToSend: userToSend.name,
                        textToSend: text,
                        keyboard: nav,
                        telegramParams: params,
                        parse_mode,
                    });
                }
            }
        }
        else {
            if (!(0, appUtils_1.isStartside)(startSide)) {
                main_1.adapter.log.debug(`Menu "${menu}" is a Submenu.`);
                continue;
            }
            main_1.adapter.log.debug(`Menu "${menu}" is inactive.`);
        }
    }
}
//# sourceMappingURL=adapterStartMenuSend.js.map
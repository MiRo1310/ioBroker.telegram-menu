"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adapterStartMenuSend = adapterStartMenuSend;
const telegram_1 = require("./telegram");
const backMenu_1 = require("./backMenu");
const main_1 = require("../main");
const string_1 = require("../lib/string");
const appUtils_1 = require("../lib/appUtils");
async function adapterStartMenuSend(listOfMenus, startSides, userActiveCheckbox, menusWithUsers, menuData, userListWithChatID, instanceTelegram, resize_keyboard, one_time_keyboard) {
    for (const menu of listOfMenus) {
        const startSide = [startSides[menu]].toString();
        if (userActiveCheckbox[menu] && (0, appUtils_1.isStartside)(startSide)) {
            main_1.adapter.log.debug(`Startside: ${startSide}`);
            for (const userToSend of menusWithUsers[menu]) {
                (0, backMenu_1.backMenuFunc)({ nav: startSide, part: menuData[menu][startSide].nav, userToSend: userToSend });
                main_1.adapter.log.debug(`User list: ${(0, string_1.jsonString)(userListWithChatID)}`);
                await (0, telegram_1.sendToTelegram)({
                    userToSend,
                    textToSend: menuData[menu][startSide].text ?? '',
                    keyboard: menuData[menu][startSide].nav,
                    instanceTelegram,
                    resize_keyboard,
                    one_time_keyboard,
                    userListWithChatID,
                    parse_mode: menuData[menu][startSide].parse_mode ?? false,
                });
            }
        }
        else {
            if (startSide == '-') {
                main_1.adapter.log.debug(`Menu "${menu}" is a Submenu.`);
                continue;
            }
            main_1.adapter.log.debug(`Menu "${menu}" is inactive.`);
        }
    }
}
//# sourceMappingURL=adapterStartMenuSend.js.map
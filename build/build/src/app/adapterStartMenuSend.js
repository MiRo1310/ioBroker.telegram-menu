"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "__esModule", { value: true });
exports.adapterStartMenuSend = adapterStartMenuSend;
const telegram_1 = require("./telegram");
const backMenu_1 = require("./backMenu");
const main_1 = require("../main");
const string_1 = require("../lib/string");
async function adapterStartMenuSend(listOfMenus, startSides, userActiveCheckbox, menusWithUsers, menuData, userListWithChatID, instanceTelegram, resize_keyboard, one_time_keyboard) {
    for (const menu of listOfMenus) {
        const startSide = [startSides[menu]].toString();
        if (userActiveCheckbox[menu] && startSide != '-' && startSide != '') {
            main_1._this.log.debug(`Startseite: ${startSide}`);
            for (const user of menusWithUsers[menu]) {
                (0, backMenu_1.backMenuFunc)(startSide, menuData.data[menu][startSide].nav, user);
                main_1._this.log.debug(`User list: ${(0, string_1.jsonString)(userListWithChatID)}`);
                await (0, telegram_1.sendToTelegram)({
                    user: user,
                    textToSend: menuData.data[menu][startSide].text,
                    keyboard: menuData.data[menu][startSide].nav,
                    instance: instanceTelegram,
                    resize_keyboard: resize_keyboard,
                    one_time_keyboard: one_time_keyboard,
                    userListWithChatID: userListWithChatID,
                    parse_mode: menuData.data[menu][startSide].parse_mode,
                });
            }
        }
        else {
            if (startSide == '-') {
                main_1._this.log.debug(`Menu "${menu}" is a Submenu.`);
                continue;
            }
            main_1._this.log.debug(`Menu "${menu}" is inactive.`);
        }
    }
}

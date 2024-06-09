"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adapterStartMenuSend = void 0;
const telegram_1 = require("./telegram");
const backMenu_1 = require("./backMenu");
const logging_1 = require("./logging");
function adapterStartMenuSend(listOfMenus, startSides, userActiveCheckbox, menusWithUsers, menuData, userListWithChatID, instanceTelegram, resize_keyboard, one_time_keyboard) {
    listOfMenus.forEach((menu) => {
        const startSide = [startSides[menu]].toString();
        if (userActiveCheckbox[menu] && startSide != "-" && startSide != "") {
            (0, logging_1.debug)([{ text: "Startseite:", val: startSide }]);
            menusWithUsers[menu].forEach((user) => {
                (0, backMenu_1.backMenuFunc)(startSide, menuData.data[menu][startSide].nav, user);
                (0, logging_1.debug)([{ text: "User List:", val: userListWithChatID }]);
                (0, telegram_1.sendToTelegram)(user, menuData.data[menu][startSide].text, menuData.data[menu][startSide].nav, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, menuData.data[menu][startSide].parse_mode);
            });
        }
        else {
            if (startSide == "-") {
                (0, logging_1.debug)([{ text: `Menu "${menu}" is a Submenu.` }]);
                return;
            }
            (0, logging_1.debug)([{ text: `Menu "${menu}" is inactive.` }]);
        }
    });
}
exports.adapterStartMenuSend = adapterStartMenuSend;
//# sourceMappingURL=adapterStartMenuSend.js.map